-- =========================================================
-- Catálogo y stock: configuración de la base en Supabase
-- Pegar todo en: SQL Editor > New query > Run
-- =========================================================

create extension if not exists pgcrypto;

create table if not exists productos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  precio numeric not null default 0,
  costo numeric not null default 0,
  stock integer not null default 0,
  imagen_path text,
  creado timestamptz not null default now()
);

create table if not exists pedidos (
  id uuid primary key default gen_random_uuid(),
  cliente text not null default 'Pedido web',
  items jsonb not null,
  total numeric not null default 0,
  estado text not null default 'pendiente',
  fecha timestamptz not null default now(),
  cerrado timestamptz
);

create table if not exists movimientos (
  id uuid primary key default gen_random_uuid(),
  producto_id uuid references productos(id) on delete set null,
  nombre text not null,
  tipo text not null,
  cantidad integer not null,
  precio numeric not null default 0,
  costo numeric not null default 0,
  total numeric not null default 0,
  pedido_id uuid,
  fecha timestamptz not null default now()
);

alter table productos enable row level security;
alter table pedidos enable row level security;
alter table movimientos enable row level security;

-- Catálogo: lo ve cualquiera
create policy "catalogo publico" on productos for select to anon, authenticated using (true);
-- Personal: carga, edita y borra productos
create policy "personal productos" on productos for all to authenticated using (true) with check (true);

-- Pedidos: los clientes crean, solo el personal los lee y los cambia
create policy "clientes crean pedidos" on pedidos for insert to anon, authenticated with check (true);
create policy "personal lee pedidos" on pedidos for select to authenticated using (true);
create policy "personal cambia pedidos" on pedidos for update to authenticated using (true) with check (true);

-- Movimientos: solo personal
create policy "personal movimientos" on movimientos for all to authenticated using (true) with check (true);

-- Ajuste de stock (sumar, restar, vender) en una sola operación
create or replace function ajustar_stock(p_id uuid, p_tipo text, p_cantidad integer)
returns void
language plpgsql
as $$
declare
  prod productos%rowtype;
  delta integer;
begin
  if p_cantidad is null or p_cantidad <= 0 then
    raise exception 'cantidad invalida';
  end if;
  if p_tipo not in ('entrada', 'salida', 'venta') then
    raise exception 'tipo invalido';
  end if;
  select * into prod from productos where id = p_id for update;
  if not found then
    raise exception 'producto inexistente';
  end if;
  if p_tipo = 'entrada' then
    delta := p_cantidad;
  else
    if p_cantidad > prod.stock then
      raise exception 'stock insuficiente de %', prod.nombre;
    end if;
    delta := -p_cantidad;
  end if;
  update productos set stock = stock + delta where id = p_id;
  insert into movimientos (producto_id, nombre, tipo, cantidad, precio, costo, total)
  values (p_id, prod.nombre, p_tipo, p_cantidad, prod.precio, prod.costo,
          case when p_tipo = 'venta' then p_cantidad * prod.precio else 0 end);
end;
$$;

-- Entrega de un pedido: descuenta todo el stock y registra las ventas
create or replace function entregar_pedido(p_id uuid)
returns void
language plpgsql
as $$
declare
  ped pedidos%rowtype;
  it jsonb;
  prod productos%rowtype;
  cant integer;
begin
  select * into ped from pedidos where id = p_id for update;
  if not found or ped.estado <> 'pendiente' then
    raise exception 'pedido no pendiente';
  end if;
  for it in select value from jsonb_array_elements(ped.items) loop
    cant := (it->>'cantidad')::integer;
    select * into prod from productos where id = (it->>'id')::uuid for update;
    if not found or prod.stock < cant then
      raise exception 'falta stock de %', coalesce(it->>'nombre', 'un producto');
    end if;
    update productos set stock = stock - cant where id = prod.id;
    insert into movimientos (producto_id, nombre, tipo, cantidad, precio, costo, total, pedido_id)
    values (prod.id, prod.nombre, 'venta', cant, (it->>'precio')::numeric, prod.costo,
            cant * (it->>'precio')::numeric, p_id);
  end loop;
  update pedidos set estado = 'entregado', cerrado = now() where id = p_id;
end;
$$;

-- Solo el personal autenticado puede llamar a estas funciones
revoke execute on function ajustar_stock(uuid, text, integer) from public, anon;
revoke execute on function entregar_pedido(uuid) from public, anon;
grant execute on function ajustar_stock(uuid, text, integer) to authenticated;
grant execute on function entregar_pedido(uuid) to authenticated;

-- Fotos de referencia
insert into storage.buckets (id, name, public) values ('fotos', 'fotos', true)
on conflict (id) do nothing;

create policy "fotos lectura publica" on storage.objects for select to anon, authenticated using (bucket_id = 'fotos');
create policy "personal sube fotos" on storage.objects for insert to authenticated with check (bucket_id = 'fotos');
create policy "personal reemplaza fotos" on storage.objects for update to authenticated using (bucket_id = 'fotos') with check (bucket_id = 'fotos');

-- Actualizaciones en vivo entre dispositivos
alter publication supabase_realtime add table productos, pedidos, movimientos;

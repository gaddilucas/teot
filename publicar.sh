#!/usr/bin/env bash
# Guarda los cambios, los sube a GitHub y activa GitHub Pages.
# Uso (desde la raíz del proyecto, en Codespaces):  bash scripts/publicar.sh [nombre-del-repo]
set -euo pipefail

cd "$(dirname "$0")/.."
REPO="${1:-catalogo}"

for f in index.html js/app.js css/base.css supabase/setup.sql; do
  if [ ! -f "$f" ]; then
    echo "Falta el archivo $f. Revisá que subiste la carpeta completa."
    exit 1
  fi
done

if [ ! -d .git ]; then
  git init -q
fi
git branch -M main

git add -A
if git diff --cached --quiet; then
  echo "No hay cambios nuevos para guardar."
else
  git commit -q -m "Actualización del catálogo"
  echo "Cambios guardados en git."
fi

if git remote get-url origin >/dev/null 2>&1; then
  git push -u origin main
else
  if ! command -v gh >/dev/null 2>&1; then
    echo "No hay repositorio remoto y falta GitHub CLI (gh)."
    echo "Creá el repositorio público en github.com y agregalo con: git remote add origin URL"
    exit 1
  fi
  gh repo create "$REPO" --public --source=. --remote=origin --push
fi

# Datos del repositorio a partir de la URL del remoto
URL="$(git remote get-url origin)"
OWNER="$(echo "$URL" | sed -E 's#.*[:/]([^/]+)/([^/]+)$#\1#')"
NOMBRE="$(echo "$URL" | sed -E 's#.*[:/]([^/]+)/([^/]+)$#\2#; s#\.git$##')"

if command -v gh >/dev/null 2>&1 && \
   { gh api -X POST "repos/$OWNER/$NOMBRE/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1 \
     || gh api -X PUT "repos/$OWNER/$NOMBRE/pages" -f "source[branch]=main" -f "source[path]=/" >/dev/null 2>&1; }; then
  echo "GitHub Pages activado."
else
  echo "No pude activar Pages automáticamente."
  echo "Activalo a mano: Settings > Pages > Deploy from a branch > main / (root)."
fi

echo ""
echo "Tu página va a estar en: https://$OWNER.github.io/$NOMBRE/"
echo "Puede tardar uno o dos minutos la primera vez."

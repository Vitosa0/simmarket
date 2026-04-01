#!/bin/zsh
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR" || exit 1
if [ ! -d node_modules ]; then
  echo "Instalando dependencias..."
  npm install || exit 1
fi
npm run dist:win

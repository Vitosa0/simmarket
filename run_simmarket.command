#!/bin/zsh
ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_BUNDLE="$ROOT_DIR/dist/mac-arm64/SimMarket.app"
if [ -d "$APP_BUNDLE" ]; then
  osascript -e 'tell application "SimMarket" to quit' >/dev/null 2>&1
  sleep 1
  open -n "$APP_BUNDLE"
  exit 0
fi

cd "$ROOT_DIR" || exit 1
if [ ! -d node_modules ]; then
  echo "Instalando dependencias..."
  npm install || exit 1
fi
npm start

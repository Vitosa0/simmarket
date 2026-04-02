#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PAYLOAD_DIR="$ROOT_DIR/build/pkg-root"
SCRIPTS_DIR="$ROOT_DIR/scripts/pkg"
COMPONENT_PLIST="$ROOT_DIR/scripts/pkg/component.plist"
VERSION="$(cd "$ROOT_DIR" && node -p "require('./package.json').version")"

if [ -d "$ROOT_DIR/dist/mac-universal/SimMarket.app" ]; then
  APP_PATH="$ROOT_DIR/dist/mac-universal/SimMarket.app"
  PKG_ARCH="universal"
elif [ -d "$ROOT_DIR/dist/mac-arm64/SimMarket.app" ]; then
  APP_PATH="$ROOT_DIR/dist/mac-arm64/SimMarket.app"
  PKG_ARCH="arm64"
elif [ -d "$ROOT_DIR/dist/mac/SimMarket.app" ]; then
  APP_PATH="$ROOT_DIR/dist/mac/SimMarket.app"
  PKG_ARCH="universal"
else
  APP_PATH="$ROOT_DIR/dist/mac-universal/SimMarket.app"
  PKG_ARCH="universal"
fi

PKG_PATH="$ROOT_DIR/dist/SimMarket-Installer-${VERSION}-${PKG_ARCH}.pkg"

if [ ! -d "$APP_PATH" ]; then
  echo "No existe $APP_PATH. Ejecuta primero el build de macOS." >&2
  exit 1
fi

rm -rf "$PAYLOAD_DIR"
mkdir -p "$PAYLOAD_DIR/Applications"
ditto "$APP_PATH" "$PAYLOAD_DIR/Applications/SimMarket.app"
cp "$SCRIPTS_DIR/uninstall-simmarket.command" "$PAYLOAD_DIR/Applications/Desinstalar SimMarket.command"
chmod +x "$PAYLOAD_DIR/Applications/Desinstalar SimMarket.command"

pkgbuild \
  --root "$PAYLOAD_DIR" \
  --scripts "$SCRIPTS_DIR" \
  --component-plist "$COMPONENT_PLIST" \
  --identifier "com.javi.simmarket.installer" \
  --version "$VERSION" \
  --install-location "/" \
  "$PKG_PATH"

echo "Instalador generado en $PKG_PATH"

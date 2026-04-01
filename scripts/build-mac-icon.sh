#!/bin/bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
CUSTOM_ICNS_PATH="$ROOT_DIR/src/assets/branding/app-icon-source.icns"
SVG_PATH="$ROOT_DIR/src/assets/branding/simmarket-mark.svg"
PNG_PATH="$ROOT_DIR/src/assets/branding/simmarket-mark-1024.png"
PREVIEW_DIR="$ROOT_DIR/build/icon-preview"
EXTRACT_ICONSET_DIR="$PREVIEW_DIR/custom-icon-source.iconset"
ICONSET_DIR="$ROOT_DIR/build/SimMarket.iconset"
MASTER_PNG="$PREVIEW_DIR/simmarket-mark-1024.png"
SOURCE_PNG="$PREVIEW_DIR/$(basename "$SVG_PATH").png"
ICNS_PATH="$ROOT_DIR/build/SimMarket.icns"

mkdir -p "$PREVIEW_DIR"
rm -rf "$ICONSET_DIR"

if [ -f "$CUSTOM_ICNS_PATH" ]; then
  cp -f "$CUSTOM_ICNS_PATH" "$ICNS_PATH"
  if [ -f "$PNG_PATH" ]; then
    cp -f "$PNG_PATH" "$MASTER_PNG"
  fi
  echo "Icono generado en $ICNS_PATH"
  exit 0
fi

if [ -f "$PNG_PATH" ]; then
  cp -f "$PNG_PATH" "$MASTER_PNG"
else
  qlmanage -t -s 1024 -o "$PREVIEW_DIR" "$SVG_PATH" >/dev/null

  if [ ! -f "$SOURCE_PNG" ]; then
    echo "No se pudo generar el PNG maestro desde el SVG." >&2
    exit 1
  fi

  mv -f "$SOURCE_PNG" "$MASTER_PNG"
fi

mkdir -p "$ICONSET_DIR"

for size in 16 32 128 256 512; do
  sips -z "$size" "$size" "$MASTER_PNG" --out "$ICONSET_DIR/icon_${size}x${size}.png" >/dev/null
  double_size=$((size * 2))
  sips -z "$double_size" "$double_size" "$MASTER_PNG" --out "$ICONSET_DIR/icon_${size}x${size}@2x.png" >/dev/null
done

iconutil --convert icns --output "$ICNS_PATH" "$ICONSET_DIR"
echo "Icono generado en $ICNS_PATH"

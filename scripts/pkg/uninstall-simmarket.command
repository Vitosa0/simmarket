#!/bin/bash
set -euo pipefail

APP_PATH="/Applications/SimMarket.app"
UNINSTALL_PATH="/Applications/Desinstalar SimMarket.command"
DESKTOP_LINK="$HOME/Desktop/SimMarket.app"
DATA_DIR="$HOME/Library/Application Support/simmarket-vito"

read -r -d '' APPLESCRIPT <<'OSA' || true
display dialog "Esto va a borrar SimMarket, el acceso del escritorio y todos tus datos guardados. ¿Querés continuar?" buttons {"Cancelar", "Desinstalar"} default button "Desinstalar" with icon caution
OSA

if ! osascript -e "$APPLESCRIPT" >/dev/null 2>&1; then
  exit 0
fi

ESCAPED_APP_PATH="${APP_PATH//\"/\\\"}"
ESCAPED_UNINSTALL_PATH="${UNINSTALL_PATH//\"/\\\"}"
ESCAPED_DESKTOP_LINK="${DESKTOP_LINK//\"/\\\"}"
ESCAPED_DATA_DIR="${DATA_DIR//\"/\\\"}"

read -r -d '' REMOVE_SCRIPT <<OSA || true
do shell script "rm -rf \"$ESCAPED_APP_PATH\" \"$ESCAPED_DESKTOP_LINK\" \"$ESCAPED_DATA_DIR\" \"$ESCAPED_UNINSTALL_PATH\"" with administrator privileges
OSA

osascript -e "$REMOVE_SCRIPT"
osascript -e 'display dialog "SimMarket fue desinstalado por completo." buttons {"OK"} default button "OK"'

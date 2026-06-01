#!/usr/bin/env bash
#
# restart.sh — reinicia el servidor de desarrollo (bajar + levantar).
#
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
source "$SCRIPT_DIR/common.sh"

info "Reiniciando servidor de desarrollo…"
"$SCRIPT_DIR/stop.sh"
sleep 0.5
"$SCRIPT_DIR/start.sh"

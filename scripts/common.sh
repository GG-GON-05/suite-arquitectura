#!/usr/bin/env bash
#
# common.sh — configuración y utilidades compartidas por los scripts de servicios.
# Se importa con:  source "$(dirname "$0")/common.sh"
#
set -euo pipefail

# ── Rutas del proyecto ──
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_DIR="$ROOT_DIR/logs"
RUN_DIR="$ROOT_DIR/scripts/.run"   # PID files (ignorado por git vía scripts/.gitignore)

# ── Configuración del servicio: servidor de desarrollo Vite ──
DEV_PORT="${DEV_PORT:-5173}"
DEV_PID_FILE="$RUN_DIR/vite.pid"
DEV_LOG_FILE="$LOG_DIR/vite.log"
DEV_BIN="$ROOT_DIR/node_modules/.bin/vite"

mkdir -p "$LOG_DIR" "$RUN_DIR"

# ── Colores (solo si es una terminal) ──
if [ -t 1 ]; then
  C_GREEN="$(printf '\033[0;32m')"; C_RED="$(printf '\033[0;31m')"
  C_YELLOW="$(printf '\033[0;33m')"; C_BLUE="$(printf '\033[0;34m')"
  C_DIM="$(printf '\033[2m')"; C_RESET="$(printf '\033[0m')"
else
  C_GREEN=""; C_RED=""; C_YELLOW=""; C_BLUE=""; C_DIM=""; C_RESET=""
fi

info()  { printf '%s▸%s %s\n' "$C_BLUE"  "$C_RESET" "$*"; }
ok()    { printf '%s✓%s %s\n' "$C_GREEN" "$C_RESET" "$*"; }
warn()  { printf '%s!%s %s\n' "$C_YELLOW" "$C_RESET" "$*"; }
err()   { printf '%s✗%s %s\n' "$C_RED"   "$C_RESET" "$*" >&2; }

# ── ¿Está vivo el PID guardado? Imprime el PID si lo está ──
dev_running_pid() {
  if [ -f "$DEV_PID_FILE" ]; then
    local pid
    pid="$(cat "$DEV_PID_FILE" 2>/dev/null || true)"
    if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
      echo "$pid"
      return 0
    fi
  fi
  return 1
}

# ── PID(s) que ocupan el puerto de desarrollo (fallback si no hay pidfile) ──
dev_port_pids() {
  lsof -ti "tcp:$DEV_PORT" -sTCP:LISTEN 2>/dev/null || true
}

# ── Comprobar prerequisitos ──
require_deps() {
  if [ ! -x "$DEV_BIN" ]; then
    err "No se encuentra Vite en node_modules. Ejecutá:  npm install"
    exit 1
  fi
}

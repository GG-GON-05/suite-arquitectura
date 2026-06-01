#!/usr/bin/env bash
#
# stop.sh — baja el servidor de desarrollo (Vite).
#
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

stopped=0

# 1) Parar por PID file.
if pid="$(dev_running_pid)"; then
  info "Deteniendo servidor (PID $pid)…"
  kill "$pid" 2>/dev/null || true
  # Esperar terminación ordenada; forzar si hace falta.
  for _ in $(seq 1 25); do
    kill -0 "$pid" 2>/dev/null || break
    sleep 0.2
  done
  if kill -0 "$pid" 2>/dev/null; then
    warn "No respondió, forzando (SIGKILL)…"
    kill -9 "$pid" 2>/dev/null || true
  fi
  stopped=1
fi
rm -f "$DEV_PID_FILE"

# 2) Fallback: cualquier proceso que siga ocupando el puerto.
leftover="$(dev_port_pids)"
if [ -n "$leftover" ]; then
  warn "Liberando el puerto $DEV_PORT (PIDs: $leftover)…"
  # shellcheck disable=SC2086
  kill -9 $leftover 2>/dev/null || true
  stopped=1
fi

if [ "$stopped" -eq 1 ]; then
  ok "Servidor detenido."
else
  warn "No había ningún servidor corriendo."
fi

#!/usr/bin/env bash
#
# start.sh — levanta el servidor de desarrollo (Vite) en segundo plano.
#
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

require_deps

# ¿Ya está corriendo?
if pid="$(dev_running_pid)"; then
  warn "El servidor ya está corriendo (PID $pid) en http://localhost:$DEV_PORT"
  exit 0
fi

# ¿Puerto ocupado por otro proceso?
if [ -n "$(dev_port_pids)" ]; then
  err "El puerto $DEV_PORT ya está en uso por otro proceso: $(dev_port_pids)"
  err "Cerralo o cambiá el puerto con  DEV_PORT=xxxx $0"
  exit 1
fi

info "Levantando servidor de desarrollo en el puerto ${DEV_PORT}…"

# Arrancar Vite directamente (PID = el propio proceso de Vite, fácil de gestionar).
cd "$ROOT_DIR"
nohup "$DEV_BIN" --port "$DEV_PORT" > "$DEV_LOG_FILE" 2>&1 &
echo $! > "$DEV_PID_FILE"

# Esperar a que el puerto responda (máx ~10s).
for _ in $(seq 1 50); do
  if curl -s -o /dev/null "http://localhost:$DEV_PORT/"; then
    ok "Servidor listo → ${C_BLUE}http://localhost:$DEV_PORT${C_RESET}  (PID $(cat "$DEV_PID_FILE"))"
    printf '%s  logs: %s%s\n' "$C_DIM" "$DEV_LOG_FILE" "$C_RESET"
    exit 0
  fi
  # Si el proceso murió durante el arranque, mostrar el log.
  if ! dev_running_pid >/dev/null; then
    err "El servidor no arrancó. Últimas líneas del log:"
    tail -n 15 "$DEV_LOG_FILE" >&2
    rm -f "$DEV_PID_FILE"
    exit 1
  fi
  sleep 0.2
done

warn "El servidor arrancó pero aún no responde. Revisá:  tail -f $DEV_LOG_FILE"

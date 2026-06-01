#!/usr/bin/env bash
#
# status.sh — muestra el estado del servidor de desarrollo.
#
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/common.sh"

printf '%s── Servidor de desarrollo (Vite) ──%s\n' "$C_DIM" "$C_RESET"

if pid="$(dev_running_pid)"; then
  ok "CORRIENDO  ·  PID $pid  ·  http://localhost:$DEV_PORT"
  # Responde HTTP?
  if curl -s -o /dev/null "http://localhost:$DEV_PORT/"; then
    printf '   %sHTTP: responde (200 OK)%s\n' "$C_DIM" "$C_RESET"
  else
    warn "   El proceso vive pero el puerto aún no responde."
  fi
  printf '   %slog:  %s%s\n' "$C_DIM" "$DEV_LOG_FILE" "$C_RESET"
  exit 0
fi

# Sin pidfile válido, pero ¿hay algo en el puerto?
leftover="$(dev_port_pids)"
if [ -n "$leftover" ]; then
  warn "Hay un proceso en el puerto $DEV_PORT sin gestionar por estos scripts (PIDs: $leftover)."
  exit 0
fi

err "DETENIDO  ·  no hay servidor en el puerto $DEV_PORT"
exit 0

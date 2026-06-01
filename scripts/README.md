# Scripts de servicios

Gestión del servidor de desarrollo (Vite) de la Suite de Arquitectura.

| Script         | Acción                                   | Atajo npm        |
| -------------- | ---------------------------------------- | ---------------- |
| `start.sh`     | Levanta el servidor en segundo plano     | `npm run up`     |
| `stop.sh`      | Baja el servidor                         | `npm run down`   |
| `restart.sh`   | Reinicia (baja + levanta)                | `npm run reup`   |
| `status.sh`    | Muestra el estado y si responde por HTTP | `npm run status` |

## Uso

```bash
./scripts/start.sh        # o: npm run up
./scripts/status.sh       # o: npm run status
./scripts/stop.sh         # o: npm run down
```

## Detalles

- El servidor arranca en `http://localhost:5173`. Cambiá el puerto con la variable
  de entorno `DEV_PORT`:  `DEV_PORT=3000 ./scripts/start.sh`.
- Los **logs** se guardan en `logs/vite.log`.  Seguilos en vivo con `tail -f logs/vite.log`.
- Los **PID files** viven en `scripts/.run/` (ignorado por git).
- Para depurar en primer plano (sin estos scripts), usá `npm run dev`.

## Añadir más servicios

La configuración está centralizada en [`common.sh`](common.sh). Para gestionar otro
servicio (p.ej. una API), añadí allí sus variables (`PID_FILE`, `LOG_FILE`, puerto…) y
reutilizá las funciones `info/ok/warn/err` y el patrón de `start/stop`.

/**
 * Lógica pura para el cálculo de rampas y su accesibilidad.
 * Medidas de longitud en cm; pendiente en %; ángulo en grados.
 *
 * Referencia de pendientes accesibles (CTE DB-SUA 1, "Rampas"), según la
 * proyección horizontal del tramo:
 *   - tramo < 3 m  → 10 % máx.
 *   - 3 m ≤ tramo < 6 m → 8 % máx.
 *   - tramo ≥ 6 m  → 6 % máx.
 *   - longitud máxima de tramo: 9 m (luego requiere rellano intermedio).
 */

export const RAMP_GUIDE = {
  slope: { label: 'Pendiente', unit: '%', ideal: '≤ 6–10' },
  angle: { label: 'Inclinación', unit: '°', ideal: '≤ 6' },
}

const MAX_TRAMO_CM = 900 // 9 m: longitud máxima de un tramo

/** Pendiente máxima accesible (%) según la longitud horizontal del tramo. */
export function maxAccessibleSlope(runCm) {
  const m = runCm / 100
  if (m < 3) return 10
  if (m < 6) return 8
  return 6
}

/**
 * Pendiente accesible "óptima": la más pronunciada que sigue cumpliendo (la
 * rampa más corta posible). Se deduce de qué banda de longitud alcanza cada
 * pendiente para la altura dada.
 */
export function optimalSlope(riseCm) {
  if (riseCm < 30) return 10 // run < 3 m
  if (riseCm < 48) return 8 // run < 6 m
  return 6 // run ≥ 6 m
}

/**
 * Calcula una rampa a partir de la altura y, según el modo, de la pendiente
 * fijada o de la longitud disponible.
 * @param {{ totalHeight:number, mode:('slope'|'length'), slopePct?:number, run?:number }} opts
 */
export function computeRamp({ totalHeight, mode, slopePct, run }) {
  const rise = totalHeight
  let s, r

  if (mode === 'length') {
    r = run
    s = r > 0 ? (rise / r) * 100 : Infinity
  } else {
    s = slopePct
    r = s > 0 ? rise / (s / 100) : Infinity
  }

  const angle = (Math.atan2(rise, r) * 180) / Math.PI
  const inclined = Math.sqrt(rise * rise + r * r) // longitud real de la rampa
  const maxSlope = maxAccessibleSlope(r)
  const accessible = isFinite(s) && s <= maxSlope + 1e-9

  let status
  if (accessible) status = 'ok'
  else if (isFinite(s) && s <= 12) status = 'warn'
  else status = 'bad'

  const needsLanding = isFinite(r) && r > MAX_TRAMO_CM
  const tramos = isFinite(r) ? Math.max(1, Math.ceil(r / MAX_TRAMO_CM)) : 1

  return { rise, run: r, slopePct: s, angle, inclined, maxSlope, accessible, status, needsLanding, tramos }
}

export const RAMP_MSG = {
  ok: { icon: '✓', text: 'Cumple como rampa accesible (CTE DB-SUA).' },
  warn: { icon: '!', text: 'No cumple rampa accesible, pero es una pendiente practicable.' },
  bad: { icon: '✗', text: 'Pendiente excesiva: difícil o no transitable.' },
}

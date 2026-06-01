/**
 * Lógica pura para el cálculo de escaleras.
 * Todas las medidas en centímetros salvo el ángulo (grados).
 *
 * Conceptos:
 *  - Contrahuella (riser): altura vertical de cada escalón.
 *  - Huella (tread): profundidad horizontal de cada escalón.
 *  - Nº de contrahuellas = nº de escalones; nº de huellas = escalones − 1
 *    (el último nivel es ya el piso superior).
 *  - Fórmula de Blondel (ley del paso): 2·CH + H ≈ 63 cm (paso humano medio).
 */

/* ── Rangos recomendados (cm / grados) para uso en viviendas ── */
export const STAIR_GUIDE = {
  riser: { label: 'Contrahuella', unit: 'cm', ideal: '16–18' },
  tread: { label: 'Huella', unit: 'cm', ideal: '≥ 28' },
  blondel: { label: 'Blondel (2·CH + H)', unit: 'cm', ideal: '62–64' },
  angle: { label: 'Inclinación', unit: '°', ideal: '30–36' },
}

const RISER_IDEAL = 17.5 // contrahuella objetivo para sugerir nº de escalones
const BLONDEL_OPTIMAL = 63 // valor óptimo de la ley del paso

/** Nº de escalones sugerido para una altura dada (busca contrahuella ≈ 17,5 cm). */
export function suggestSteps(totalHeightCm) {
  if (!isFinite(totalHeightCm) || totalHeightCm <= 0) return 2
  return Math.max(2, Math.round(totalHeightCm / RISER_IDEAL))
}

/** Huella sugerida a partir de la contrahuella, despejando Blondel (acotada 24–36 cm). */
export function suggestTread(riserCm) {
  const t = BLONDEL_OPTIMAL - 2 * riserCm
  return clamp(Math.round(t * 2) / 2, 24, 36)
}

function clamp(v, lo, hi) {
  return Math.min(hi, Math.max(lo, v))
}

/** Clasifica un valor en 'ok' (verde) / 'warn' (ámbar) / 'bad' (rojo). */
function band(v, greenLo, greenHi, yellowLo, yellowHi) {
  if (v >= greenLo && v <= greenHi) return 'ok'
  if (v >= yellowLo && v <= yellowHi) return 'warn'
  return 'bad'
}

const STATUS_ORDER = { ok: 0, warn: 1, bad: 2 }

/**
 * Calcula todas las magnitudes de una escalera y evalúa su comodidad.
 * @param {{ totalHeight:number, nSteps:number, tread:number }} opts
 */
export function computeStairs({ totalHeight, nSteps, tread }) {
  const riser = totalHeight / nSteps
  const nTreads = Math.max(nSteps - 1, 0)
  const blondel = 2 * riser + tread
  const angle = (Math.atan2(riser, tread) * 180) / Math.PI
  const run = nTreads * tread // desarrollo horizontal del tramo

  const status = {
    riser: band(riser, 16, 18, 13, 18.5),
    tread: tread >= 28 ? 'ok' : tread >= 25 ? 'warn' : 'bad',
    blondel: band(blondel, 62, 64, 60, 66),
    angle: band(angle, 30, 36, 25, 38),
  }
  const overall = Object.values(status).reduce(
    (worst, s) => (STATUS_ORDER[s] > STATUS_ORDER[worst] ? s : worst),
    'ok',
  )

  return { riser, tread, nSteps, nTreads, blondel, angle, run, status, overall }
}

/** Mensaje resumen de comodidad según el estado global. */
export const COMFORT_MSG = {
  ok: { icon: '✓', text: 'Escalera cómoda. Cumple la relación de Blondel.' },
  warn: { icon: '!', text: 'Escalera utilizable, pero se puede mejorar la comodidad.' },
  bad: { icon: '✗', text: 'Proporciones fuera del rango recomendado. Conviene revisar las medidas.' },
}

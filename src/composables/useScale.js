/**
 * Lógica pura de conversión de escalas arquitectónicas.
 * Sin dependencias del DOM — reutilizable en cualquier módulo de la suite
 * (conversor, cálculo de áreas, etc.).
 */

/* ── Unidades disponibles y su factor a milímetros (base interna) ── */
export const UNITS = ['mm', 'cm', 'm', 'in', 'ft']

export const TO_MM = { mm: 1, cm: 10, m: 1000, in: 25.4, ft: 304.8 }

/* ── Presets de escala más habituales en arquitectura ── */
export const SCALE_PRESETS = [1, 25, 50, 75, 100, 125, 200, 500]

/**
 * Convierte un valor entre dos unidades de longitud.
 * @param {number} value - valor en la unidad de origen
 * @param {string} from   - unidad de origen ('mm'|'cm'|'m'|'in'|'ft')
 * @param {string} to     - unidad de destino
 * @returns {number} valor convertido a la unidad de destino
 */
export function convert(value, from, to) {
  return (value * TO_MM[from]) / TO_MM[to]
}

/**
 * Formatea un número: hasta 6 decimales, eliminando ceros finales.
 * Devuelve '—' para valores no finitos.
 */
export function fmt(n) {
  if (!isFinite(n)) return '—'
  return parseFloat(n.toFixed(6)).toString()
}

/**
 * Calcula la conversión de una medida según el modo y la escala.
 *
 * @param {object} opts
 * @param {number} opts.value      - medida de entrada
 * @param {'real'|'plan'} opts.mode - 'real' = real→plano (dividir), 'plan' = plano→real (multiplicar)
 * @param {number} opts.scale      - denominador de la escala (ej. 50 para 1:50)
 * @param {string} opts.unit       - unidad de la medida de entrada
 * @param {string} opts.resultUnit - unidad deseada del resultado
 * @returns {{ result: number, operation: string } | null} null si la entrada no es válida
 */
export function computeScale({ value, mode, scale, unit, resultUnit }) {
  if (!isFinite(value) || value < 0) return null
  if (!scale || scale <= 0) return null

  let rawResult, symbol
  if (mode === 'real') {
    // Real → Plano: dividir por la escala
    rawResult = value / scale
    symbol = '÷'
  } else {
    // Plano → Real: multiplicar por la escala
    rawResult = value * scale
    symbol = '×'
  }

  const result = convert(rawResult, unit, resultUnit)
  const tail = resultUnit !== unit ? ` = ${fmt(result)} ${resultUnit}` : ''
  const operation =
    `${fmt(value)} ${unit} ${symbol} ${scale} = ${fmt(rawResult)} ${unit}${tail}`

  return { result, operation }
}

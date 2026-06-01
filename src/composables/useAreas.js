/**
 * Lógica pura para el cálculo de superficies.
 * Dimensiones en metros; áreas en m².
 */

/** Área de una estancia rectangular (ancho × largo). 0 si los datos no son válidos. */
export function roomArea(w, l) {
  const a = (parseFloat(w) || 0) * (parseFloat(l) || 0)
  return a > 0 ? a : 0
}

/** Suma de las áreas de todas las estancias (superficie útil). */
export function totalUseful(rooms) {
  return rooms.reduce((s, r) => s + roomArea(r.w, r.l), 0)
}

/** Superficie construida estimada = útil × (1 + muros y circulaciones %). */
export function builtArea(useful, wallPct) {
  return useful * (1 + (parseFloat(wallPct) || 0) / 100)
}

/** Formatea un área a 2 decimales como máximo, sin ceros sobrantes. */
export function fmtArea(n) {
  return (Math.round(n * 100) / 100).toString()
}

/**
 * Genera el cuadro de superficies como texto (columnas separadas por tabulador,
 * pegable en una hoja de cálculo).
 */
export function exportText(rooms, wallPct) {
  const lines = ['CUADRO DE SUPERFICIES', '']
  rooms.forEach((r) => {
    const a = roomArea(r.w, r.l)
    if (a <= 0) return
    lines.push(`${r.name || 'Estancia'}\t${+r.w || 0} × ${+r.l || 0} m\t${fmtArea(a)} m²`)
  })
  const useful = totalUseful(rooms)
  lines.push('')
  lines.push(`Superficie útil total\t\t${fmtArea(useful)} m²`)
  lines.push(`Muros y circulaciones\t\t${wallPct} %`)
  lines.push(`Superficie construida\t\t${fmtArea(builtArea(useful, wallPct))} m²`)
  return lines.join('\n')
}

/** Paleta para distinguir estancias en la barra y la tabla. */
export const AREA_PALETTE = [
  '#5B6AF0',
  '#F06A5B',
  '#2ECC8F',
  '#F0A020',
  '#9B6AF0',
  '#20C0D0',
  '#F06AA0',
  '#7A8AF0',
  '#C0B020',
  '#50B070',
]

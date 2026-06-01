/**
 * Geometría solar pura (sin dependencias de Three.js).
 * Calcula la posición del sol —altura y azimut— para una latitud, día del año
 * y hora solar dados. Sirve tanto para la escena 3D como para los resultados.
 *
 * Convenciones de la escena 3D:
 *   +X = Este, +Z = Norte, +Y = arriba (cenit).
 *   Azimut medido desde el Norte, en sentido horario (0=N, 90=E, 180=S, 270=O).
 */

const DEG = Math.PI / 180

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/** Declinación solar (grados) para el día del año n (1–365). */
export function declination(n) {
  return 23.45 * Math.sin(DEG * (360 / 365) * (284 + n))
}

/**
 * Posición del sol.
 * @param {{ latitude:number, dayOfYear:number, hour:number }} opts
 *   latitude en grados (N positivo), hour en horas solares (0–24).
 * @returns altura/azimut en grados y radianes, y un vector dirección hacia el sol.
 */
export function computeSun({ latitude, dayOfYear, hour }) {
  const lat = latitude * DEG
  const dec = declination(dayOfYear) * DEG
  const H = (hour - 12) * 15 * DEG // ángulo horario (rad): − mañana, + tarde

  const sinAlt = Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(H)
  const altitude = Math.asin(clamp(sinAlt, -1, 1))

  // Azimut desde el Norte (horario). Se resuelve el lado E/O con el signo de H.
  const cosAz =
    (Math.sin(dec) - Math.sin(altitude) * Math.sin(lat)) /
    (Math.cos(altitude) * Math.cos(lat) || 1e-9)
  let azimuth = Math.acos(clamp(cosAz, -1, 1))
  if (H > 0) azimuth = 2 * Math.PI - azimuth // tarde → Oeste

  // Vector dirección desde el origen hacia el sol.
  const dir = {
    x: Math.cos(altitude) * Math.sin(azimuth), // Este
    y: Math.sin(altitude), // arriba
    z: Math.cos(altitude) * Math.cos(azimuth), // Norte
  }

  return {
    altitudeRad: altitude,
    azimuthRad: azimuth,
    altitudeDeg: altitude / DEG,
    azimuthDeg: azimuth / DEG,
    isDay: altitude > 0,
    dir,
  }
}

/**
 * Longitud de la sombra proyectada por un objeto vertical de altura `height`.
 * Devuelve null si el sol está bajo el horizonte.
 */
export function shadowLength(height, altitudeRad) {
  if (altitudeRad <= 0) return null
  return height / Math.tan(altitudeRad)
}

/* ── Utilidades de fecha (día del año ↔ etiqueta) ── */
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
const CUM_DAYS = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334] // no bisiesto

/** Convierte día del año (1–365) en una etiqueta tipo "21 jun". */
export function dayLabel(n) {
  const day = clamp(Math.round(n), 1, 365)
  let m = 11
  while (m > 0 && day <= CUM_DAYS[m]) m--
  return `${day - CUM_DAYS[m]} ${MONTHS[m]}`
}

/** Convierte una hora decimal (p. ej. 14.5) en "14:30". */
export function hourLabel(h) {
  const hh = Math.floor(h)
  const mm = Math.round((h - hh) * 60)
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

/** Fechas clave para el estudio de soleamiento (hemisferio neutro). */
export const DATE_PRESETS = [
  { label: '21 mar', day: 80, hint: 'Equinoccio' },
  { label: '21 jun', day: 172, hint: 'Solsticio' },
  { label: '21 sep', day: 264, hint: 'Equinoccio' },
  { label: '21 dic', day: 355, hint: 'Solsticio' },
]

/** Ciudades de referencia (latitud N positiva, longitud E positiva). */
export const CITY_PRESETS = [
  { name: 'Madrid', lat: 40.4, lon: -3.7 },
  { name: 'Barcelona', lat: 41.4, lon: 2.2 },
  { name: 'Buenos Aires', lat: -34.6, lon: -58.4 },
  { name: 'CDMX', lat: 19.4, lon: -99.1 },
  { name: 'Bogotá', lat: 4.7, lon: -74.1 },
  { name: 'Santiago', lat: -33.4, lon: -70.7 },
  { name: 'Lima', lat: -12.0, lon: -77.0 },
  { name: 'Nueva York', lat: 40.7, lon: -74.0 },
]

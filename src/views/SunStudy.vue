<script setup>
import { ref, computed } from 'vue'
import {
  computeSun,
  shadowLength,
  dayLabel,
  hourLabel,
  DATE_PRESETS,
  CITY_PRESETS,
} from '@/composables/useSolar'
import CopyButton from '@/components/ui/CopyButton.vue'
import InfoModal from '@/components/ui/InfoModal.vue'
import Expandable from '@/components/ui/Expandable.vue'
import SunScene from '@/components/diagrams/SunScene.vue'

/* ── Explicación de cada dato (botón ⓘ) ── */
const infoItems = [
  {
    term: 'Altura solar',
    desc: 'Ángulo del sol sobre el horizonte: 0° en el horizonte, 90° en el cenit (justo encima).',
  },
  {
    term: 'Azimut',
    desc: 'Dirección del sol medida desde el Norte en sentido horario: 90° = Este, 180° = Sur, 270° = Oeste.',
  },
  {
    term: 'Sombra',
    desc: 'Longitud de la sombra que proyecta el edificio; depende de su altura y de la altura solar (a sol más bajo, sombra más larga).',
  },
  {
    term: 'Orientación de la fachada',
    desc: 'Hacia qué punto cardinal mira la cara principal del edificio (la coral).',
  },
  {
    term: 'Hora solar',
    desc: 'El mediodía corresponde al sol más alto; no coincide exactamente con la hora del reloj. La latitud es la que determina los ángulos.',
  },
]

/* ── Estado ── */
const latitude = ref(40.4)
const longitude = ref(-3.7)
const dayOfYear = ref(172) // 21 jun
const hour = ref(13)
const buildingHeight = ref(6)
const orientation = ref(180) // azimut al que mira la fachada principal
const geoMsg = ref('')

const round1 = (v) => Math.round(v * 10) / 10
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

/* ── Ubicación ── */
function setCity(c) {
  latitude.value = c.lat
  longitude.value = c.lon
  geoMsg.value = ''
}
function isActiveCity(c) {
  return Math.abs(c.lat - latitude.value) < 0.05 && Math.abs(c.lon - longitude.value) < 0.05
}
function useMyLocation() {
  if (!navigator.geolocation) {
    geoMsg.value = 'Tu navegador no permite geolocalización.'
    return
  }
  geoMsg.value = 'Buscando tu ubicación…'
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      latitude.value = clamp(round1(pos.coords.latitude), -66, 66)
      longitude.value = round1(pos.coords.longitude)
      geoMsg.value = ''
    },
    () => {
      geoMsg.value = 'No se pudo obtener la ubicación (permiso denegado).'
    },
    { timeout: 10000 },
  )
}

/* ── Posición solar (para los resultados) ── */
const sun = computed(() =>
  computeSun({ latitude: latitude.value, dayOfYear: dayOfYear.value, hour: hour.value }),
)
const shadow = computed(() => shadowLength(buildingHeight.value, sun.value.altitudeRad))

/* ── Etiquetas ── */
const latLabel = computed(
  () => `${Math.abs(latitude.value).toFixed(1)}° ${latitude.value >= 0 ? 'N' : 'S'}`,
)
const lonLabel = computed(
  () => `${Math.abs(longitude.value).toFixed(1)}° ${longitude.value >= 0 ? 'E' : 'O'}`,
)
const dateLabel = computed(() => dayLabel(dayOfYear.value))
const timeLabel = computed(() => hourLabel(hour.value))

/* ── Fecha como calendario (input type="date") ↔ día del año ── */
const REF_YEAR = 2023 // año no bisiesto de referencia
const dateStr = computed({
  get() {
    const d = new Date(REF_YEAR, 0, dayOfYear.value) // día 1 = 1 ene
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${d.getFullYear()}-${m}-${day}`
  },
  set(v) {
    if (!v) return
    const d = new Date(`${v}T00:00:00`)
    const start = new Date(d.getFullYear(), 0, 0)
    const day = Math.round((d - start) / 86400000)
    dayOfYear.value = Math.min(365, Math.max(1, day))
  },
})

/* ── Hora como selector (input type="time") ↔ hora decimal ── */
const timeStr = computed({
  get: () => hourLabel(hour.value),
  set(v) {
    if (!v) return
    const [h, m] = v.split(':').map(Number)
    hour.value = (h || 0) + (m || 0) / 60
  },
})

/* ── Atajos de orientación por punto cardinal ── */
const CARDINAL_PRESETS = [
  { label: 'N', deg: 0 },
  { label: 'NE', deg: 45 },
  { label: 'E', deg: 90 },
  { label: 'SE', deg: 135 },
  { label: 'S', deg: 180 },
  { label: 'SO', deg: 225 },
  { label: 'O', deg: 270 },
  { label: 'NO', deg: 315 },
]

const CARDINALS = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO']
const azCardinal = computed(() => CARDINALS[Math.round(sun.value.azimuthDeg / 45) % 8])
const facadeLabel = computed(
  () => `${CARDINALS[Math.round(orientation.value / 45) % 8]} · ${orientation.value}°`,
)

const copyText = computed(
  () =>
    `Soleamiento — ${latLabel.value} ${lonLabel.value}, ${dateLabel.value} ${timeLabel.value} · ` +
    `altura solar ${sun.value.altitudeDeg.toFixed(1)}° · ` +
    `azimut ${sun.value.azimuthDeg.toFixed(0)}° (${azCardinal.value})` +
    (shadow.value != null ? ` · sombra ${shadow.value.toFixed(1)} m` : ' · sol bajo el horizonte') +
    ` · fachada ${facadeLabel.value}`,
)
</script>

<template>
  <main class="card" role="main">
    <header class="view-head">
      <div class="view-head-text">
        <h2>☀️ Estudio de soleamiento</h2>
        <p>
          Posición real del sol según latitud, fecha y hora.
          <strong>{{ dateLabel }} · {{ timeLabel }}</strong>
        </p>
      </div>
      <InfoModal title="¿Qué significa cada dato?" :items="infoItems" />
    </header>

    <!-- ── ESCENA 3D ── -->
    <section class="section" aria-label="Escena 3D">
      <Expandable>
        <SunScene
          :latitude="latitude"
          :day-of-year="dayOfYear"
          :hour="hour"
          :building-height="buildingHeight"
          :orientation="orientation"
        />
      </Expandable>
      <p class="legend">
        🔴 Flecha roja = <strong>Norte</strong> · cara coral = <strong>fachada principal</strong>
        · arrastrá para girar, rueda para acercar.
      </p>
    </section>

    <!-- ── UBICACIÓN ── -->
    <section class="section location">
      <p class="section-label">Ubicación</p>
      <div class="loc-top">
        <button type="button" class="loc-btn" @click="useMyLocation">
          📍 Usar mi ubicación
        </button>
        <span class="loc-coords">{{ latLabel }} · {{ lonLabel }}</span>
      </div>
      <p v-if="geoMsg" class="geo-msg">{{ geoMsg }}</p>
      <div class="presets">
        <button
          v-for="c in CITY_PRESETS"
          :key="c.name"
          type="button"
          class="preset-btn"
          :class="{ active: isActiveCity(c) }"
          @click="setCity(c)"
        >
          {{ c.name }}
        </button>
      </div>
      <div class="coords">
        <label class="coord-field">
          <span>Latitud</span>
          <input v-model.number="latitude" type="number" step="0.1" min="-66" max="66" />
        </label>
        <label class="coord-field">
          <span>Longitud</span>
          <input v-model.number="longitude" type="number" step="0.1" min="-180" max="180" />
        </label>
      </div>
      <p class="coord-note">
        En modo hora solar, la longitud no altera los ángulos del sol (identifica el lugar).
      </p>
    </section>

    <!-- ── CONTROLES ── -->
    <section class="section controls">
      <div class="field">
        <span class="field-label">Fecha</span>
        <input v-model="dateStr" class="ctrl-input" type="date" />
        <div class="presets">
          <button
            v-for="p in DATE_PRESETS"
            :key="p.day"
            type="button"
            class="preset-btn"
            :class="{ active: dayOfYear === p.day }"
            :title="p.hint"
            @click="dayOfYear = p.day"
          >
            {{ p.label }}
          </button>
        </div>
      </div>

      <div class="field">
        <span class="field-label">Hora solar</span>
        <input v-model="timeStr" class="ctrl-input" type="time" />
      </div>

      <div class="field">
        <span class="field-label">Altura del edificio</span>
        <div class="num-unit">
          <input v-model.number="buildingHeight" class="ctrl-input" type="number" min="3" max="40" step="0.5" />
          <span class="unit">m</span>
        </div>
      </div>

      <div class="field">
        <span class="field-label">Orientación de la fachada</span>
        <div class="num-unit">
          <input v-model.number="orientation" class="ctrl-input" type="number" min="0" max="360" step="5" />
          <span class="unit">°</span>
        </div>
        <div class="presets">
          <button
            v-for="c in CARDINAL_PRESETS"
            :key="c.deg"
            type="button"
            class="preset-btn"
            :class="{ active: orientation === c.deg }"
            @click="orientation = c.deg"
          >
            {{ c.label }}
          </button>
        </div>
      </div>
    </section>

    <!-- ── RESULTADOS ── -->
    <section class="section" aria-label="Resultados">
      <div class="stats">
        <div class="stat" :class="sun.isDay ? 'ok' : 'neutral'">
          <span class="stat-label">Altura solar</span>
          <span class="stat-value">{{ sun.altitudeDeg.toFixed(1) }}<small>°</small></span>
        </div>
        <div class="stat neutral">
          <span class="stat-label">Azimut</span>
          <span class="stat-value">{{ sun.azimuthDeg.toFixed(0) }}<small>° {{ azCardinal }}</small></span>
        </div>
        <div class="stat neutral">
          <span class="stat-label">Sombra</span>
          <span class="stat-value">
            <template v-if="shadow != null">{{ shadow.toFixed(1) }}<small>m</small></template>
            <template v-else>—</template>
          </span>
        </div>
      </div>
    </section>

    <!-- ── DÍA / NOCHE ── -->
    <div class="comfort" :class="sun.isDay ? 'ok' : 'warn'">
      <span class="comfort-icon">{{ sun.isDay ? '☀️' : '🌙' }}</span>
      <span>
        {{
          sun.isDay
            ? 'Sol sobre el horizonte: las sombras se proyectan en la escena.'
            : 'El sol está bajo el horizonte (noche): no hay soleamiento a esta hora.'
        }}
      </span>
    </div>

    <CopyButton :text="copyText" label="Copiar datos solares" />
  </main>
</template>

<style scoped>
.view-head {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 18px;
}
.view-head h2 {
  font-size: 1.2rem;
  color: var(--brand-dark);
  margin-bottom: 4px;
}
.view-head p {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.4;
}

.legend {
  font-size: 0.78rem;
  color: var(--muted);
  margin-top: 8px;
  text-align: center;
}

/* Ubicación */
.location {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.loc-top {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.loc-btn {
  padding: 9px 14px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--brand);
  background: var(--brand-light);
  color: var(--brand-dark);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.loc-btn:hover {
  background: var(--brand);
  color: #fff;
}
.loc-coords {
  font-size: 0.95rem;
  font-weight: 700;
  color: var(--text);
}
.geo-msg {
  font-size: 0.8rem;
  color: var(--muted);
}
.coords {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}
.coord-field {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
}
.coord-field input {
  width: 120px;
  padding: 9px 11px;
  font-size: 0.95rem;
  font-weight: 600;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  background: var(--bg);
  outline: none;
}
.coord-field input:focus {
  border-color: var(--brand);
}
.coord-note {
  font-size: 0.76rem;
  color: var(--muted);
  font-style: italic;
}

/* Controles en dos columnas */
.controls {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px 28px;
  align-items: start;
}
.field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.field-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted);
}
.ctrl-input {
  padding: 11px 13px;
  font-size: 1rem;
  font-weight: 600;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  background: var(--bg);
  outline: none;
  transition: border-color 0.15s;
  width: 100%;
}
.ctrl-input:focus {
  border-color: var(--brand);
}
.num-unit {
  display: flex;
  align-items: center;
  gap: 8px;
}
.num-unit .ctrl-input {
  width: 110px;
}
.num-unit .unit {
  font-size: 0.95rem;
  font-weight: 600;
  color: var(--muted);
}
.presets {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.preset-btn {
  padding: 6px 11px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-size: 0.78rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}
.preset-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.preset-btn.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand-dark);
}

.stats {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 680px) {
  .controls {
    grid-template-columns: 1fr;
  }
}
</style>

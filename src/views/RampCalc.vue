<script setup>
import { ref, computed, watch } from 'vue'
import { computeRamp, optimalSlope, RAMP_MSG } from '@/composables/useRamp'
import RangeSlider from '@/components/ui/RangeSlider.vue'
import ToggleGroup from '@/components/ui/ToggleGroup.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import RampDiagram from '@/components/diagrams/RampDiagram.vue'

const MODES = [
  { value: 'slope', label: 'Fijo la pendiente' },
  { value: 'length', label: 'Fijo la longitud' },
]

/* ── Estado ── */
const heightVal = ref(30)
const heightUnit = ref('cm') // 'cm' | 'm'
const mode = ref('slope')
const slopePct = ref(8) // modo "pendiente"
const runM = ref(4) // modo "longitud" (en metros)

const heightCm = computed(() =>
  heightUnit.value === 'm' ? heightVal.value * 100 : heightVal.value,
)
const validHeight = computed(() => isFinite(heightCm.value) && heightCm.value > 0)

/* ── Cálculo ── */
const r = computed(() => {
  if (!validHeight.value) return null
  return mode.value === 'length'
    ? computeRamp({ totalHeight: heightCm.value, mode: 'length', run: runM.value * 100 })
    : computeRamp({ totalHeight: heightCm.value, mode: 'slope', slopePct: slopePct.value })
})
const msg = computed(() => (r.value ? RAMP_MSG[r.value.status] : null))

/* ── Al cambiar de modo, mantené la rampa actual (siembra el otro control) ── */
const round1 = (v) => Math.round(v * 10) / 10
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

watch(mode, (m) => {
  if (!validHeight.value) return
  if (m === 'length') {
    const run = slopePct.value > 0 ? heightCm.value / (slopePct.value / 100) : 400
    runM.value = clamp(round1(run / 100), 0.5, 15)
  } else {
    const run = runM.value * 100
    slopePct.value = clamp(round1(run > 0 ? (heightCm.value / run) * 100 : 8), 2, 20)
  }
})

/* ── Ajuste óptimo: pendiente accesible más corta para la altura dada ── */
function optimize() {
  if (!validHeight.value) return
  const s = optimalSlope(heightCm.value)
  if (mode.value === 'slope') {
    slopePct.value = s
  } else {
    const run = heightCm.value / (s / 100)
    runM.value = clamp(round1(run / 100), 0.5, 15)
  }
}

/* ── Texto para copiar ── */
const copyText = computed(() => {
  if (!r.value) return ''
  return (
    `Rampa — altura ${r.value.rise.toFixed(0)} cm · ` +
    `pendiente ${r.value.slopePct.toFixed(1)}% · ` +
    `longitud ${(r.value.run / 100).toFixed(2)} m · ` +
    `${r.value.angle.toFixed(1)}° · ` +
    (r.value.accessible ? 'accesible' : 'no accesible')
  )
})

const m2 = (cm) => (cm / 100).toFixed(2)
</script>

<template>
  <main class="card" role="main">
    <header class="view-head">
      <h2>♿ Rampas y accesibilidad</h2>
      <p>Calculá la longitud y la pendiente, y comprobá si cumple como rampa accesible.</p>
    </header>

    <!-- ── MODO ── -->
    <section class="section" aria-label="Modo de cálculo">
      <p class="section-label">¿Qué dato fijás?</p>
      <ToggleGroup v-model="mode" :options="MODES" aria-label="Modo de cálculo" />
    </section>

    <!-- ── ENTRADAS ── -->
    <section class="section ramp-inputs">
      <div class="field">
        <p class="section-label">Altura a salvar</p>
        <div class="height-row">
          <input
            v-model.number="heightVal"
            class="height-input"
            :class="{ error: !validHeight }"
            type="number"
            min="0"
            step="any"
            placeholder="0"
            aria-label="Altura a salvar"
          />
          <ToggleGroup v-model="heightUnit" :options="['cm', 'm']" aria-label="Unidad de la altura" />
        </div>
      </div>

      <div class="field field-slider">
        <RangeSlider
          v-if="mode === 'slope'"
          v-model="slopePct"
          :min="2"
          :max="20"
          :step="0.5"
          :decimals="1"
          label="Pendiente"
          unit=" %"
        />
        <RangeSlider
          v-else
          v-model="runM"
          :min="0.5"
          :max="15"
          :step="0.1"
          :decimals="1"
          label="Longitud disponible"
          unit=" m"
        />
      </div>
    </section>

    <p v-if="!validHeight" class="validation-msg">Ingresá una altura mayor a 0.</p>

    <template v-if="r">
      <div class="optimize-row">
        <button
          type="button"
          class="optimize-btn"
          title="Pendiente accesible más corta para esta altura"
          @click="optimize"
        >
          ♻︎ Ajuste óptimo
        </button>
      </div>

      <!-- ── DIAGRAMA ── -->
      <section class="section" aria-label="Diagrama de la rampa">
        <RampDiagram :rise="r.rise" :run="r.run" :slope-pct="r.slopePct" :status="r.status" />
      </section>

      <!-- ── RESULTADOS ── -->
      <section class="section" aria-label="Resultados">
        <div class="stats">
          <div class="stat" :class="r.status">
            <span class="stat-label">Pendiente</span>
            <span class="stat-value">{{ r.slopePct.toFixed(1) }}<small>%</small></span>
          </div>
          <div class="stat neutral">
            <span class="stat-label">Longitud</span>
            <span class="stat-value">{{ m2(r.run) }}<small>m</small></span>
          </div>
          <div class="stat neutral">
            <span class="stat-label">Rampa (incl.)</span>
            <span class="stat-value">{{ m2(r.inclined) }}<small>m</small></span>
          </div>
          <div class="stat neutral">
            <span class="stat-label">Inclinación</span>
            <span class="stat-value">{{ r.angle.toFixed(1) }}<small>°</small></span>
          </div>
          <div class="stat neutral">
            <span class="stat-label">Pend. máx.</span>
            <span class="stat-value">{{ r.maxSlope }}<small>%</small></span>
          </div>
          <div class="stat" :class="r.needsLanding ? 'warn' : 'neutral'">
            <span class="stat-label">Tramos</span>
            <span class="stat-value">{{ r.tramos }}</span>
          </div>
        </div>
      </section>

      <!-- ── CUMPLIMIENTO ── -->
      <div class="comfort" :class="r.status">
        <span class="comfort-icon">{{ msg.icon }}</span>
        <span>{{ msg.text }}</span>
      </div>
      <p v-if="r.needsLanding" class="landing-note">
        El recorrido supera los 9 m por tramo: requiere {{ r.tramos - 1 }} rellano(s)
        intermedio(s) ({{ r.tramos }} tramos).
      </p>

      <CopyButton :text="copyText" label="Copiar medidas" />
    </template>
  </main>
</template>

<style scoped>
.view-head {
  margin-bottom: 20px;
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

/* Entradas en dos columnas (altura | slider) */
.ramp-inputs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 28px;
  align-items: center;
}
.field-slider {
  padding-top: 4px;
}
.optimize-row {
  margin-bottom: 18px;
}
.height-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.height-input {
  flex: 1;
  min-width: 110px;
  padding: 14px 16px;
  font-size: 1.2rem;
  font-weight: 600;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  background: var(--bg);
  outline: none;
  transition: border-color 0.18s;
}
.height-input:focus {
  border-color: var(--brand);
}
.height-input.error {
  border-color: var(--accent);
}
.validation-msg {
  font-size: 0.8rem;
  color: var(--accent);
  margin-top: -10px;
  margin-bottom: 8px;
}

/* Resultados */
.stats {
  grid-template-columns: repeat(6, 1fr);
}
.landing-note {
  font-size: 0.82rem;
  color: var(--muted);
  margin: -8px 0 18px;
  padding-left: 4px;
}

@media (max-width: 680px) {
  .ramp-inputs {
    grid-template-columns: 1fr;
    gap: 18px;
  }
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 420px) {
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

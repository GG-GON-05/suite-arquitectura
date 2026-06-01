<script setup>
import { ref, computed } from 'vue'
import {
  computeStairs,
  suggestSteps,
  suggestTread,
  COMFORT_MSG,
} from '@/composables/useStairs'
import RangeSlider from '@/components/ui/RangeSlider.vue'
import ToggleGroup from '@/components/ui/ToggleGroup.vue'
import CopyButton from '@/components/ui/CopyButton.vue'
import StairsDiagram from '@/components/diagrams/StairsDiagram.vue'

/* ── Estado ── */
const heightVal = ref(280) // valor de altura en la unidad activa
const heightUnit = ref('cm') // 'cm' | 'm'
const nSteps = ref(16)
const tread = ref(28)

/* ── Altura a salvar en cm ── */
const heightCm = computed(() =>
  heightUnit.value === 'm' ? heightVal.value * 100 : heightVal.value,
)
const validHeight = computed(() => isFinite(heightCm.value) && heightCm.value > 0)

/* ── Cálculo ── */
const r = computed(() =>
  validHeight.value
    ? computeStairs({ totalHeight: heightCm.value, nSteps: nSteps.value, tread: tread.value })
    : null,
)
const msg = computed(() => (r.value ? COMFORT_MSG[r.value.overall] : null))

/* ── Ajuste óptimo automático ── */
function optimize() {
  if (!validHeight.value) return
  nSteps.value = suggestSteps(heightCm.value)
  tread.value = suggestTread(heightCm.value / nSteps.value)
}

/* ── Texto para copiar ── */
const copyText = computed(() => {
  if (!r.value) return ''
  return (
    `Escalera — altura ${heightCm.value.toFixed(0)} cm · ` +
    `${r.value.nSteps} escalones · ` +
    `CH ${r.value.riser.toFixed(1)} cm · H ${r.value.tread.toFixed(1)} cm · ` +
    `Blondel ${r.value.blondel.toFixed(1)} cm · ${r.value.angle.toFixed(1)}°`
  )
})

const fmt = (n, d = 1) => n.toFixed(d)
</script>

<template>
  <main class="card" role="main">
    <header class="view-head">
      <h2>🪜 Calculadora de escaleras</h2>
      <p>Indicá la altura a salvar y ajustá los escalones; el diagrama se actualiza en vivo.</p>
    </header>

    <!-- ── ENTRADAS ── -->
    <section class="section" aria-label="Datos de la escalera">
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
      <p v-if="!validHeight" class="validation-msg">Ingresá una altura mayor a 0.</p>
    </section>

    <template v-if="r">
      <div class="stairs-top">
        <section class="section sliders">
          <RangeSlider v-model="nSteps" :min="2" :max="30" :step="1" label="Número de escalones" />
          <RangeSlider
            v-model="tread"
            :min="24"
            :max="38"
            :step="0.5"
            :decimals="1"
            label="Huella (profundidad)"
            unit=" cm"
          />
          <button type="button" class="optimize-btn" @click="optimize">♻︎ Ajuste óptimo</button>
        </section>

        <!-- ── DIAGRAMA ── -->
        <div class="diagram-col" aria-label="Diagrama de la escalera">
          <StairsDiagram
            :n-steps="r.nSteps"
            :riser="r.riser"
            :tread="r.tread"
            :total-height="heightCm"
          />
        </div>
      </div>

      <!-- ── RESULTADOS ── -->
      <section class="section results" aria-label="Resultados">
        <div class="stats">
          <div class="stat" :class="r.status.riser">
            <span class="stat-label">Contrahuella</span>
            <span class="stat-value">{{ fmt(r.riser) }}<small>cm</small></span>
          </div>
          <div class="stat" :class="r.status.tread">
            <span class="stat-label">Huella</span>
            <span class="stat-value">{{ fmt(r.tread) }}<small>cm</small></span>
          </div>
          <div class="stat" :class="r.status.blondel">
            <span class="stat-label">Blondel 2·CH+H</span>
            <span class="stat-value">{{ fmt(r.blondel) }}<small>cm</small></span>
          </div>
          <div class="stat" :class="r.status.angle">
            <span class="stat-label">Inclinación</span>
            <span class="stat-value">{{ fmt(r.angle) }}<small>°</small></span>
          </div>
          <div class="stat neutral">
            <span class="stat-label">Nº de huellas</span>
            <span class="stat-value">{{ r.nTreads }}</span>
          </div>
          <div class="stat neutral">
            <span class="stat-label">Desarrollo</span>
            <span class="stat-value">{{ fmt(r.run, 0) }}<small>cm</small></span>
          </div>
        </div>
      </section>

      <!-- ── COMODIDAD ── -->
      <div class="comfort" :class="r.overall">
        <span class="comfort-icon">{{ msg.icon }}</span>
        <span>{{ msg.text }}</span>
      </div>

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

/* ── Fila superior: controles + diagrama (pantallas anchas) ── */
.stairs-top {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.15fr);
  gap: 30px;
  align-items: center;
  margin-bottom: 22px;
}
.stairs-top .section {
  margin-bottom: 0;
}
.diagram-col {
  width: 100%;
}

/* En pantallas estrechas: una sola columna (sliders → diagrama) */
@media (max-width: 680px) {
  .stairs-top {
    grid-template-columns: 1fr;
    gap: 22px;
    align-items: stretch;
  }
}

/* Altura */
.height-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}
.height-input {
  flex: 1;
  min-width: 120px;
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
  margin-top: 6px;
}

/* Sliders */
.sliders {
  display: flex;
  flex-direction: column;
  gap: 18px;
}
/* Resultados (apariencia de .stat/.comfort en styles.css global) */
.stats {
  grid-template-columns: repeat(6, 1fr);
}

@media (max-width: 680px) {
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

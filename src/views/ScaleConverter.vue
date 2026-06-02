<script setup>
import { ref, computed, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { usePrefsStore } from '@/stores/prefs'
import { UNITS, SCALE_PRESETS, computeScale, fmt } from '@/composables/useScale'
import ToggleGroup from '@/components/ui/ToggleGroup.vue'
import CopyButton from '@/components/ui/CopyButton.vue'

const prefs = usePrefsStore()
const { mode, unit, resultUnit, scale, customScale, isCustom } = storeToRefs(prefs)

/* ── Entrada del usuario ──
   Con <input type="number">, v-model entrega un número (o '' si está vacío),
   así que normalizamos a texto para las comprobaciones de vacío/validez. */
const rawInput = ref('')
const rawText = computed(() => String(rawInput.value ?? '').trim())

/* ── Escala efectiva (preset o personalizada) ── */
const activeScale = computed(() => (isCustom.value ? customScale.value : scale.value))

/* ── Etiquetas dinámicas ── */
const inputModeWord = computed(() => (mode.value === 'real' ? 'real' : 'en plano'))
const resultLabel = computed(() => (mode.value === 'real' ? 'Medida en plano' : 'Medida real'))
const isAccent = computed(() => mode.value === 'plan')

/* ── Validación ── */
const numericValue = computed(() => parseFloat(rawInput.value))
const inputError = computed(() => {
  if (rawText.value === '') return false
  return isNaN(numericValue.value) || numericValue.value < 0
})
const validationMsg = computed(() =>
  inputError.value ? 'Por favor ingresá un número positivo.' : '',
)

/* ── Cálculo principal ── */
const calc = computed(() => {
  if (rawText.value === '' || inputError.value) return null
  return computeScale({
    value: numericValue.value,
    mode: mode.value,
    scale: activeScale.value,
    unit: unit.value,
    resultUnit: resultUnit.value,
  })
})

const resultValue = computed(() => {
  if (rawText.value === '') return '—'
  if (inputError.value) return '?'
  if (!activeScale.value || activeScale.value <= 0) return '?'
  return fmt(calc.value.result)
})

const resultOperation = computed(() => {
  if (!activeScale.value || activeScale.value <= 0) {
    return rawText.value !== '' && !inputError.value
      ? 'Definí una escala válida (mayor a 0).'
      : ''
  }
  return calc.value ? calc.value.operation : ''
})

const copyText = computed(() => `${resultValue.value} ${resultUnit.value}`)
const canCopy = computed(() => resultValue.value !== '—' && resultValue.value !== '?')

/* ── Handlers de escala ── */
function selectPreset(val) {
  isCustom.value = false
  scale.value = val
}
function selectCustom() {
  isCustom.value = true
  // si ya hay un valor personalizado válido, se mantiene
}

/* ── Persistir preferencias ante cualquier cambio ── */
watch([mode, unit, resultUnit, scale, customScale, isCustom], () => prefs.save())
</script>

<template>
  <main class="card" role="main">
    <!-- ── MODO ── -->
    <section class="section" aria-label="Modo de cálculo">
      <p class="section-label">Modo de cálculo</p>
      <div class="mode-switch" role="group" aria-label="Seleccionar modo">
        <button
          type="button"
          class="mode-btn"
          :class="{ 'active-real': mode === 'real' }"
          :aria-pressed="mode === 'real'"
          @click="mode = 'real'"
        >
          Real → Plano
          <span class="tag">Ingreso la medida real</span>
        </button>
        <button
          type="button"
          class="mode-btn"
          :class="{ 'active-plan': mode === 'plan' }"
          :aria-pressed="mode === 'plan'"
          @click="mode = 'plan'"
        >
          Plano → Real
          <span class="tag">Ingreso lo que mido en el plano</span>
        </button>
      </div>
    </section>

    <!-- ── UNIDAD ── -->
    <section class="section" aria-label="Unidad de medida">
      <p class="section-label">Unidad</p>
      <ToggleGroup v-model="unit" :options="UNITS" aria-label="Seleccionar unidad" />
    </section>

    <!-- ── ESCALA ── -->
    <section class="section" aria-label="Escala">
      <p class="section-label">Escala</p>
      <div class="scale-grid" role="group" aria-label="Presets de escala">
        <button
          v-for="preset in SCALE_PRESETS"
          :key="preset"
          type="button"
          class="scale-btn"
          :class="{ active: !isCustom && scale === preset }"
          @click="selectPreset(preset)"
        >
          1:{{ preset }}
        </button>
        <button
          type="button"
          class="scale-btn"
          :class="{ active: isCustom }"
          @click="selectCustom"
        >
          Otra…
        </button>
      </div>
      <div v-if="isCustom" class="custom-scale-row" aria-label="Escala personalizada">
        <span>1 :</span>
        <input
          v-model.number="customScale"
          class="custom-scale-input"
          type="number"
          min="1"
          step="1"
          placeholder="ej: 33"
          aria-label="Denominador de la escala personalizada"
        />
      </div>
    </section>

    <!-- ── UNIDAD DEL RESULTADO ── -->
    <section class="section" aria-label="Unidad del resultado">
      <p class="section-label">Resultado en</p>
      <ToggleGroup
        v-model="resultUnit"
        :options="UNITS"
        variant="success"
        aria-label="Unidad del resultado"
      />
    </section>

    <hr class="divider" />

    <!-- ── INPUT PRINCIPAL ── -->
    <section class="section" aria-label="Medida de entrada">
      <p class="main-input-label">
        Medida <strong>{{ inputModeWord }}</strong> en <strong>{{ unit }}</strong>
      </p>
      <div class="main-input-wrap">
        <input
          v-model="rawInput"
          class="main-input"
          :class="{ error: inputError }"
          type="number"
          min="0"
          step="any"
          placeholder="0"
          aria-label="Medida de entrada"
        />
      </div>
      <p class="validation-msg" aria-live="polite">{{ validationMsg }}</p>
    </section>

    <!-- ── RESULTADO ── -->
    <section aria-label="Resultado">
      <div class="result-box" :class="{ 'accent-mode': isAccent }" aria-live="polite" aria-atomic="true">
        <p class="result-label">{{ resultLabel }}</p>
        <div>
          <span class="result-value">{{ resultValue }}</span>
          <span class="result-unit">{{ resultUnit }}</span>
        </div>
        <p class="result-operation">{{ resultOperation }}</p>
      </div>
    </section>

    <!-- ── BOTÓN COPIAR ── -->
    <CopyButton :text="copyText" :disabled="!canCopy" />
  </main>
</template>

<style scoped>
/* ── Switch de modo ── */
.mode-switch {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: var(--bg);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  overflow: hidden;
}
.mode-btn {
  padding: 14px 10px;
  border: none;
  background: transparent;
  cursor: pointer;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--muted);
  transition: all 0.18s;
  line-height: 1.35;
  text-align: center;
}
.mode-btn span.tag {
  display: block;
  font-size: 0.7rem;
  font-weight: 400;
  opacity: 0.8;
  margin-top: 2px;
}
.mode-btn.active-real {
  background: var(--brand);
  color: #fff;
  border-radius: var(--radius-sm);
}
.mode-btn.active-plan {
  background: var(--accent);
  color: #fff;
  border-radius: var(--radius-sm);
}

/* ── Presets de escala ── */
.scale-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 12px;
}
.scale-btn {
  padding: 8px 13px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}
.scale-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.scale-btn.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand-dark);
}

/* ── Input personalizado de escala ── */
.custom-scale-row {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}
.custom-scale-row span {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--muted);
  white-space: nowrap;
}
.custom-scale-input {
  width: 100px;
  padding: 10px 12px;
  font-size: 1rem;
  font-weight: 600;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  background: var(--bg);
  transition: border-color 0.15s;
  outline: none;
}
.custom-scale-input:focus {
  border-color: var(--brand);
}

/* ── Input principal ── */
.main-input-wrap {
  position: relative;
}
.main-input-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted);
  margin-bottom: 8px;
}
.main-input-label strong {
  color: var(--text);
}
.main-input {
  width: 100%;
  padding: 16px 18px;
  font-size: 1.3rem;
  font-weight: 600;
  border: 2px solid var(--border);
  border-radius: var(--radius-md);
  color: var(--text);
  background: var(--bg);
  outline: none;
  transition: border-color 0.18s;
}
.main-input:focus {
  border-color: var(--brand);
}
.main-input.error {
  border-color: var(--accent);
}

/* ── Área de resultado ── */
.result-box {
  background: var(--brand-light);
  border: 2px solid var(--brand);
  border-radius: var(--radius-md);
  padding: 20px 20px 16px;
  margin-bottom: 24px;
  min-height: 110px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: background 0.2s, border-color 0.2s;
}
.result-box.accent-mode {
  background: var(--accent-light);
  border-color: var(--accent);
}
.result-label {
  font-size: 0.78rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.8px;
  color: var(--brand);
  margin-bottom: 6px;
}
.result-box.accent-mode .result-label {
  color: var(--accent);
}
.result-value {
  font-size: 3rem;
  font-weight: 800;
  color: var(--brand-dark);
  letter-spacing: -1.5px;
  line-height: 1;
  word-break: break-all;
  text-align: center;
}
.result-box.accent-mode .result-value {
  color: #b03a2d;
}
.result-unit {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--brand);
  margin-left: 6px;
}
.result-box.accent-mode .result-unit {
  color: var(--accent);
}
.result-operation {
  font-size: 0.82rem;
  color: var(--muted);
  margin-top: 8px;
  font-style: italic;
  text-align: center;
}

/* ── Mensaje de validación ── */
.validation-msg {
  font-size: 0.8rem;
  color: var(--accent);
  margin-top: 6px;
  min-height: 18px;
}

@media (max-width: 520px) {
  .result-value {
    font-size: 2.5rem;
  }
}
</style>

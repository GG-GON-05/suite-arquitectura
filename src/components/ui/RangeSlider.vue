<script setup>
/**
 * Slider con etiqueta y valor visible. Reutilizable en cualquier módulo
 * (escaleras, rampas, soleamiento…).
 */
const props = defineProps({
  modelValue: { type: Number, required: true },
  min: { type: Number, default: 0 },
  max: { type: Number, default: 100 },
  step: { type: Number, default: 1 },
  label: { type: String, default: '' },
  unit: { type: String, default: '' },
  decimals: { type: Number, default: 0 },
  displayValue: { type: String, default: '' }, // etiqueta a mostrar en vez del número
})

const emit = defineEmits(['update:modelValue'])

function onInput(e) {
  emit('update:modelValue', parseFloat(e.target.value))
}
</script>

<template>
  <div class="range">
    <div class="range-head">
      <span class="range-label">{{ label }}</span>
      <span class="range-value">
        <template v-if="displayValue">{{ displayValue }}</template>
        <template v-else>{{ modelValue.toFixed(decimals) }}<small v-if="unit">{{ unit }}</small></template>
      </span>
    </div>
    <input
      class="range-input"
      type="range"
      :min="min"
      :max="max"
      :step="step"
      :value="modelValue"
      :aria-label="label"
      @input="onInput"
    />
  </div>
</template>

<style scoped>
.range {
  width: 100%;
}
.range-head {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 6px;
}
.range-label {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--muted);
}
.range-value {
  font-size: 1.05rem;
  font-weight: 700;
  color: var(--brand-dark);
}
.range-value small {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--muted);
  margin-left: 2px;
}

/* ── Pista del slider ── */
.range-input {
  -webkit-appearance: none;
  appearance: none;
  width: 100%;
  height: 6px;
  border-radius: 999px;
  background: var(--border);
  outline: none;
  cursor: pointer;
}
.range-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: var(--brand);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(91, 106, 240, 0.4);
  cursor: pointer;
  transition: transform 0.12s;
}
.range-input::-webkit-slider-thumb:hover {
  transform: scale(1.12);
}
.range-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background: var(--brand);
  border: 3px solid #fff;
  box-shadow: 0 1px 4px rgba(91, 106, 240, 0.4);
  cursor: pointer;
}
</style>

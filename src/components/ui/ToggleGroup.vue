<script setup>
/**
 * Grupo de botones tipo "pill" con selección única (v-model).
 * Reutilizable para unidades, presets de escala, etc.
 *
 * options: array de { value, label } o de strings (en cuyo caso value === label).
 * variant: 'brand' (azul) | 'success' (verde) — define el color del estado activo.
 */
const props = defineProps({
  modelValue: { type: [String, Number, null], default: null },
  options: { type: Array, required: true },
  variant: { type: String, default: 'brand' },
  ariaLabel: { type: String, default: '' },
})

const emit = defineEmits(['update:modelValue'])

function normalize(opt) {
  return typeof opt === 'object' ? opt : { value: opt, label: String(opt) }
}
</script>

<template>
  <div class="toggle-group" role="group" :aria-label="ariaLabel">
    <button
      v-for="opt in options.map(normalize)"
      :key="opt.value"
      type="button"
      class="toggle-btn"
      :class="[
        variant,
        { active: opt.value === modelValue },
      ]"
      :aria-pressed="opt.value === modelValue"
      @click="emit('update:modelValue', opt.value)"
    >
      {{ opt.label }}
    </button>
  </div>
</template>

<style scoped>
.toggle-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.toggle-btn {
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.15s;
}

/* variante brand (azul) */
.toggle-btn.brand:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.toggle-btn.brand.active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand-dark);
}

/* variante success (verde) — para la unidad de resultado */
.toggle-btn.success:hover {
  border-color: var(--success);
  color: #1a8a5a;
}
.toggle-btn.success.active {
  background: #e8faf3;
  border-color: var(--success);
  color: #1a7a50;
}
</style>

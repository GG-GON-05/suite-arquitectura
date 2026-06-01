<script setup>
import { ref } from 'vue'

/**
 * Botón de copiar al portapapeles con feedback "¡Copiado!".
 * Usa la Clipboard API con fallback a execCommand para navegadores antiguos.
 */
const props = defineProps({
  text: { type: String, default: '' },
  label: { type: String, default: 'Copiar resultado' },
  disabled: { type: Boolean, default: false },
})

const copied = ref(false)

function feedback() {
  copied.value = true
  setTimeout(() => {
    copied.value = false
  }, 1800)
}

function fallbackCopy(value) {
  const ta = document.createElement('textarea')
  ta.value = value
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  try {
    document.execCommand('copy')
    feedback()
  } catch (_) {
    /* sin soporte de copia */
  }
  document.body.removeChild(ta)
}

function copy() {
  if (props.disabled || !props.text) return
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard
      .writeText(props.text)
      .then(feedback)
      .catch(() => fallbackCopy(props.text))
  } else {
    fallbackCopy(props.text)
  }
}
</script>

<template>
  <button
    type="button"
    class="copy-btn"
    :class="{ copied }"
    :disabled="disabled"
    :aria-label="label"
    @click="copy"
  >
    <span class="copy-icon">{{ copied ? '✅' : '📋' }}</span>
    <span>{{ copied ? '¡Copiado!' : label }}</span>
  </button>
</template>

<style scoped>
.copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface);
  font-size: 1rem;
  font-weight: 600;
  color: var(--muted);
  cursor: pointer;
  transition: all 0.18s;
}
.copy-btn:hover:not(:disabled) {
  border-color: var(--brand);
  color: var(--brand);
  background: var(--brand-light);
}
.copy-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.copy-btn.copied {
  background: var(--success);
  border-color: var(--success);
  color: #fff;
}
.copy-icon {
  font-size: 1.15rem;
}
</style>

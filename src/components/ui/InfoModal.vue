<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Botón de información (ⓘ) que abre una ventana modal con una lista de
 * términos y sus definiciones. Reutilizable en cualquier módulo.
 */
const props = defineProps({
  title: { type: String, default: 'Información' },
  items: { type: Array, default: () => [] }, // [{ term, desc }]
})

const open = ref(false)
const show = () => (open.value = true)
const close = () => (open.value = false)

function onKey(e) {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <button class="info-btn" type="button" aria-label="Información" title="¿Qué significa cada medida?" @click="show">
    i
  </button>

  <Teleport to="body">
    <Transition name="info-fade">
      <div v-if="open" class="info-overlay" @click.self="close">
        <div class="info-modal" role="dialog" aria-modal="true" :aria-label="title">
          <header class="info-modal-head">
            <h3>{{ title }}</h3>
            <button class="info-close" type="button" aria-label="Cerrar" @click="close">✕</button>
          </header>
          <dl class="info-list">
            <div v-for="(it, i) in items" :key="i" class="info-row">
              <dt>{{ it.term }}</dt>
              <dd>{{ it.desc }}</dd>
            </div>
          </dl>
          <slot />
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.info-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid var(--brand);
  background: var(--brand-light);
  color: var(--brand-dark);
  font-family: Georgia, 'Times New Roman', serif;
  font-style: italic;
  font-weight: 700;
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s;
}
.info-btn:hover {
  background: var(--brand);
  color: #fff;
}

.info-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 32, 53, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
  z-index: 1000;
}
.info-modal {
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 48px rgba(30, 32, 53, 0.3);
  width: 100%;
  max-width: 440px;
  max-height: 82vh;
  overflow-y: auto;
  padding: 22px 24px 24px;
}
.info-modal-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 16px;
}
.info-modal-head h3 {
  font-size: 1.1rem;
  color: var(--brand-dark);
}
.info-close {
  flex-shrink: 0;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: none;
  background: var(--bg);
  color: var(--muted);
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.15s;
}
.info-close:hover {
  background: var(--accent-light);
  color: var(--accent);
}

.info-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.info-row dt {
  font-weight: 700;
  color: var(--text);
  margin-bottom: 2px;
}
.info-row dd {
  font-size: 0.9rem;
  color: var(--muted);
  line-height: 1.45;
}

/* Transición */
.info-fade-enter-active,
.info-fade-leave-active {
  transition: opacity 0.18s ease;
}
.info-fade-enter-from,
.info-fade-leave-to {
  opacity: 0;
}
</style>

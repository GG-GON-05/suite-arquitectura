<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'

/**
 * Envoltorio para diagramas: muestra un botón "ampliar" (⤢) abajo a la derecha
 * y abre el contenido a pantalla grande en un overlay. Reutilizable.
 *
 * El contenido se pasa por slot y se renderiza en un único sitio a la vez
 * (en línea o ampliado), evitando instancias duplicadas.
 */
const expanded = ref(false)
const open = () => (expanded.value = true)
const close = () => (expanded.value = false)

function onKey(e) {
  if (e.key === 'Escape') close()
}
onMounted(() => window.addEventListener('keydown', onKey))
onBeforeUnmount(() => window.removeEventListener('keydown', onKey))
</script>

<template>
  <div class="exp-frame">
    <slot v-if="!expanded" />
    <button
      v-if="!expanded"
      class="exp-btn"
      type="button"
      aria-label="Ampliar"
      title="Ampliar"
      @click="open"
    >
      ⤢
    </button>
  </div>

  <Teleport to="body">
    <Transition name="exp-fade">
      <div v-if="expanded" class="exp-overlay" @click.self="close">
        <div class="exp-modal">
          <button class="exp-close" type="button" @click="close">✕ Cerrar</button>
          <div class="exp-content">
            <slot />
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<style scoped>
.exp-frame {
  position: relative;
}
.exp-btn {
  position: absolute;
  bottom: 10px;
  right: 10px;
  width: 34px;
  height: 34px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: rgba(255, 255, 255, 0.9);
  color: var(--muted);
  font-size: 1.05rem;
  line-height: 1;
  cursor: pointer;
  transition: all 0.15s;
}
.exp-btn:hover {
  border-color: var(--brand);
  color: var(--brand);
  background: #fff;
}

.exp-overlay {
  position: fixed;
  inset: 0;
  background: rgba(30, 32, 53, 0.55);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  z-index: 1000;
}
.exp-modal {
  position: relative;
  background: var(--surface);
  border-radius: var(--radius-lg);
  box-shadow: 0 12px 48px rgba(30, 32, 53, 0.35);
  width: min(1000px, 94vw);
  max-height: 92vh;
  overflow: auto;
  padding: 52px 24px 24px;
}
.exp-close {
  position: absolute;
  top: 14px;
  right: 16px;
  padding: 7px 13px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.exp-close:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
.exp-content {
  width: 100%;
}

.exp-fade-enter-active,
.exp-fade-leave-active {
  transition: opacity 0.18s ease;
}
.exp-fade-enter-from,
.exp-fade-leave-to {
  opacity: 0;
}
</style>

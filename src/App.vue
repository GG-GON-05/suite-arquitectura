<script setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToolNav from '@/components/ToolNav.vue'
import { TOOLS } from '@/tools'
import { useTheme } from '@/composables/useTheme'

const route = useRoute()
const { theme, THEMES, setTheme } = useTheme()

const rotation = ref(0)
const current = computed(() => THEMES.find((t) => t.id === theme.value) || THEMES[0])
const currentIcon = computed(() => current.value.icon)
const currentMetal = computed(() => {
  const [light, mid, dark] = current.value.metal
  return (
    `radial-gradient(circle at 32% 26%, rgba(255,255,255,0.65), rgba(255,255,255,0) 52%), ` +
    `linear-gradient(145deg, ${light} 0%, ${mid} 45%, ${dark} 100%)`
  )
})
const nextTheme = computed(() => {
  const i = THEMES.findIndex((t) => t.id === theme.value)
  return THEMES[(i + 1) % THEMES.length]
})
function toggleTheme() {
  rotation.value += 360
  setTheme(nextTheme.value.id)
}

// Ancho máximo del contenido según la herramienta activa.
// Las herramientas marcadas como 'wide' aprovechan más pantalla (p. ej. Escaleras).
const contentMax = computed(() => {
  const tool = TOOLS.find((t) => t.name === route.name)
  return tool?.width === 'wide' ? '880px' : '480px'
})
</script>

<template>
  <div class="app-shell" :style="{ '--content-max': contentMax }">
    <button
      type="button"
      class="theme-toggle"
      :style="{ backgroundImage: currentMetal, '--r': rotation + 'deg' }"
      :aria-label="`Cambiar a tema ${nextTheme.label}`"
      :title="`Cambiar a tema ${nextTheme.label}`"
      @click="toggleTheme"
    >
      <svg
        class="theme-icon"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <path v-if="currentIcon === 'cloud'" d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" />
        <path
          v-else
          d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
        />
      </svg>
    </button>

    <AppHeader />
    <ToolNav />
    <RouterView v-slot="{ Component }">
      <Transition name="fade" mode="out-in">
        <component :is="Component" />
      </Transition>
    </RouterView>
  </div>
</template>

<style scoped>
.theme-toggle {
  position: fixed;
  top: 16px;
  right: 16px;
  width: 42px;
  height: 42px;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.8);
  cursor: pointer;
  /* Acabado metálico: brillo superior + sombras internas que dan volumen */
  box-shadow:
    inset 0 2px 3px rgba(255, 255, 255, 0.55),
    inset 0 -3px 6px rgba(0, 0, 0, 0.3),
    0 3px 10px rgba(0, 0, 0, 0.28);
  transform: rotate(var(--r, 0deg));
  transition:
    transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1),
    box-shadow 0.2s ease;
  z-index: 900;
}
.theme-toggle:hover {
  transform: rotate(var(--r, 0deg)) scale(1.1);
}
.theme-toggle:active {
  transform: rotate(var(--r, 0deg)) scale(0.94);
}
.theme-icon {
  width: 21px;
  height: 21px;
  color: rgba(255, 255, 255, 0.95);
  filter: drop-shadow(0 1px 1px rgba(0, 0, 0, 0.3));
  pointer-events: none;
}

/* En móvil, el botón va abajo a la derecha */
@media (max-width: 600px) {
  .theme-toggle {
    top: auto;
    bottom: 18px;
    right: 18px;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

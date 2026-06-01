<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import ToolNav from '@/components/ToolNav.vue'
import { TOOLS } from '@/tools'

const route = useRoute()

// Ancho máximo del contenido según la herramienta activa.
// Las herramientas marcadas como 'wide' aprovechan más pantalla (p. ej. Escaleras).
const contentMax = computed(() => {
  const tool = TOOLS.find((t) => t.name === route.name)
  return tool?.width === 'wide' ? '880px' : '480px'
})
</script>

<template>
  <div class="app-shell" :style="{ '--content-max': contentMax }">
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>

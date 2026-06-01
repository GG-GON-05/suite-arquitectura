<script setup>
defineProps({
  title: { type: String, default: '📐 Suite de Arquitectura' },
  subtitle: { type: String, default: 'Herramientas para estudiar y diseñar planos' },
})
</script>

<template>
  <header class="app-header">
    <h1>{{ title }}</h1>
    <p>{{ subtitle }}</p>
  </header>
</template>

<style scoped>
.app-header {
  text-align: center;
  margin-bottom: 20px;
}
.app-header h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--brand-dark);
  letter-spacing: -0.5px;
}
.app-header p {
  font-size: 0.9rem;
  color: var(--muted);
  margin-top: 4px;
}
</style>

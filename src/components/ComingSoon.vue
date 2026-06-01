<script setup>
defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
})
</script>

<template>
  <div class="card coming-soon">
    <div class="emoji">🚧</div>
    <h2>{{ title }}</h2>
    <p class="status">Próximamente</p>
    <p v-if="description" class="desc">{{ description }}</p>
  </div>
</template>

<style scoped>
.coming-soon {
  text-align: center;
  padding: 48px 28px;
}
.emoji {
  font-size: 3rem;
  margin-bottom: 12px;
}
.coming-soon h2 {
  font-size: 1.25rem;
  color: var(--brand-dark);
  margin-bottom: 8px;
}
.status {
  display: inline-block;
  font-size: 0.72rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.6px;
  color: var(--accent);
  background: var(--accent-light);
  padding: 4px 12px;
  border-radius: 999px;
}
.desc {
  margin-top: 16px;
  color: var(--muted);
  font-size: 0.9rem;
  line-height: 1.5;
}
</style>

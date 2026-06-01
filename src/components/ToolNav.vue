<script setup>
import { RouterLink } from 'vue-router'
import { TOOLS } from '@/tools'
</script>

<template>
  <nav class="tool-nav" aria-label="Herramientas">
    <RouterLink
      v-for="tool in TOOLS"
      :key="tool.name"
      :to="tool.path"
      class="tool-tab"
      :class="{ soon: !tool.ready }"
    >
      <span class="tool-icon">{{ tool.icon }}</span>
      <span class="tool-label">{{ tool.label }}</span>
      <span v-if="!tool.ready" class="tool-badge">pronto</span>
    </RouterLink>
  </nav>
</template>

<style scoped>
.tool-nav {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 8px;
  width: 100%;
  max-width: var(--content-max, 480px);
  margin-bottom: 24px;
  transition: max-width 0.25s ease;
}
.tool-tab {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 10px 14px;
  border-radius: var(--radius-md);
  border: 1.5px solid var(--border);
  background: var(--surface);
  text-decoration: none;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.15s;
}
.tool-tab:hover {
  border-color: var(--brand);
  color: var(--brand);
}
.tool-tab.router-link-active {
  background: var(--brand-light);
  border-color: var(--brand);
  color: var(--brand-dark);
}
.tool-icon {
  font-size: 1.25rem;
  line-height: 1;
}
.tool-tab.soon {
  opacity: 0.7;
}
.tool-badge {
  position: absolute;
  top: -6px;
  right: -6px;
  background: var(--accent);
  color: #fff;
  font-size: 0.6rem;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 999px;
  text-transform: uppercase;
  letter-spacing: 0.3px;
}
</style>

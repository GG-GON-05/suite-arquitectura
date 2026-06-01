import { createRouter, createWebHashHistory } from 'vue-router'
import { TOOLS } from '@/tools'

const routes = TOOLS.map((tool) => ({
  path: tool.path,
  name: tool.name,
  component: tool.component,
  meta: { title: tool.title },
}))

// Cualquier ruta desconocida vuelve al conversor.
routes.push({ path: '/:pathMatch(.*)*', redirect: '/' })

const router = createRouter({
  // Modo hash (#/ruta): funciona en GitHub Pages sin configurar redirecciones de servidor.
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

export default router

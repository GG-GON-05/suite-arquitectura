/**
 * Catálogo central de herramientas de la suite.
 * Lo consumen el router (para generar rutas) y la navegación (ToolNav).
 * Añadir un módulo nuevo = añadir una entrada aquí + su componente en views/.
 */
export const TOOLS = [
  {
    path: '/',
    name: 'conversor',
    icon: '📐',
    label: 'Conversor',
    title: 'Conversor de escalas',
    ready: true,
    component: () => import('@/views/ScaleConverter.vue'),
  },
  {
    path: '/areas',
    name: 'areas',
    icon: '📏',
    label: 'Áreas',
    title: 'Cálculo de superficies',
    ready: true,
    width: 'wide',
    component: () => import('@/views/AreaCalc.vue'),
  },
  {
    path: '/escaleras',
    name: 'escaleras',
    icon: '🪜',
    label: 'Escaleras',
    title: 'Calculadora de escaleras',
    ready: true,
    width: 'wide',
    component: () => import('@/views/StairsCalc.vue'),
  },
  {
    path: '/rampas',
    name: 'rampas',
    icon: '♿',
    label: 'Rampas',
    title: 'Rampas y accesibilidad',
    ready: true,
    width: 'wide',
    component: () => import('@/views/RampCalc.vue'),
  },
  {
    path: '/soleamiento',
    name: 'soleamiento',
    icon: '☀️',
    label: 'Soleamiento',
    title: 'Estudio de soleamiento',
    ready: true,
    width: 'wide',
    component: () => import('@/views/SunStudy.vue'),
  },
]

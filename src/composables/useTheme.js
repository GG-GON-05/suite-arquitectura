import { ref } from 'vue'

/**
 * Gestión del tema de color de la app. Cambia el atributo `data-theme` en
 * <html>, que activa la paleta correspondiente de tokens CSS (ver styles.css),
 * y recuerda la elección en localStorage.
 */
const STORAGE_KEY = 'arch-theme'

export const THEMES = [
  {
    id: 'indigo',
    label: 'Azul',
    swatch: '#5B6AF0',
    icon: 'cloud',
    metal: ['#97A2F7', '#5B6AF0', '#2E3AA8'], // claro, medio, oscuro
  },
  {
    id: 'rosa',
    label: 'Rosa',
    swatch: '#C2729A',
    icon: 'heart',
    metal: ['#E2AAC6', '#C2729A', '#7E3F62'],
  },
]

const theme = ref('indigo')

let animTimer
function setTheme(id, animate = true) {
  theme.value = id
  const root = document.documentElement
  if (animate) {
    // Activa un crossfade global de colores solo durante el cambio.
    root.classList.add('theme-anim')
    clearTimeout(animTimer)
    animTimer = setTimeout(() => root.classList.remove('theme-anim'), 500)
  }
  root.setAttribute('data-theme', id)
  try {
    localStorage.setItem(STORAGE_KEY, id)
  } catch (_) {}
}

function initTheme() {
  let saved = 'indigo'
  try {
    saved = localStorage.getItem(STORAGE_KEY) || 'indigo'
  } catch (_) {}
  setTheme(THEMES.some((t) => t.id === saved) ? saved : 'indigo', false)
}

export function useTheme() {
  return { theme, THEMES, setTheme }
}

export { initTheme }

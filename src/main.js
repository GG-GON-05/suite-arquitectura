import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { usePrefsStore } from './stores/prefs'
import { initTheme } from './composables/useTheme'
import './assets/styles.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restaurar preferencias y tema guardados antes de montar.
usePrefsStore().load()
initTheme()

app.mount('#app')

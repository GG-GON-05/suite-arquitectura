import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { usePrefsStore } from './stores/prefs'
import './assets/styles.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)

// Restaurar preferencias guardadas antes de montar.
usePrefsStore().load()

app.mount('#app')

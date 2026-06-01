import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// En producción la app vive en https://<usuario>.github.io/suite-arquitectura/,
// así que el `base` debe coincidir con el nombre del repo. En desarrollo se sirve en la raíz.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/suite-arquitectura/' : '/',
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
}))

import { defineStore } from 'pinia'

const STORAGE_KEY = 'arch-conv'

/**
 * Preferencias del conversor de escalas, compartidas en toda la suite.
 * Persisten en localStorage bajo la misma clave que usaba el HTML original,
 * de modo que las preferencias del usuario se conservan tras la migración.
 */
export const usePrefsStore = defineStore('prefs', {
  state: () => ({
    mode: 'real', // 'real' (real→plano) | 'plan' (plano→real)
    unit: 'mm',
    resultUnit: 'mm',
    scale: 50,
    customScale: null,
    isCustom: false,
  }),

  getters: {
    // Escala efectiva (presets o personalizada). null si la personalizada es inválida.
    effectiveScale: (state) => (state.isCustom ? state.customScale : state.scale),
  },

  actions: {
    load() {
      try {
        const raw = localStorage.getItem(STORAGE_KEY)
        if (!raw) return
        const p = JSON.parse(raw)
        this.mode = p.mode || 'real'
        this.unit = p.unit || 'mm'
        this.resultUnit = p.resultUnit || 'mm'
        this.scale = p.scale || 50
        this.customScale = p.customScale ?? null
        this.isCustom = p.isCustom || false
      } catch (_) {
        /* preferencias corruptas → se ignoran y se usan los valores por defecto */
      }
    },

    save() {
      try {
        localStorage.setItem(
          STORAGE_KEY,
          JSON.stringify({
            mode: this.mode,
            unit: this.unit,
            resultUnit: this.resultUnit,
            scale: this.scale,
            customScale: this.customScale,
            isCustom: this.isCustom,
          }),
        )
      } catch (_) {
        /* almacenamiento no disponible → se omite silenciosamente */
      }
    },
  },
})

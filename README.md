# 📐 Suite de Arquitectura

> Colección de herramientas visuales para **estudiantes de arquitectura**: convertir escalas,
> calcular superficies, dimensionar escaleras y rampas, y estudiar el soleamiento en 3D.

**🔗 App en vivo:** https://gg-gon-05.github.io/suite-arquitectura/

Funciona en el navegador (móvil o escritorio), sin instalar nada.

---

## ✨ Módulos

| | Herramienta | Qué hace |
|---|---|---|
| 📐 | **Conversor de escalas** | Convierte medidas entre plano y realidad (1:50, 1:100, escalas personalizadas) en mm/cm/m/in/ft. |
| 📏 | **Áreas** | Cuadro de superficies editable con barra proporcional, superficie útil y construida, y exportación. |
| 🪜 | **Escaleras** | Calcula contrahuella y huella con la **fórmula de Blondel**, con diagrama en vivo y semáforo de comodidad. |
| ♿ | **Rampas** | Pendiente y longitud según accesibilidad (**CTE DB-SUA**), con ajuste óptimo y aviso de rellanos. |
| ☀️ | **Soleamiento** | Escena **3D** con sombras reales según latitud, fecha, hora y orientación de la fachada. |

Cada herramienta recalcula y redibuja **en tiempo real** al mover los controles.

---

## 🛠️ Tecnologías

- [Vue 3](https://vuejs.org/) (Composition API, `<script setup>`)
- [Vite](https://vite.dev/) — build y servidor de desarrollo
- [Vue Router](https://router.vuejs.org/) — navegación entre herramientas
- [Pinia](https://pinia.vuejs.org/) — estado compartido
- [Three.js](https://threejs.org/) — escena 3D de soleamiento
- **SVG nativo** para los diagramas 2D (escaleras, rampas)

Sin dependencias de pago ni servicios externos: la app funciona offline una vez cargada.

---

## 🚀 Desarrollo local

Requiere [Node.js](https://nodejs.org/) 20+.

```bash
npm install        # instalar dependencias
npm run dev        # servidor de desarrollo → http://localhost:5173
npm run build      # compilar para producción (carpeta dist/)
npm run preview    # previsualizar la build
```

### Scripts de servicios

Gestión del servidor de desarrollo en segundo plano:

```bash
npm run up         # levantar
npm run status     # ver estado
npm run reup       # reiniciar
npm run down       # bajar
```

---

## 📁 Estructura

```
src/
├── tools.js              # catálogo central de herramientas (genera router y navegación)
├── router/               # rutas (modo hash)
├── stores/               # estado Pinia (preferencias del conversor)
├── assets/styles.css     # design tokens y estilos compartidos
├── composables/          # lógica pura por módulo (useScale, useStairs, useRamp, useSolar, useAreas)
├── components/
│   ├── ui/               # ToggleGroup, RangeSlider, CopyButton
│   └── diagrams/         # StairsDiagram, RampDiagram, SunScene (3D)
└── views/                # una vista por herramienta
```

**Añadir un módulo nuevo:** crear su vista en `src/views/`, su lógica en `src/composables/`,
y registrar una entrada en `src/tools.js`. El router y la navegación se actualizan solos.

---

## 🌐 Despliegue

Desplegado gratis en **GitHub Pages** mediante GitHub Actions
([`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)): cada `git push` a `main`
compila y publica automáticamente.

```bash
git add -A && git commit -m "tu cambio" && git push   # la web se actualiza en ~1 min
```

---

## 📜 Origen

Nació como un único conversor de escalas en HTML (`medidas_arq.html`, conservado como
referencia) y creció hasta esta suite modular en Vue.

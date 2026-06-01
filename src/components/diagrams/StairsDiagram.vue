<script setup>
import { computed } from 'vue'

/**
 * Sección (alzado lateral) de una escalera, dibujada a escala con SVG.
 * Se redibuja reactivamente al cambiar cualquier prop.
 * Todas las medidas en cm.
 */
const props = defineProps({
  nSteps: { type: Number, required: true },
  riser: { type: Number, required: true }, // contrahuella
  tread: { type: Number, required: true }, // huella
  totalHeight: { type: Number, required: true },
})

// Márgenes del lienzo (en unidades del viewBox ≈ px)
const PAD = { l: 62, r: 100, t: 24, b: 48 }
const MAX_W = 300 // ancho máx. del dibujo de la escalera
const MAX_H = 205 // alto máx.

const g = computed(() => {
  const n = Math.max(2, Math.round(props.nSteps))
  const { riser, tread, totalHeight: rise } = props
  const run = Math.max((n - 1) * tread, 1e-6)

  // Escala uniforme para encajar la escalera en el lienzo.
  const scale = Math.min(MAX_W / run, MAX_H / Math.max(rise, 1e-6))
  const drawW = run * scale
  const drawH = rise * scale
  const W = PAD.l + drawW + PAD.r
  const H = PAD.t + drawH + PAD.b
  const ox = PAD.l // origen (esquina inferior izquierda de la escalera)
  const oy = PAD.t + drawH

  const X = (x) => +(ox + x * scale).toFixed(2)
  const Y = (y) => +(oy - y * scale).toFixed(2)

  // Perfil escalonado (n contrahuellas, n−1 huellas).
  const cm = [[0, 0]]
  let x = 0
  for (let i = 1; i <= n; i++) {
    cm.push([x, i * riser]) // sube la contrahuella
    if (i < n) {
      x += tread
      cm.push([x, i * riser]) // avanza la huella
    }
  }
  const stepLine = cm.map((p) => `${X(p[0])},${Y(p[1])}`).join(' ')
  const fill = `${stepLine} ${X(run)},${Y(0)} ${X(0)},${Y(0)}`

  // Línea de pendiente (une el arranque con la llegada).
  const pitch = { x1: X(0), y1: Y(0), x2: X(run), y2: Y(rise) }

  // Escalón resaltado (uno central) para etiquetar huella y contrahuella.
  const i0 = Math.min(n - 1, Math.max(1, Math.round(n / 2)))
  const xb = (i0 - 1) * tread
  const ch = { x: X(xb), y1: Y((i0 - 1) * riser), y2: Y(i0 * riser) }
  const hh = { y: Y(i0 * riser), x1: X(xb), x2: X(i0 * tread) }
  const chLabel = { x: ch.x - 7, y: (ch.y1 + ch.y2) / 2 }
  const hhLabel = { x: (hh.x1 + hh.x2) / 2, y: hh.y - 7 }

  // Cota de altura total (a la izquierda).
  const dim = {
    x: PAD.l - 34,
    y1: Y(0),
    y2: Y(rise),
    tx: PAD.l - 47,
    ty: (Y(0) + Y(rise)) / 2,
  }

  // Arco del ángulo de inclinación en el arranque.
  const aRad = Math.atan2(riser, tread)
  const R = 30
  const arc = `M ${X(0) + R} ${Y(0)} A ${R} ${R} 0 0 0 ${(X(0) + R * Math.cos(aRad)).toFixed(2)} ${(Y(0) - R * Math.sin(aRad)).toFixed(2)}`
  const aLabel = {
    x: X(0) + (R + 16) * Math.cos(aRad / 2),
    y: Y(0) - (R + 16) * Math.sin(aRad / 2),
  }

  return {
    W,
    H,
    fill,
    stepLine,
    pitch,
    ch,
    hh,
    chLabel,
    hhLabel,
    dim,
    arc,
    aLabel,
    floorY: Y(0),
    topY: Y(rise),
    leftX: X(0),
    rightX: X(run),
    riserTxt: riser.toFixed(1),
    treadTxt: tread.toFixed(1),
    riseTxt: rise.toFixed(0),
    angleTxt: ((aRad * 180) / Math.PI).toFixed(1),
  }
})
</script>

<template>
  <div class="diagram">
    <svg
      :viewBox="`0 0 ${g.W} ${g.H}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Sección de la escalera a escala"
    >
      <defs>
        <marker id="arrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--muted)" />
        </marker>
      </defs>

      <!-- Suelos -->
      <line :x1="g.leftX - 20" :y1="g.floorY" :x2="g.rightX + 24" :y2="g.floorY"
            class="floor" />
      <line :x1="g.rightX" :y1="g.topY" :x2="g.rightX + 24" :y2="g.topY" class="floor" />

      <!-- Estructura de la escalera -->
      <polygon :points="g.fill" class="stair-fill" />
      <polyline :points="g.stepLine" class="stair-line" />

      <!-- Línea de pendiente -->
      <line :x1="g.pitch.x1" :y1="g.pitch.y1" :x2="g.pitch.x2" :y2="g.pitch.y2"
            class="pitch" />

      <!-- Cota de altura total -->
      <line :x1="g.dim.x" :y1="g.dim.y1" :x2="g.dim.x" :y2="g.dim.y2"
            class="dim-line" marker-start="url(#arrow)" marker-end="url(#arrow)" />
      <text :x="g.dim.tx" :y="g.dim.ty" class="dim-text"
            :transform="`rotate(-90 ${g.dim.tx} ${g.dim.ty})`">
        Altura {{ g.riseTxt }} cm
      </text>

      <!-- Escalón resaltado: contrahuella y huella -->
      <line :x1="g.ch.x" :y1="g.ch.y1" :x2="g.ch.x" :y2="g.ch.y2" class="hl-riser" />
      <line :x1="g.hh.x1" :y1="g.hh.y" :x2="g.hh.x2" :y2="g.hh.y" class="hl-tread" />
      <text :x="g.chLabel.x" :y="g.chLabel.y" class="hl-text riser" text-anchor="end">
        CH {{ g.riserTxt }}
      </text>
      <text :x="g.hhLabel.x" :y="g.hhLabel.y" class="hl-text tread" text-anchor="middle">
        H {{ g.treadTxt }}
      </text>

      <!-- Ángulo de inclinación -->
      <path :d="g.arc" class="angle-arc" />
      <text :x="g.aLabel.x" :y="g.aLabel.y" class="angle-text" text-anchor="middle">
        {{ g.angleTxt }}°
      </text>
    </svg>
  </div>
</template>

<style scoped>
.diagram {
  width: 100%;
  background: var(--bg);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  padding: 8px;
}
svg {
  width: 100%;
  height: auto;
  display: block;
}

/* Suelos */
.floor {
  stroke: var(--muted);
  stroke-width: 2;
  stroke-linecap: round;
}

/* Estructura */
.stair-fill {
  fill: var(--brand-light);
}
.stair-line {
  fill: none;
  stroke: var(--brand);
  stroke-width: 2.5;
  stroke-linejoin: round;
  stroke-linecap: round;
}

/* Línea de pendiente */
.pitch {
  stroke: var(--accent);
  stroke-width: 1.5;
  stroke-dasharray: 5 4;
}

/* Cotas */
.dim-line {
  stroke: var(--muted);
  stroke-width: 1.2;
}
.dim-text {
  fill: var(--muted);
  font-size: 11px;
  font-weight: 600;
  text-anchor: middle;
}

/* Resaltado de huella / contrahuella */
.hl-riser {
  stroke: var(--accent);
  stroke-width: 4;
  stroke-linecap: round;
}
.hl-tread {
  stroke: var(--brand-dark);
  stroke-width: 4;
  stroke-linecap: round;
}
.hl-text {
  font-size: 11px;
  font-weight: 700;
}
.hl-text.riser {
  fill: var(--accent);
}
.hl-text.tread {
  fill: var(--brand-dark);
}

/* Ángulo */
.angle-arc {
  fill: none;
  stroke: var(--text);
  stroke-width: 1.2;
}
.angle-text {
  fill: var(--text);
  font-size: 11px;
  font-weight: 700;
}
</style>

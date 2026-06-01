<script setup>
import { computed } from 'vue'

/**
 * Sección de una rampa dibujada a escala real (triángulo rectángulo).
 * Se redibuja al cambiar las props. Longitudes en cm.
 */
const props = defineProps({
  rise: { type: Number, required: true }, // altura a salvar
  run: { type: Number, required: true }, // longitud horizontal
  slopePct: { type: Number, required: true },
  status: { type: String, default: 'ok' }, // ok | warn | bad
})

const PAD = { l: 26, r: 88, t: 30, b: 42 }
const MAX_W = 600
const MAX_H = 165

const g = computed(() => {
  const rise = Math.max(props.rise, 1e-6)
  const run = Math.max(isFinite(props.run) ? props.run : MAX_W, 1e-6)

  const scale = Math.min(MAX_W / run, MAX_H / rise)
  const drawW = run * scale
  const drawH = rise * scale
  const W = PAD.l + drawW + PAD.r
  const H = PAD.t + drawH + PAD.b
  const ox = PAD.l
  const oy = PAD.t + drawH

  const X = (x) => +(ox + x * scale).toFixed(2)
  const Y = (y) => +(oy - y * scale).toFixed(2)

  // Vértices del triángulo: A (arranque), B (pie), C (cima).
  const A = [X(0), Y(0)]
  const B = [X(run), Y(0)]
  const C = [X(run), Y(rise)]
  const fill = `${A[0]},${A[1]} ${B[0]},${B[1]} ${C[0]},${C[1]}`

  // Punto medio de la rampa (para etiqueta de pendiente y silla).
  const mid = { x: X(run / 2), y: Y(rise / 2) }
  const chair = { x: X(run * 0.45), y: Y(rise * 0.45) - 8 }

  // Cota horizontal (longitud) bajo la base.
  const runDim = { y: oy + 18, x1: A[0], x2: B[0], tx: (A[0] + B[0]) / 2, ty: oy + 33 }
  // Cota vertical (altura) a la derecha.
  const riseDim = { x: X(run) + 34, y1: Y(0), y2: Y(rise), tx: X(run) + 52, ty: (Y(0) + Y(rise)) / 2 }

  const runM = (run / 100).toFixed(2)

  return { W, H, A, B, C, fill, mid, chair, runDim, riseDim, runM, riseTxt: rise.toFixed(0), slopeTxt: props.slopePct.toFixed(1) }
})
</script>

<template>
  <div class="diagram" :class="`s-${status}`">
    <svg
      :viewBox="`0 0 ${g.W} ${g.H}`"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Sección de la rampa a escala"
    >
      <defs>
        <marker id="rampArrow" markerWidth="7" markerHeight="7" refX="3.5" refY="3.5" orient="auto">
          <path d="M0,0 L7,3.5 L0,7 Z" fill="var(--muted)" />
        </marker>
      </defs>

      <!-- Relleno y superficie de la rampa -->
      <polygon :points="g.fill" class="ramp-fill" />
      <line :x1="g.A[0]" :y1="g.A[1]" :x2="g.C[0]" :y2="g.C[1]" class="ramp-line" />

      <!-- Suelo y arista vertical -->
      <line :x1="g.A[0] - 16" :y1="g.A[1]" :x2="g.B[0]" :y2="g.B[1]" class="ground" />
      <line :x1="g.C[0]" :y1="g.B[1]" :x2="g.C[0]" :y2="g.C[1]" class="edge" />

      <!-- Silla de ruedas (escala y sentido) -->
      <text :x="g.chair.x" :y="g.chair.y" class="chair" text-anchor="middle">♿</text>

      <!-- Etiqueta de pendiente sobre la rampa -->
      <text :x="g.mid.x" :y="g.mid.y - 10" class="slope-text" text-anchor="middle">
        {{ g.slopeTxt }}%
      </text>

      <!-- Cota de longitud -->
      <line :x1="g.runDim.x1" :y1="g.runDim.y" :x2="g.runDim.x2" :y2="g.runDim.y"
            class="dim-line" marker-start="url(#rampArrow)" marker-end="url(#rampArrow)" />
      <text :x="g.runDim.tx" :y="g.runDim.ty" class="dim-text" text-anchor="middle">
        Longitud {{ g.runM }} m
      </text>

      <!-- Cota de altura -->
      <line :x1="g.riseDim.x" :y1="g.riseDim.y1" :x2="g.riseDim.x" :y2="g.riseDim.y2"
            class="dim-line" marker-start="url(#rampArrow)" marker-end="url(#rampArrow)" />
      <text :x="g.riseDim.tx" :y="g.riseDim.ty" class="dim-text"
            :transform="`rotate(-90 ${g.riseDim.tx} ${g.riseDim.ty})`">
        Altura {{ g.riseTxt }} cm
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

.ground,
.edge {
  stroke: var(--muted);
  stroke-width: 2;
  stroke-linecap: round;
}
.ramp-line {
  fill: none;
  stroke-width: 3;
  stroke-linecap: round;
}

/* Color según cumplimiento */
.s-ok .ramp-fill {
  fill: #e8faf3;
}
.s-ok .ramp-line {
  stroke: var(--success);
}
.s-ok .slope-text {
  fill: #1a7a50;
}
.s-warn .ramp-fill {
  fill: #fff7e6;
}
.s-warn .ramp-line {
  stroke: #f0b429;
}
.s-warn .slope-text {
  fill: #a96b00;
}
.s-bad .ramp-fill {
  fill: var(--accent-light);
}
.s-bad .ramp-line {
  stroke: var(--accent);
}
.s-bad .slope-text {
  fill: #b03a2d;
}

.chair {
  font-size: 17px;
}
.slope-text {
  font-size: 13px;
  font-weight: 800;
}
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
</style>

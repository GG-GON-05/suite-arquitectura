<script setup>
import { ref, computed, watch } from 'vue'
import {
  roomArea,
  totalUseful,
  builtArea,
  fmtArea,
  exportText,
  AREA_PALETTE,
} from '@/composables/useAreas'
import RangeSlider from '@/components/ui/RangeSlider.vue'
import CopyButton from '@/components/ui/CopyButton.vue'

const STORAGE_KEY = 'arch-areas'

/* ── Estado ── */
const rooms = ref([
  { id: 1, name: 'Salón', w: 5, l: 4 },
  { id: 2, name: 'Cocina', w: 3, l: 2.5 },
  { id: 3, name: 'Dormitorio', w: 3.5, l: 3 },
  { id: 4, name: 'Baño', w: 2, l: 1.5 },
])
const wallPct = ref(15)
let nextId = 5

/* ── Persistencia en localStorage ── */
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    const d = JSON.parse(raw)
    if (Array.isArray(d.rooms) && d.rooms.length) rooms.value = d.rooms
    if (d.wallPct != null) wallPct.value = d.wallPct
    nextId = Math.max(0, ...rooms.value.map((r) => r.id || 0)) + 1
  } catch (_) {
    /* datos corruptos → se ignoran */
  }
}
load()

watch(
  [rooms, wallPct],
  () => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ rooms: rooms.value, wallPct: wallPct.value }))
    } catch (_) {}
  },
  { deep: true },
)

/* ── Acciones ── */
function addRoom() {
  rooms.value.push({ id: nextId++, name: '', w: null, l: null })
}
function removeRoom(i) {
  rooms.value.splice(i, 1)
}
const colorFor = (i) => AREA_PALETTE[i % AREA_PALETTE.length]

/* ── Derivados ── */
const useful = computed(() => totalUseful(rooms.value))
const built = computed(() => builtArea(useful.value, wallPct.value))
const segments = computed(() =>
  rooms.value
    .map((r, i) => ({ name: r.name || 'Estancia', area: roomArea(r.w, r.l), color: colorFor(i) }))
    .filter((s) => s.area > 0),
)
const copyText = computed(() => exportText(rooms.value, wallPct.value))
</script>

<template>
  <main class="card" role="main">
    <header class="view-head">
      <h2>📏 Cálculo de superficies</h2>
      <p>Añadí las estancias (en metros) y obtené el cuadro de superficies al instante.</p>
    </header>

    <!-- ── BARRA PROPORCIONAL ── -->
    <section v-if="segments.length" class="section" aria-label="Composición de superficies">
      <div class="area-bar">
        <div
          v-for="(s, i) in segments"
          :key="i"
          class="seg"
          :style="{ flexGrow: s.area, background: s.color }"
          :title="`${s.name}: ${fmtArea(s.area)} m²`"
        >
          <span v-if="s.area / useful > 0.08" class="seg-label">{{ Math.round((s.area / useful) * 100) }}%</span>
        </div>
      </div>
    </section>

    <!-- ── TABLA DE ESTANCIAS ── -->
    <section class="section rooms" aria-label="Estancias">
      <div class="room-head">
        <span></span>
        <span>Estancia</span>
        <span class="num">Ancho</span>
        <span></span>
        <span class="num">Largo</span>
        <span class="num">Área</span>
        <span></span>
      </div>

      <div v-for="(room, i) in rooms" :key="room.id" class="room-row">
        <span class="dot" :style="{ background: colorFor(i) }"></span>
        <input v-model="room.name" class="in-name" type="text" placeholder="Estancia" />
        <input v-model.number="room.w" class="in-num" type="number" min="0" step="any" placeholder="0" />
        <span class="mult">×</span>
        <input v-model.number="room.l" class="in-num" type="number" min="0" step="any" placeholder="0" />
        <span class="area">{{ fmtArea(roomArea(room.w, room.l)) }} m²</span>
        <button class="del-btn" :title="`Eliminar ${room.name || 'estancia'}`" @click="removeRoom(i)">
          ✕
        </button>
      </div>

      <button class="add-btn" @click="addRoom">+ Añadir estancia</button>
    </section>

    <!-- ── MUROS Y CIRCULACIONES ── -->
    <section class="section">
      <RangeSlider
        v-model="wallPct"
        :min="0"
        :max="30"
        :step="1"
        label="Muros y circulaciones"
        unit=" %"
      />
    </section>

    <!-- ── TOTALES ── -->
    <section class="section" aria-label="Totales">
      <div class="stats">
        <div class="stat ok">
          <span class="stat-label">Superficie útil</span>
          <span class="stat-value">{{ fmtArea(useful) }}<small>m²</small></span>
        </div>
        <div class="stat neutral">
          <span class="stat-label">Construida</span>
          <span class="stat-value">{{ fmtArea(built) }}<small>m²</small></span>
        </div>
        <div class="stat neutral">
          <span class="stat-label">Estancias</span>
          <span class="stat-value">{{ segments.length }}</span>
        </div>
      </div>
    </section>

    <CopyButton :text="copyText" label="Copiar cuadro de superficies" />
  </main>
</template>

<style scoped>
.view-head {
  margin-bottom: 18px;
}
.view-head h2 {
  font-size: 1.2rem;
  color: var(--brand-dark);
  margin-bottom: 4px;
}
.view-head p {
  font-size: 0.85rem;
  color: var(--muted);
  line-height: 1.4;
}

/* Barra proporcional */
.area-bar {
  display: flex;
  width: 100%;
  height: 34px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border);
}
.seg {
  min-width: 2px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: flex-grow 0.25s ease;
}
.seg-label {
  font-size: 0.72rem;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.25);
}

/* Tabla de estancias */
.rooms {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.room-head,
.room-row {
  display: grid;
  grid-template-columns: 16px 1fr 72px 16px 72px 86px 30px;
  align-items: center;
  gap: 8px;
}
.room-head {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.4px;
  color: var(--muted);
  padding: 0 2px;
}
.room-head .num {
  text-align: center;
}
.dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.in-name,
.in-num {
  padding: 9px 10px;
  font-size: 0.92rem;
  font-weight: 600;
  border: 1.5px solid var(--border);
  border-radius: var(--radius-sm);
  color: var(--text);
  background: var(--bg);
  outline: none;
  min-width: 0;
  transition: border-color 0.15s;
}
.in-num {
  text-align: center;
}
.in-name:focus,
.in-num:focus {
  border-color: var(--brand);
}
.mult {
  text-align: center;
  font-weight: 700;
  color: var(--muted);
}
.area {
  text-align: right;
  font-weight: 700;
  color: var(--brand-dark);
  font-size: 0.9rem;
}
.del-btn {
  width: 28px;
  height: 28px;
  border-radius: var(--radius-sm);
  border: 1.5px solid var(--border);
  background: var(--surface);
  color: var(--muted);
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.15s;
}
.del-btn:hover {
  border-color: var(--accent);
  color: var(--accent);
  background: var(--accent-light);
}
.add-btn {
  align-self: flex-start;
  margin-top: 4px;
  padding: 9px 16px;
  border-radius: var(--radius-sm);
  border: 1.5px dashed var(--brand);
  background: var(--brand-light);
  color: var(--brand-dark);
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.15s;
}
.add-btn:hover {
  background: var(--brand);
  color: #fff;
  border-style: solid;
}

.stats {
  grid-template-columns: repeat(3, 1fr);
}

@media (max-width: 520px) {
  .room-head {
    display: none;
  }
  .room-row {
    grid-template-columns: 14px 1fr 50px 12px 50px 60px 26px;
    gap: 6px;
  }
  .area {
    font-size: 0.78rem;
  }
}
</style>

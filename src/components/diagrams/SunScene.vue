<script setup>
import { onMounted, onBeforeUnmount, ref, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { computeSun } from '@/composables/useSolar'

/**
 * Escena 3D de soleamiento: un edificio que proyecta sombras según la posición
 * real del sol (latitud, día y hora). Órbita con el ratón/dedo.
 * +X = Este, +Z = Norte, +Y = arriba.
 */
const props = defineProps({
  latitude: { type: Number, required: true },
  dayOfYear: { type: Number, required: true },
  hour: { type: Number, required: true },
  buildingHeight: { type: Number, default: 6 }, // metros
  orientation: { type: Number, default: 180 }, // azimut al que mira la fachada principal
})

const container = ref(null)

const SUN_DIST = 60 // distancia del sol al origen (escala de escena)
const BASE = 6 // lado de la base del edificio (m)

let renderer, scene, camera, controls, raf, resizeObs
let sunLight, hemiLight, ambient
let sunMesh, sunGlow, sunPath, building, northArrow
let disposed = false

/* ── Inicialización ── */
function init() {
  const el = container.value
  const w = el.clientWidth || 600
  const h = el.clientHeight || 380

  scene = new THREE.Scene()
  scene.background = new THREE.Color('#bcd4f0')

  camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 400)
  camera.position.set(28, 22, 32)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  renderer.setSize(w, h)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  el.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true
  controls.maxPolarAngle = Math.PI / 2 - 0.02 // no bajar bajo el suelo
  controls.minDistance = 12
  controls.maxDistance = 120
  controls.target.set(0, 3, 0)

  /* ── Luces ── */
  ambient = new THREE.AmbientLight('#ffffff', 0.35)
  scene.add(ambient)

  hemiLight = new THREE.HemisphereLight('#cfe3ff', '#6b6256', 0.5)
  scene.add(hemiLight)

  sunLight = new THREE.DirectionalLight('#fff4e0', 2.2)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.set(2048, 2048)
  const s = sunLight.shadow.camera
  s.near = 1
  s.far = 200
  s.left = -40
  s.right = 40
  s.top = 40
  s.bottom = -40
  sunLight.shadow.bias = -0.0004
  scene.add(sunLight)
  scene.add(sunLight.target)

  /* ── Suelo ── */
  const ground = new THREE.Mesh(
    new THREE.CircleGeometry(45, 64),
    new THREE.MeshStandardMaterial({ color: '#e7ebd8', roughness: 1 }),
  )
  ground.rotation.x = -Math.PI / 2
  ground.receiveShadow = true
  scene.add(ground)

  // Rejilla sutil + rosa de los vientos implícita
  const grid = new THREE.GridHelper(80, 40, '#c4cbd6', '#dde2ea')
  grid.position.y = 0.01
  scene.add(grid)

  /* ── Edificio (la fachada principal, cara +Z, va en color coral) ── */
  const wall = new THREE.MeshStandardMaterial({ color: '#6a78f0', roughness: 0.7 })
  const facade = new THREE.MeshStandardMaterial({ color: '#F06A5B', roughness: 0.6 })
  // Orden de caras de BoxGeometry: +X, −X, +Y, −Y, +Z, −Z
  const faceMats = [wall, wall, wall, wall, facade, wall]
  building = new THREE.Mesh(new THREE.BoxGeometry(BASE, 1, BASE), faceMats)
  building.castShadow = true
  building.receiveShadow = true
  scene.add(building)

  /* ── Flecha de Norte (+Z), roja ── */
  northArrow = new THREE.Mesh(
    new THREE.ConeGeometry(0.9, 2.4, 16),
    new THREE.MeshStandardMaterial({ color: '#F06A5B' }),
  )
  northArrow.position.set(0, 0.4, 24)
  northArrow.rotation.x = Math.PI / 2
  scene.add(northArrow)

  /* ── Sol (esfera) ── */
  sunMesh = new THREE.Mesh(
    new THREE.SphereGeometry(2.2, 24, 24),
    new THREE.MeshBasicMaterial({ color: '#ffd23b' }),
  )
  scene.add(sunMesh)
  sunGlow = new THREE.Mesh(
    new THREE.SphereGeometry(3.4, 24, 24),
    new THREE.MeshBasicMaterial({ color: '#ffe98a', transparent: true, opacity: 0.35 }),
  )
  scene.add(sunGlow)

  /* ── Trayectoria solar del día (línea) ── */
  sunPath = new THREE.Line(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: '#f0a020' }),
  )
  scene.add(sunPath)

  updateBuilding()
  updateSun()

  resizeObs = new ResizeObserver(onResize)
  resizeObs.observe(el)
}

/* ── Escalar el edificio según su altura ── */
function updateBuilding() {
  const hgt = props.buildingHeight
  building.scale.y = hgt
  building.position.y = hgt / 2
  // La cara +Z (fachada) apunta al azimut indicado (N=0, E=90, S=180, O=270).
  building.rotation.y = (props.orientation * Math.PI) / 180
}

/* ── Recalcular el sol, sombras y trayectoria ── */
function updateSun() {
  const sun = computeSun({
    latitude: props.latitude,
    dayOfYear: props.dayOfYear,
    hour: props.hour,
  })

  // Posición del sol y de la luz direccional.
  const p = sun.dir
  sunLight.position.set(p.x * SUN_DIST, p.y * SUN_DIST, p.z * SUN_DIST)
  sunLight.target.position.set(0, 0, 0)
  sunMesh.position.copy(sunLight.position)
  sunGlow.position.copy(sunLight.position)

  // Día / noche: intensidad y cielo según la altura solar.
  const day = sun.isDay
  const t = Math.max(0, Math.sin(sun.altitudeRad)) // 0 en horizonte → 1 en cenit
  sunLight.intensity = day ? 1.0 + 1.8 * t : 0
  ambient.intensity = day ? 0.3 + 0.15 * t : 0.12
  hemiLight.intensity = day ? 0.5 : 0.15
  sunMesh.visible = day
  sunGlow.visible = day

  const sky = new THREE.Color('#0b1026').lerp(new THREE.Color('#bcd4f0'), t)
  scene.background = day ? sky : new THREE.Color('#0b1026')

  // Trayectoria del sol a lo largo del día (solo tramo sobre el horizonte).
  const pts = []
  for (let hh = 0; hh <= 24; hh += 0.25) {
    const s2 = computeSun({ latitude: props.latitude, dayOfYear: props.dayOfYear, hour: hh })
    if (s2.altitudeRad > 0) {
      pts.push(
        new THREE.Vector3(s2.dir.x * SUN_DIST, s2.dir.y * SUN_DIST, s2.dir.z * SUN_DIST),
      )
    }
  }
  sunPath.geometry.setFromPoints(pts)
  sunPath.visible = pts.length > 1
}

/* ── Bucle de render ── */
function animate() {
  if (disposed) return
  raf = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

function onResize() {
  if (!renderer || !container.value) return
  const w = container.value.clientWidth
  const h = container.value.clientHeight
  if (!w || !h) return
  camera.aspect = w / h
  camera.updateProjectionMatrix()
  renderer.setSize(w, h)
}

onMounted(() => {
  init()
  animate()
})

onBeforeUnmount(() => {
  disposed = true
  cancelAnimationFrame(raf)
  resizeObs?.disconnect()
  controls?.dispose()
  scene?.traverse((o) => {
    if (o.geometry) o.geometry.dispose()
    if (o.material) {
      const mats = Array.isArray(o.material) ? o.material : [o.material]
      mats.forEach((m) => m.dispose())
    }
  })
  renderer?.dispose()
  if (renderer?.domElement?.parentNode) {
    renderer.domElement.parentNode.removeChild(renderer.domElement)
  }
})

watch(() => [props.buildingHeight, props.orientation], updateBuilding)
watch(
  () => [props.latitude, props.dayOfYear, props.hour, props.buildingHeight],
  updateSun,
)
</script>

<template>
  <div ref="container" class="scene" aria-label="Escena 3D de soleamiento"></div>
</template>

<style scoped>
.scene {
  width: 100%;
  height: clamp(320px, 52vh, 460px);
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--border);
  background: #bcd4f0;
  cursor: grab;
  touch-action: none;
}
.scene:active {
  cursor: grabbing;
}
</style>

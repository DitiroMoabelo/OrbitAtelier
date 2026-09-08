import './style.css'
import * as THREE from 'three'
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js'
import { RectAreaLightUniformsLib } from 'three/addons/lights/RectAreaLightUniformsLib.js'
import { projects } from './data/projects'
import { isPhoneUA, isTouch, pixelCap, shadowMapSize, viewSize } from './device'
import { createDust, createNeonRig, createRoom, createRoomLights } from './scene/room'
import { createProps, setPropActive, setPropHover, updateProps } from './scene/props'
import { updateRgb } from './scene/rgb'
import { CameraRig } from './interaction/cameraRig'
import { PropPicker } from './interaction/picker'
import { BootScreen, ProjectPanel, PropNav } from './ui/overlay'
import { PropLabels, createLabelRenderer } from './ui/labels'

const canvas = document.getElementById('orbit-canvas') as HTMLCanvasElement | null
const noWebgl = document.getElementById('no-webgl')
const app = document.getElementById('app')

if (!canvas || !app) {
  throw new Error('Required DOM nodes missing')
}

let renderer: THREE.WebGLRenderer
try {
  // Prefer a permissive context: some GPUs reject high-performance hints
  // even though WebGL itself works.
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: !isPhoneUA,
    alpha: false,
    failIfMajorPerformanceCaveat: false,
    preserveDrawingBuffer: true,
  })
} catch (error) {
  noWebgl?.removeAttribute('hidden')
  const detail = noWebgl?.querySelector('[data-webgl-detail]')
  if (detail) {
    detail.textContent =
      error instanceof Error ? error.message : 'Could not create a WebGL context.'
  }
  throw new Error('WebGL unavailable')
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const boot = new BootScreen()
boot.setProgress(12, 'Unlocking the door…')

renderer.setClearColor(0x1c1618, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, pixelCap()))
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.05
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap
RectAreaLightUniformsLib.init()

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0x1c1618, 18, 42)
const pmrem = new THREE.PMREMGenerator(renderer)
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture
scene.environmentIntensity = 0.38

boot.setProgress(34, 'Painting the walls…')

const rig = new CameraRig(canvas)
scene.add(createRoom())

boot.setProgress(56, 'Plugging in the RGB…')

const lights = createRoomLights()
const map = shadowMapSize()
lights.sun.shadow.mapSize.set(map, map)
scene.add(lights.group)
const neon = createNeonRig()
scene.add(neon.group)

const dust = createDust()
scene.add(dust.points)

boot.setProgress(76, 'Setting up the battle station…')

const { root: propsRoot, handles } = createProps(projects)
scene.add(propsRoot)

const labelRenderer = createLabelRenderer(app)
const labels = new PropLabels(handles)

const picker = new PropPicker(handles)
let selectedId: string | null = null
let hoveredId: string | null = null

const panel = new ProjectPanel(() => {
  selectedId = null
  setPropActive(handles, null)
  nav.setActive(null)
  labels.setSelected(null)
  rig.resetHome()
  if (window.location.hash) history.replaceState(null, '', window.location.pathname)
})

const nav = new PropNav(projects, (id) => select(id))

function select(id: string, instant = false) {
  const handle = handles.find((item) => item.project.id === id)
  if (!handle) return

  selectedId = id
  setPropActive(handles, id)
  nav.setActive(id)
  labels.setSelected(id)

  const { focus, camOffset } = handle.project
  const target = new THREE.Vector3(...focus)
  const offset = new THREE.Vector3(...camOffset)
  if (instant) rig.snapTo(target, offset)
  else rig.focusOn(target, offset)

  panel.show(handle.project)
  history.replaceState(null, '', `#${id}`)
}

function resize() {
  const { width, height } = viewSize()
  renderer.setSize(width, height, false)
  labelRenderer.setSize(width, height)
  rig.resize(width, height)
}

window.addEventListener('resize', resize)
window.visualViewport?.addEventListener('resize', resize)
window.addEventListener('orientationchange', () => {
  window.setTimeout(() => {
    resize()
    if (!selectedId) rig.snapHome()
  }, 250)
})
resize()
if (!window.location.hash) rig.snapHome()

canvas.addEventListener('pointerdown', (event) => {
  picker.onPointerDown(event.clientX, event.clientY)
})

canvas.addEventListener('pointermove', (event) => {
  if (isTouch) return
  const rect = canvas.getBoundingClientRect()
  picker.setPointerFromEvent(event, rect)
  const next = picker.pick(rig.camera)?.project.id ?? null
  if (next !== hoveredId) {
    hoveredId = next
    setPropHover(handles, hoveredId)
    canvas.classList.toggle('is-hover', Boolean(hoveredId))
  }
})

canvas.addEventListener('pointerup', (event) => {
  if (!picker.wasClick(event.clientX, event.clientY)) return
  const rect = canvas.getBoundingClientRect()
  picker.setPointerFromEvent(event, rect)
  const hit = picker.pick(rig.camera)
  if (hit) select(hit.project.id)
})

canvas.addEventListener('pointerleave', () => {
  hoveredId = null
  setPropHover(handles, null)
  canvas.classList.remove('is-hover')
})

boot.setProgress(92, 'Catching dust in the neon…')

let last = performance.now()
let elapsed = 0

function frame(now: number) {
  const dt = Math.min((now - last) / 1000, 0.05)
  last = now
  if (!reducedMotion) elapsed += dt

  updateRgb(elapsed)
  dust.update(elapsed)
  updateProps(handles, dt, elapsed)
  rig.update(dt)

  renderer.render(scene, rig.camera)
  labelRenderer.render(scene, rig.camera)
  requestAnimationFrame(frame)
}

await boot.finish()
last = performance.now()
requestAnimationFrame(frame)

const deepLink = window.location.hash.slice(1)
if (deepLink) select(deepLink, true)

// Keep the selection state truthful if the panel is dismissed some other way.
window.addEventListener('blur', () => {
  if (!panel.open && selectedId) {
    selectedId = null
    setPropActive(handles, null)
    nav.setActive(null)
    labels.setSelected(null)
  }
})

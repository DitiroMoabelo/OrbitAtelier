import './style.css'
import * as THREE from 'three'
import { projects } from './data/projects'
import { createStarfield, updateStarfield } from './scene/starfield'
import { createSun, pulseSun } from './scene/sun'
import { createPlanets, setPlanetHover, updatePlanets } from './scene/planets'
import { CameraRig } from './interaction/cameraRig'
import { PlanetPicker } from './interaction/picker'
import { BootScreen, ProjectPanel } from './ui/overlay'
import { attachPlanetLabels, createLabelRenderer } from './ui/labels'

const canvas = document.getElementById('orbit-canvas') as HTMLCanvasElement | null
const noWebgl = document.getElementById('no-webgl')
const app = document.getElementById('app')

if (!canvas || !app) {
  throw new Error('Required DOM nodes missing')
}

let renderer: THREE.WebGLRenderer
try {
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
    preserveDrawingBuffer: true,
  })
} catch {
  noWebgl?.removeAttribute('hidden')
  throw new Error('WebGL unavailable')
}

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
const boot = new BootScreen()
boot.setProgress(12, 'Lighting the starfield…')

renderer.setClearColor(0x0f0c12, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.25

boot.setProgress(28, 'Placing the sun…')

const scene = new THREE.Scene()
scene.fog = new THREE.FogExp2(0x100c14, 0.018)

const rig = new CameraRig(canvas)
const starfield = createStarfield()
const sun = createSun()
const { root: planetRoot, handles } = createPlanets(projects)

scene.add(starfield)
scene.add(sun)
scene.add(planetRoot)
scene.add(new THREE.AmbientLight(0xfff0e8, 0.35))
scene.add(new THREE.HemisphereLight(0xffe8f0, 0x1a1020, 0.55))

boot.setProgress(55, 'Charting orbits…')

const labelRenderer = createLabelRenderer(app)
attachPlanetLabels(handles)

const picker = new PlanetPicker(handles)
let selectedId: string | null = null
let hoveredId: string | null = null

const panel = new ProjectPanel(() => {
  selectedId = null
  rig.resetHome()
  setPlanetHover(handles, hoveredId)
})

function resize() {
  const width = window.innerWidth
  const height = window.innerHeight
  renderer.setSize(width, height, false)
  labelRenderer.setSize(width, height)
  rig.resize(width, height)
}

window.addEventListener('resize', resize)
resize()

canvas.addEventListener('pointerdown', (event) => {
  picker.onPointerDown(event.clientX, event.clientY)
})

canvas.addEventListener('pointermove', (event) => {
  const rect = canvas.getBoundingClientRect()
  picker.setPointerFromEvent(event, rect)
  const hit = picker.pick(rig.camera)
  const next = hit?.id ?? null
  if (next !== hoveredId) {
    hoveredId = next
    setPlanetHover(handles, selectedId ?? hoveredId)
    canvas.classList.toggle('is-hover', Boolean(hoveredId))
  }
})

canvas.addEventListener('pointerup', (event) => {
  if (!picker.wasClick(event.clientX, event.clientY)) return
  const rect = canvas.getBoundingClientRect()
  picker.setPointerFromEvent(event, rect)
  const hit = picker.pick(rig.camera)
  if (!hit) return

  selectedId = hit.id
  setPlanetHover(handles, selectedId)
  const world = new THREE.Vector3()
  hit.group.getWorldPosition(world)
  rig.focusOn(world)
  panel.show(hit.project)
})

canvas.addEventListener('pointerleave', () => {
  hoveredId = null
  if (!selectedId) setPlanetHover(handles, null)
  canvas.classList.remove('is-hover')
})

boot.setProgress(82, 'Settling the camera…')

const clock = new THREE.Clock()

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05)
  const t = clock.elapsedTime

  updateStarfield(starfield, t, window.innerWidth, window.innerHeight)
  pulseSun(sun, t)
  updatePlanets(handles, dt, reducedMotion, selectedId)
  rig.update(dt)
  renderer.render(scene, rig.camera)
  labelRenderer.render(scene, rig.camera)
  requestAnimationFrame(frame)
}

await boot.finish()
requestAnimationFrame(frame)

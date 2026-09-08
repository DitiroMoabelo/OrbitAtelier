import './style.css'
import * as THREE from 'three'
import { projects } from './data/projects'
import { createAtelierRoom, createDust, updateDust } from './scene/atelier'
import { createMobile, impulseCharm, setCharmHover, updateMobile } from './scene/mobile'
import { CameraRig } from './interaction/cameraRig'
import { CharmPicker } from './interaction/picker'
import { BootScreen, ProjectPanel } from './ui/overlay'
import { attachCharmLabels, createLabelRenderer } from './ui/labels'

const canvas = document.getElementById('orbit-canvas') as HTMLCanvasElement | null
const noWebgl = document.getElementById('no-webgl')
const app = document.getElementById('app')

if (!canvas || !app) {
  throw new Error('Required DOM nodes missing')
}

let renderer: THREE.WebGLRenderer
try {
  // Prefer a permissive context: some GPUs reject high-performance hints
  // even though WebGL itself works (get.webgl.org still passes).
  renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
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
boot.setProgress(12, 'Opening the atelier…')

renderer.setClearColor(0xfff4ea, 1)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.setSize(window.innerWidth, window.innerHeight, false)
renderer.outputColorSpace = THREE.SRGBColorSpace
renderer.toneMapping = THREE.ACESFilmicToneMapping
renderer.toneMappingExposure = 1.15

boot.setProgress(30, 'Hanging the rail…')

const scene = new THREE.Scene()
scene.fog = new THREE.Fog(0xfff4ea, 12, 32)

const rig = new CameraRig(canvas)
const room = createAtelierRoom()
const dust = createDust()
const { root: mobileRoot, handles } = createMobile(projects)

scene.add(room)
scene.add(dust)
scene.add(mobileRoot)

const key = new THREE.DirectionalLight(0xfff0e8, 1.35)
key.position.set(-4, 6, 5)
scene.add(key)
scene.add(new THREE.AmbientLight(0xffe8f0, 0.55))
scene.add(new THREE.HemisphereLight(0xfff7ee, 0xe8d5c4, 0.7))
const fill = new THREE.PointLight(0xf7c7d3, 12, 18, 2)
fill.position.set(3, 2, 2)
scene.add(fill)

boot.setProgress(58, 'Balancing the charms…')

const labelRenderer = createLabelRenderer(app)
attachCharmLabels(handles)

const picker = new CharmPicker(handles)
let selectedId: string | null = null
let hoveredId: string | null = null

const panel = new ProjectPanel(() => {
  selectedId = null
  rig.resetHome()
  setCharmHover(handles, hoveredId)
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
    setCharmHover(handles, selectedId ?? hoveredId)
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
  setCharmHover(handles, selectedId)
  impulseCharm(hit, 1.1)
  const world = new THREE.Vector3()
  hit.charm.getWorldPosition(world)
  // Aim slightly above the charm so the label and body read clearly.
  world.y += 0.2
  rig.focusOn(world)
  panel.show(hit.project)
})

canvas.addEventListener('pointerleave', () => {
  hoveredId = null
  if (!selectedId) setCharmHover(handles, null)
  canvas.classList.remove('is-hover')
})

boot.setProgress(84, 'Settling dust in the light…')

const clock = new THREE.Clock()

function frame() {
  const dt = Math.min(clock.getDelta(), 0.05)
  const t = clock.elapsedTime

  updateDust(dust, t)
  updateMobile(handles, dt, t, reducedMotion, selectedId)
  rig.update(dt)
  renderer.render(scene, rig.camera)
  labelRenderer.render(scene, rig.camera)
  requestAnimationFrame(frame)
}

await boot.finish()
requestAnimationFrame(frame)

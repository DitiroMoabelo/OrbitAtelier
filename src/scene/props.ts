import * as THREE from 'three'
import type { PropKind, RoomProject } from '../data/projects'
import { ROOM } from './room'
import { registerRgb } from './rgb'

export type PropHandle = {
  project: RoomProject
  group: THREE.Group
  /** Meshes eligible for raycasting. */
  picks: THREE.Mesh[]
  /** Materials that brighten on hover/selection. */
  glow: THREE.MeshStandardMaterial[]
  ring: THREE.Mesh
  hover: number
  active: number
}

const WOOD = '#8E6B7E'
const WOOD_DARK = '#6E4F60'
const METAL = '#C9CCD2'
const DARK = '#2E2233'

function std(color: string, roughness = 0.7, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function glowMat(color: string, emissive = color, roughness = 0.5) {
  return new THREE.MeshStandardMaterial({
    color,
    roughness,
    emissive: new THREE.Color(emissive),
    emissiveIntensity: 0.12,
  })
}

function box(
  w: number,
  h: number,
  d: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

function cyl(
  rTop: number,
  rBottom: number,
  h: number,
  material: THREE.Material,
  x = 0,
  y = 0,
  z = 0,
  segments = 22,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

type Built = { group: THREE.Group; glow: THREE.MeshStandardMaterial[] }

export function createProps(projects: RoomProject[]): {
  root: THREE.Group
  handles: PropHandle[]
} {
  const root = new THREE.Group()
  root.name = 'props'
  const handles: PropHandle[] = []

  const builders: Record<PropKind, (p: RoomProject) => Built> = {
    bookshelf: buildBookshelf,
    desk: buildBattleStation,
    windowNook: buildWindowNook,
    kitchenette: buildKitchenette,
    nightstand: buildNightstand,
  }

  projects.forEach((project) => {
    const built = builders[project.prop](project)
    const group = built.group
    group.position.set(...project.position)
    group.rotation.y = project.rotationY
    group.name = project.id

    const ring = new THREE.Mesh(
      new THREE.RingGeometry(0.7, 1.15, 48),
      new THREE.MeshBasicMaterial({
        color: project.accent,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
      }),
    )
    ring.rotation.x = -Math.PI / 2
    ring.position.set(project.position[0], 0.03, project.position[2] + 0.6)
    root.add(ring)

    const picks: THREE.Mesh[] = []
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        child.userData.projectId = project.id
        picks.push(child)
      }
    })

    root.add(group)
    handles.push({ project, group, picks, glow: built.glow, ring, hover: 0, active: 0 })
  })

  return { root, handles }
}

export function setPropHover(handles: PropHandle[], id: string | null): void {
  handles.forEach((handle) => {
    handle.hover = handle.project.id === id ? 1 : 0
  })
}

export function setPropActive(handles: PropHandle[], id: string | null): void {
  handles.forEach((handle) => {
    handle.active = handle.project.id === id ? 1 : 0
  })
}

export function updateProps(handles: PropHandle[], dt: number, time: number): void {
  const ease = Math.min(1, dt * 7)

  handles.forEach((handle) => {
    const target = Math.max(handle.hover, handle.active)
    const current = (handle.group.userData.lit as number) ?? 0
    const lit = current + (target - current) * ease
    handle.group.userData.lit = lit

    handle.glow.forEach((material) => {
      material.emissiveIntensity = 0.12 + lit * 1.35
    })

    const ringMat = handle.ring.material as THREE.MeshBasicMaterial
    ringMat.opacity = lit * 0.55
    handle.ring.scale.setScalar(1 + Math.sin(time * 2.4) * 0.03 * lit)
    handle.group.position.y = lit * 0.035
  })
}

function buildBookshelf(project: RoomProject): Built {
  const group = new THREE.Group()
  const glow: THREE.MeshStandardMaterial[] = []

  const frame = std(WOOD, 0.75)
  const width = 2.1
  const height = 2.9
  const depth = 0.5

  group.add(box(0.1, height, depth, frame, -width / 2, height / 2, 0))
  group.add(box(0.1, height, depth, frame, width / 2, height / 2, 0))
  group.add(box(width, 0.1, depth, frame, 0, height, 0))
  group.add(box(width, 0.14, depth, frame, 0, 0.07, 0))
  group.add(box(width, height, 0.05, std('#3E2E45', 0.9), 0, height / 2, -depth / 2))

  const shelfYs = [0.78, 1.44, 2.1]
  shelfYs.forEach((y) => group.add(box(width - 0.1, 0.07, depth - 0.04, frame, 0, y, 0)))

  // Shelf-edge LED strips backlight the books.
  ;[0.14, 0.85, 1.51, 2.17].forEach((y, i) => {
    const strip = new THREE.MeshBasicMaterial({ color: '#FF8FD0' })
    registerRgb(strip, 0.2 + i * 0.14, { speed: 0.05, lightness: 0.6 })
    group.add(box(width - 0.16, 0.035, 0.035, strip, 0, y - 0.045, depth / 2 - 0.06))
  })

  // Books are the accent: hovering the shelf lights up every spine.
  const spineColors = ['#F7A8CE', '#E86FB0', '#B98BD6', '#8FD9E0', '#C7E8A5', '#F2D9A0', '#EB8FC9']
  const rows = [0.14, 0.85, 1.51, 2.17]

  rows.forEach((baseY, rowIndex) => {
    let x = -width / 2 + 0.14
    const rowHeight = rowIndex === 0 ? 0.6 : 0.55
    let i = 0
    // The top shelf is reserved for collectibles instead of books.
    const limit = rowIndex === 3 ? width / 2 - 0.95 : width / 2 - 0.2
    while (x < limit) {
      const thickness = 0.07 + ((i * 7 + rowIndex * 3) % 4) * 0.022
      const shelfH = rowHeight - ((i + rowIndex) % 3) * 0.05
      const color = spineColors[(i + rowIndex * 2) % spineColors.length]
      const material = glowMat(color, color, 0.55)
      glow.push(material)

      const leaning = (i + rowIndex) % 9 === 4
      const bookMesh = box(thickness, shelfH, depth - 0.14, material, x + thickness / 2, baseY + shelfH / 2, 0.01)
      if (leaning) {
        bookMesh.rotation.z = -0.22
        bookMesh.position.x += 0.05
      }
      group.add(bookMesh)

      x += thickness + 0.012
      i += 1
    }
  })

  // Collectibles: a plushie and a mini arcade cabinet share the top shelf.
  group.add(createPlushie('#F7A8CE', '#FFD9EA', 0.42, 2.36, 0.02, -0.4, 0.62))

  const cabinet = new THREE.Group()
  cabinet.position.set(0.86, 2.17, 0.02)
  cabinet.add(box(0.24, 0.42, 0.2, std(DARK, 0.6), 0, 0.21, 0))
  const arcadeMat = glowMat('#8FD9E0', '#8FD9E0', 0.4)
  glow.push(arcadeMat)
  cabinet.add(box(0.17, 0.14, 0.02, arcadeMat, 0, 0.3, 0.1))
  cabinet.add(box(0.19, 0.05, 0.06, std('#E86FB0', 0.5), 0, 0.16, 0.1))
  group.add(cabinet)

  // Flat-stacked books and a mug crowning the shelf.
  const flatMat = glowMat(project.color, project.accent, 0.5)
  glow.push(flatMat)
  group.add(box(0.72, 0.09, 0.5, flatMat, -0.4, height + 0.1, 0))
  group.add(box(0.66, 0.08, 0.46, std('#FFF3E6', 0.6), -0.4, height + 0.19, 0))
  group.add(cyl(0.1, 0.09, 0.19, std('#E86FB0', 0.5), 0.55, height + 0.15, 0.02, 20))

  return { group, glow }
}

/** The Helpdesk project lives on a full RGB battle station. */
function buildBattleStation(project: RoomProject): Built {
  const group = new THREE.Group()
  const glow: THREE.MeshStandardMaterial[] = []

  group.add(box(2.7, 0.09, 1.15, std('#F3E4EE', 0.5), 0, 0.78, 0))
  ;[-1.25, 1.25].forEach((x) => {
    ;[-0.47, 0.47].forEach((z) => group.add(box(0.09, 0.78, 0.09, std(WOOD_DARK, 0.6), x, 0.39, z)))
  })
  group.add(box(2.5, 0.06, 0.5, std(WOOD_DARK, 0.6), 0, 0.32, -0.25))

  // Under-desk glow strip.
  const underMat = new THREE.MeshBasicMaterial({ color: '#B98BD6' })
  registerRgb(underMat, 0.62, { speed: 0.05, lightness: 0.6 })
  group.add(box(2.4, 0.04, 0.04, underMat, 0, 0.7, 0.56))

  // Deskmat with an RGB border.
  group.add(box(1.9, 0.014, 0.72, std('#3E2E45', 0.85), 0.05, 0.792, 0.14))
  const matEdge = new THREE.MeshBasicMaterial({ color: '#FF8FD0' })
  registerRgb(matEdge, 0.05, { speed: 0.06, lightness: 0.62 })
  group.add(box(1.94, 0.008, 0.76, matEdge, 0.05, 0.788, 0.14))

  // Main monitor: the live helpdesk queue.
  const screenMat = glowMat('#2A2036', project.color, 0.3)
  glow.push(screenMat)
  group.add(cyl(0.2, 0.28, 0.04, std(DARK, 0.5), -0.4, 0.845, -0.28, 20))
  group.add(box(0.08, 0.42, 0.09, std(DARK, 0.5), -0.4, 1.06, -0.28))
  group.add(box(1.5, 0.84, 0.06, std(DARK, 0.45), -0.4, 1.66, -0.28))
  group.add(box(1.38, 0.72, 0.02, screenMat, -0.4, 1.66, -0.24))

  const rowMat = glowMat('#FFFFFF', '#FFFFFF', 0.4)
  glow.push(rowMat)
  const statusMat = glowMat(project.accent, project.accent, 0.4)
  glow.push(statusMat)
  for (let i = 0; i < 5; i += 1) {
    group.add(box(0.9 - i * 0.08, 0.05, 0.01, rowMat, -0.62, 1.9 - i * 0.14, -0.228))
    group.add(box(0.1, 0.05, 0.01, statusMat, 0.07, 1.9 - i * 0.14, -0.228))
  }

  // Monitor backlight bleeding onto the wall.
  const bias = new THREE.MeshBasicMaterial({ color: '#FF7FC4' })
  registerRgb(bias, 0.3, { speed: 0.045, lightness: 0.6 })
  group.add(box(1.5, 0.05, 0.05, bias, -0.4, 2.1, -0.31))

  // Secondary vertical monitor.
  group.add(cyl(0.15, 0.2, 0.04, std(DARK, 0.5), 0.95, 0.845, -0.3, 18))
  group.add(box(0.07, 0.34, 0.08, std(DARK, 0.5), 0.95, 1.02, -0.3))
  const sideBezel = box(0.52, 0.9, 0.05, std(DARK, 0.45), 0.98, 1.6, -0.3)
  sideBezel.rotation.y = -0.35
  group.add(sideBezel)
  const sideScreenMat = glowMat('#2A2036', '#8FD9E0', 0.3)
  glow.push(sideScreenMat)
  const sideScreen = box(0.44, 0.82, 0.02, sideScreenMat, 1.0, 1.6, -0.27)
  sideScreen.rotation.y = -0.35
  group.add(sideScreen)

  // Mechanical keyboard with per-key RGB.
  group.add(box(0.94, 0.05, 0.34, std('#3E2E45', 0.6), -0.1, 0.825, 0.22))
  const keyMats = ['#FF7FC4', '#B98BD6', '#8FD9E0', '#FFD9A0'].map((color, i) => {
    const material = new THREE.MeshBasicMaterial({ color })
    registerRgb(material, i * 0.16, { speed: 0.09, lightness: 0.62 })
    return material
  })
  for (let row = 0; row < 4; row += 1) {
    for (let col = 0; col < 13; col += 1) {
      const key = box(0.055, 0.018, 0.055, keyMats[(row + col) % keyMats.length], -0.52 + col * 0.068, 0.858, 0.11 + row * 0.062)
      group.add(key)
    }
  }

  // Mouse with a glowing scroll wheel.
  const mouse = new THREE.Mesh(new THREE.SphereGeometry(0.075, 18, 14), std('#3E2E45', 0.5))
  mouse.scale.set(0.75, 0.55, 1.15)
  mouse.position.set(0.62, 0.825, 0.26)
  mouse.castShadow = true
  group.add(mouse)
  const wheelMat = new THREE.MeshBasicMaterial({ color: '#FF7FC4' })
  registerRgb(wheelMat, 0.45, { speed: 0.08, lightness: 0.66 })
  group.add(box(0.016, 0.02, 0.04, wheelMat, 0.62, 0.865, 0.21))

  // Cat-ear headset on a stand.
  const stand = new THREE.Group()
  stand.position.set(-1.12, 0.83, -0.12)
  stand.add(cyl(0.11, 0.13, 0.03, std(DARK, 0.5), 0, 0.015, 0, 20))
  stand.add(cyl(0.025, 0.025, 0.44, std(METAL, 0.4, 0.5), 0, 0.24, 0, 12))
  stand.add(box(0.06, 0.03, 0.18, std(DARK, 0.5), 0, 0.46, 0))

  const headsetMat = std('#F3E4EE', 0.5)
  const band = new THREE.Mesh(new THREE.TorusGeometry(0.15, 0.028, 10, 26, Math.PI), headsetMat)
  band.position.set(0, 0.47, 0)
  band.rotation.y = Math.PI / 2
  stand.add(band)
  ;[-0.15, 0.15].forEach((z) => {
    const cup = cyl(0.085, 0.085, 0.06, headsetMat, 0, 0.44, z, 20)
    cup.rotation.x = Math.PI / 2
    stand.add(cup)
    const ringMat = new THREE.MeshBasicMaterial({ color: '#FF7FC4' })
    registerRgb(ringMat, 0.72, { speed: 0.07, lightness: 0.64 })
    const halo = new THREE.Mesh(new THREE.TorusGeometry(0.075, 0.012, 8, 22), ringMat)
    halo.position.set(0, 0.44, z + (z > 0 ? 0.032 : -0.032))
    halo.rotation.y = Math.PI / 2
    stand.add(halo)
  })
  // The cat ears.
  ;[-0.075, 0.075].forEach((z) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.055, 0.11, 16), headsetMat)
    ear.position.set(0, 0.61, z)
    ear.rotation.x = z > 0 ? 0.3 : -0.3
    stand.add(ear)
    const earMat = new THREE.MeshBasicMaterial({ color: '#FF9FCB' })
    registerRgb(earMat, 0.88, { speed: 0.07, lightness: 0.68 })
    const inner = new THREE.Mesh(new THREE.ConeGeometry(0.03, 0.065, 14), earMat)
    inner.position.set(0.028, 0.615, z)
    inner.rotation.x = z > 0 ? 0.3 : -0.3
    stand.add(inner)
  })
  group.add(stand)

  // Boom-arm microphone.
  const mic = new THREE.Group()
  mic.position.set(1.28, 0.83, 0.1)
  mic.add(box(0.12, 0.04, 0.12, std(DARK, 0.5), 0, 0.02, 0))
  const armA = cyl(0.018, 0.018, 0.52, std(DARK, 0.5), 0, 0.28, 0, 10)
  mic.add(armA)
  const armB = cyl(0.018, 0.018, 0.46, std(DARK, 0.5), -0.19, 0.52, 0, 10)
  armB.rotation.z = Math.PI / 2.4
  mic.add(armB)
  const capsule = new THREE.Mesh(new THREE.CapsuleGeometry(0.055, 0.11, 10, 18), std('#CFD4DB', 0.4, 0.5))
  capsule.position.set(-0.4, 0.58, 0)
  capsule.rotation.z = 0.35
  capsule.castShadow = true
  mic.add(capsule)
  const micLedMat = new THREE.MeshBasicMaterial({ color: '#8FD9E0' })
  registerRgb(micLedMat, 0.52, { speed: 0.07, lightness: 0.66 })
  mic.add(cyl(0.022, 0.022, 0.012, micLedMat, -0.4, 0.68, 0, 12))
  group.add(mic)

  // PC tower with a glass side and RGB fans.
  const tower = new THREE.Group()
  tower.position.set(1.55, 0, -0.25)
  tower.rotation.y = -0.22
  tower.add(box(0.5, 1.05, 0.95, std('#241A2B', 0.45, 0.2), 0, 0.53, 0))
  const glass = box(0.02, 0.92, 0.82, new THREE.MeshStandardMaterial({
    color: '#8FA0C8',
    roughness: 0.1,
    metalness: 0.2,
    transparent: true,
    opacity: 0.35,
  }), -0.255, 0.53, 0)
  tower.add(glass)
  ;[0.28, 0.55, 0.82].forEach((y, i) => {
    const fanMat = new THREE.MeshBasicMaterial({ color: '#FF7FC4' })
    registerRgb(fanMat, 0.18 + i * 0.22, { speed: 0.08, lightness: 0.62 })
    const fan = new THREE.Mesh(new THREE.TorusGeometry(0.105, 0.022, 10, 26), fanMat)
    fan.position.set(-0.23, y, 0.02)
    fan.rotation.y = Math.PI / 2
    tower.add(fan)
  })
  group.add(tower)

  // Racing-style gaming chair.
  const chair = new THREE.Group()
  chair.position.set(-0.15, 0, 1.15)
  chair.rotation.y = 0.12
  const chairMat = std('#F3E4EE', 0.7)
  const chairTrim = std('#E86FB0', 0.6)
  chair.add(box(0.66, 0.12, 0.62, chairMat, 0, 0.5, 0))
  chair.add(box(0.72, 0.04, 0.66, chairTrim, 0, 0.44, 0))
  const back = box(0.66, 0.9, 0.12, chairMat, 0, 0.98, -0.28)
  back.rotation.x = -0.12
  chair.add(back)
  ;[-0.28, 0.28].forEach((x) => {
    const bolster = box(0.09, 0.86, 0.16, chairTrim, x, 0.98, -0.24)
    bolster.rotation.x = -0.12
    chair.add(bolster)
    chair.add(box(0.09, 0.06, 0.34, chairTrim, x + (x > 0 ? 0.04 : -0.04), 0.72, -0.02))
    chair.add(box(0.07, 0.22, 0.07, std(DARK, 0.6), x + (x > 0 ? 0.04 : -0.04), 0.6, -0.02))
  })
  const headrest = box(0.36, 0.2, 0.14, chairTrim, 0, 1.5, -0.31)
  headrest.rotation.x = -0.12
  chair.add(headrest)
  chair.add(cyl(0.055, 0.075, 0.4, std(DARK, 0.4, 0.5), 0, 0.24, 0, 14))
  for (let i = 0; i < 5; i += 1) {
    const a = (i / 5) * Math.PI * 2
    chair.add(box(0.3, 0.045, 0.07, std(DARK, 0.5), Math.cos(a) * 0.17, 0.06, Math.sin(a) * 0.17).rotateY(-a))
    const caster = new THREE.Mesh(new THREE.SphereGeometry(0.045, 12, 10), std(DARK, 0.5))
    caster.position.set(Math.cos(a) * 0.31, 0.045, Math.sin(a) * 0.31)
    chair.add(caster)
  }
  group.add(chair)

  return { group, glow }
}

function buildWindowNook(project: RoomProject): Built {
  const group = new THREE.Group()
  const glow: THREE.MeshStandardMaterial[] = []

  const frameMat = std('#F0DCEA', 0.5)
  const sillMat = std('#E4CADA', 0.7)
  const zWall = ROOM.backZ + 0.16 - project.position[2]

  // Dusk sky beyond the glass — the reason the room is lit by neon.
  const pane = box(2.0, 1.85, 0.03, new THREE.MeshStandardMaterial({
    color: '#4E3E7A',
    roughness: 0.2,
    emissive: new THREE.Color('#7C5FA8'),
    emissiveIntensity: 0.85,
  }), 0, 2.55, zWall + 0.01)
  group.add(pane)

  const glowBand = box(1.9, 0.7, 0.02, new THREE.MeshBasicMaterial({ color: '#F09BB8' }), 0, 1.95, zWall - 0.02)
  group.add(glowBand)
  group.add(box(1.9, 0.32, 0.02, std('#3A2C52', 0.9), 0, 1.72, zWall - 0.05))

  const moon = new THREE.Mesh(new THREE.CircleGeometry(0.2, 32), new THREE.MeshBasicMaterial({ color: '#FFF3D8' }))
  moon.position.set(-0.55, 3.05, zWall - 0.04)
  group.add(moon)

  const starMat = new THREE.MeshBasicMaterial({ color: '#FFF6E0' })
  for (let i = 0; i < 22; i += 1) {
    const star = new THREE.Mesh(new THREE.CircleGeometry(0.012 + (i % 3) * 0.006, 8), starMat)
    star.position.set(-0.9 + Math.random() * 1.8, 2.35 + Math.random() * 1.1, zWall - 0.035)
    group.add(star)
  }

  group.add(box(2.3, 0.14, 0.16, frameMat, 0, 3.55, zWall + 0.06))
  group.add(box(2.3, 0.14, 0.16, frameMat, 0, 1.56, zWall + 0.06))
  group.add(box(0.14, 2.13, 0.16, frameMat, -1.08, 2.55, zWall + 0.06))
  group.add(box(0.14, 2.13, 0.16, frameMat, 1.08, 2.55, zWall + 0.06))
  group.add(box(0.09, 2.0, 0.12, frameMat, 0, 2.55, zWall + 0.06))
  group.add(box(2.1, 0.08, 0.12, frameMat, 0, 2.55, zWall + 0.06))
  group.add(box(2.6, 0.12, 0.44, sillMat, 0, 1.46, zWall + 0.2))

  // Bird on the sill — the BirdTrail accent.
  const bird = new THREE.Group()
  bird.position.set(0.72, 1.66, zWall + 0.26)
  bird.rotation.y = -0.6
  const bodyMat = glowMat(project.color, project.accent, 0.5)
  glow.push(bodyMat)
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.15, 22, 16), bodyMat)
  body.scale.set(1.15, 1, 0.95)
  body.castShadow = true
  bird.add(body)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.095, 18, 14), bodyMat)
  head.position.set(0.13, 0.13, 0)
  bird.add(head)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.035, 0.11, 12), std('#E89A5B', 0.5))
  beak.rotation.z = -Math.PI / 2
  beak.position.set(0.25, 0.12, 0)
  bird.add(beak)
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.07, 0.22, 10), bodyMat)
  tail.rotation.z = Math.PI / 2
  tail.position.set(-0.2, 0.02, 0)
  bird.add(tail)
  const wing = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), std(project.accent, 0.5))
  wing.scale.set(1.1, 0.45, 0.5)
  wing.position.set(-0.01, 0.03, 0.11)
  bird.add(wing)
  ;[-0.05, 0.05].forEach((z) => bird.add(cyl(0.012, 0.012, 0.1, std('#E89A5B', 0.5), 0.02, -0.14, z, 8)))
  group.add(bird)

  // Binoculars and a field notebook.
  const binos = new THREE.Group()
  binos.position.set(-0.62, 1.63, zWall + 0.26)
  binos.rotation.y = 0.35
  const binoMat = glowMat('#4A4F63', '#8FD9E0', 0.4)
  glow.push(binoMat)
  ;[-0.075, 0.075].forEach((x) => {
    const barrel = cyl(0.062, 0.07, 0.3, binoMat, x, 0.03, 0, 18)
    barrel.rotation.x = Math.PI / 2
    binos.add(barrel)
    const lens = cyl(0.05, 0.05, 0.02, std('#BFE0F5', 0.2, 0.3), x, 0.03, 0.155, 18)
    lens.rotation.x = Math.PI / 2
    binos.add(lens)
  })
  binos.add(box(0.09, 0.05, 0.16, binoMat, 0, 0.03, 0))
  group.add(binos)

  const notebook = box(0.34, 0.05, 0.26, std('#C9B07A', 0.7), -0.05, 1.55, zWall + 0.3)
  notebook.rotation.y = -0.3
  group.add(notebook)

  group.add(cyl(0.13, 0.1, 0.2, std('#E9A9C6', 0.7), 1.15, 1.62, zWall + 0.26, 18))
  for (let i = 0; i < 6; i += 1) {
    const a = (i / 6) * Math.PI * 2
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.075, 12, 10), std('#7FB98C', 0.8))
    leaf.scale.set(0.45, 1.5, 0.45)
    leaf.position.set(1.15 + Math.cos(a) * 0.07, 1.82 + (i % 2) * 0.08, zWall + 0.26 + Math.sin(a) * 0.07)
    leaf.rotation.z = Math.cos(a) * 0.5
    group.add(leaf)
  }

  return { group, glow }
}

function buildKitchenette(project: RoomProject): Built {
  const group = new THREE.Group()
  const glow: THREE.MeshStandardMaterial[] = []

  group.add(box(2.3, 0.88, 0.7, std('#C98BC0', 0.75), 0, 0.44, 0))
  group.add(box(2.42, 0.09, 0.78, std('#F6EDE2', 0.5), 0, 0.92, 0))
  group.add(box(2.3, 1.1, 0.05, std('#E4CADA', 0.85), 0, 1.5, -0.34))

  // Under-cabinet LED, because of course there is one.
  const underMat = new THREE.MeshBasicMaterial({ color: '#8FD9E0' })
  registerRgb(underMat, 0.4, { speed: 0.05, lightness: 0.62 })
  group.add(box(2.1, 0.035, 0.035, underMat, 0, 0.96, 0.34))

  ;[-0.56, 0.56].forEach((x) => {
    group.add(box(1.0, 0.5, 0.03, std('#B87BAE', 0.7), x, 0.6, 0.36))
    group.add(cyl(0.02, 0.02, 0.24, std(METAL, 0.35, 0.7), x, 0.6, 0.39, 12).rotateZ(Math.PI / 2))
  })

  // Stove with lit burners.
  group.add(box(0.94, 0.05, 0.62, std('#3C4150', 0.35, 0.4), -0.6, 0.97, 0))
  const flameMat = glowMat('#7FA8E8', '#5C8FE0', 0.3)
  glow.push(flameMat)
  ;[[-0.82, -0.14], [-0.38, -0.14], [-0.82, 0.16], [-0.38, 0.16]].forEach(([x, z]) => {
    const burner = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.022, 10, 24), flameMat)
    burner.rotation.x = -Math.PI / 2
    burner.position.set(x, 1.005, z)
    group.add(burner)
  })

  group.add(cyl(0.14, 0.17, 0.24, std('#CFD4DB', 0.3, 0.6), -0.82, 1.13, -0.14, 22))
  group.add(cyl(0.04, 0.05, 0.09, std('#CFD4DB', 0.3, 0.6), -0.82, 1.29, -0.14, 14))

  // The gas cylinders this business actually sells.
  const cylinderMat = new THREE.MeshStandardMaterial({
    color: project.color,
    roughness: 0.4,
    metalness: 0.25,
    emissive: new THREE.Color(project.accent),
    emissiveIntensity: 0.12,
  })
  glow.push(cylinderMat)

  const makeCylinder = (x: number, z: number, scale: number) => {
    const g = new THREE.Group()
    g.position.set(x, 0, z)
    g.scale.setScalar(scale)
    g.add(cyl(0.24, 0.24, 0.66, cylinderMat, 0, 0.35, 0, 28))
    const dome = new THREE.Mesh(new THREE.SphereGeometry(0.24, 26, 16, 0, Math.PI * 2, 0, Math.PI / 2), cylinderMat)
    dome.position.y = 0.68
    dome.castShadow = true
    g.add(dome)
    g.add(cyl(0.25, 0.25, 0.06, std('#4A4F63', 0.6), 0, 0.03, 0, 26))
    g.add(cyl(0.07, 0.07, 0.1, std(METAL, 0.35, 0.7), 0, 0.86, 0, 16))
    const collar = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.022, 8, 20), std(METAL, 0.35, 0.7))
    collar.rotation.x = Math.PI / 2
    collar.position.y = 0.84
    g.add(collar)
    const valve = new THREE.Mesh(new THREE.TorusGeometry(0.055, 0.016, 8, 18), std('#E86FB0', 0.4))
    valve.position.set(0.09, 0.9, 0)
    g.add(valve)
    g.add(cyl(0.245, 0.245, 0.2, std('#FFF6EA', 0.6), 0, 0.42, 0, 28))
    return g
  }

  group.add(makeCylinder(0.75, 0.62, 1))
  group.add(makeCylinder(1.28, 0.32, 0.72))

  return { group, glow }
}

function buildNightstand(project: RoomProject): Built {
  const group = new THREE.Group()
  const glow: THREE.MeshStandardMaterial[] = []

  group.add(box(0.9, 0.72, 0.7, std(WOOD, 0.7), 0, 0.36, 0))
  ;[0.52, 0.22].forEach((y) => {
    group.add(box(0.8, 0.26, 0.03, std('#A87A96', 0.6), 0, y, 0.36))
    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.035, 14, 10), std('#F0DCEA', 0.5))
    knob.position.set(0, y, 0.4)
    group.add(knob)
  })
  group.add(box(0.96, 0.05, 0.76, std('#A87A96', 0.6), 0, 0.74, 0))

  // Bedside lamp.
  group.add(cyl(0.11, 0.13, 0.03, std('#A87A96', 0.6), -0.26, 0.78, -0.12, 18))
  group.add(cyl(0.022, 0.022, 0.3, std(METAL, 0.4, 0.6), -0.26, 0.94, -0.12, 12))
  const shadeMat = new THREE.MeshStandardMaterial({
    color: '#FFE0EE',
    roughness: 0.6,
    side: THREE.DoubleSide,
    emissive: new THREE.Color('#FFB8DA'),
    emissiveIntensity: 0.12,
  })
  glow.push(shadeMat)
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.19, 0.22, 24, 1, true), shadeMat)
  shade.position.set(-0.26, 1.2, -0.12)
  group.add(shade)

  // First-aid kit — the MediBook accent.
  const kitMat = glowMat('#FFFFFF', project.accent, 0.45)
  glow.push(kitMat)
  const kit = new THREE.Group()
  kit.position.set(0.16, 0.9, 0.02)
  kit.rotation.y = 0.3
  kit.add(box(0.44, 0.28, 0.3, kitMat, 0, 0, 0))
  kit.add(box(0.46, 0.05, 0.32, std(project.color, 0.5), 0, 0.15, 0))
  const crossMat = std('#E86A7C', 0.4)
  kit.add(box(0.2, 0.06, 0.02, crossMat, 0, 0, 0.155))
  kit.add(box(0.06, 0.2, 0.02, crossMat, 0, 0, 0.155))
  const handle = new THREE.Mesh(new THREE.TorusGeometry(0.07, 0.014, 8, 18, Math.PI), std(DARK, 0.5))
  handle.position.set(0, 0.16, 0)
  kit.add(handle)
  group.add(kit)

  // Handheld console charging on the corner.
  const handheld = new THREE.Group()
  handheld.position.set(0.3, 0.79, 0.24)
  handheld.rotation.set(-Math.PI / 2, 0, 0.5)
  handheld.add(box(0.36, 0.2, 0.03, std('#F0DCEA', 0.5), 0, 0, 0))
  const handheldMat = glowMat('#2A2036', '#8FD9E0', 0.3)
  glow.push(handheldMat)
  handheld.add(box(0.2, 0.15, 0.01, handheldMat, 0, 0, 0.02))
  handheld.add(box(0.07, 0.18, 0.02, std('#E86FB0', 0.5), -0.145, 0, 0.02))
  handheld.add(box(0.07, 0.18, 0.02, std('#8FD9E0', 0.5), 0.145, 0, 0.02))
  group.add(handheld)

  // Appointment card and a glass of water.
  const cardLineMat = glowMat(project.color, project.color, 0.5)
  glow.push(cardLineMat)
  const card = box(0.3, 0.02, 0.22, std('#FFF6EA', 0.6), -0.08, 0.78, 0.3)
  card.rotation.y = -0.4
  group.add(card)
  const cardLine = box(0.2, 0.005, 0.03, cardLineMat, -0.08, 0.792, 0.26)
  cardLine.rotation.y = -0.4
  group.add(cardLine)

  group.add(cyl(0.055, 0.05, 0.16, new THREE.MeshStandardMaterial({
    color: '#DCEBFA',
    roughness: 0.1,
    transparent: true,
    opacity: 0.65,
  }), -0.32, 0.84, 0.24, 18))

  return { group, glow }
}

/** Round cat plushie, reused as a shelf collectible. */
function createPlushie(
  body: string,
  inner: string,
  x: number,
  y: number,
  z: number,
  rotY: number,
  scale: number,
): THREE.Group {
  const g = new THREE.Group()
  g.position.set(x, y, z)
  g.rotation.y = rotY
  g.scale.setScalar(scale)

  const bodyMat = std(body, 0.95)
  const core = new THREE.Mesh(new THREE.SphereGeometry(0.21, 22, 16), bodyMat)
  core.scale.set(1, 0.9, 0.95)
  core.castShadow = true
  g.add(core)

  ;[-0.11, 0.11].forEach((ex) => {
    const ear = new THREE.Mesh(new THREE.ConeGeometry(0.075, 0.14, 16), bodyMat)
    ear.position.set(ex, 0.2, 0)
    ear.rotation.z = ex > 0 ? -0.2 : 0.2
    g.add(ear)
    const earInner = new THREE.Mesh(new THREE.ConeGeometry(0.042, 0.08, 14), std(inner, 0.9))
    earInner.position.set(ex, 0.21, 0.03)
    earInner.rotation.z = ex > 0 ? -0.2 : 0.2
    g.add(earInner)
  })

  ;[-0.07, 0.07].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), std('#3A2A3D', 0.4))
    eye.position.set(ex, 0.03, 0.19)
    g.add(eye)
  })
  ;[-0.12, 0.12].forEach((ex) => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), std('#FF8FB4', 0.9))
    blush.scale.set(1, 0.6, 0.4)
    blush.position.set(ex, -0.02, 0.165)
    g.add(blush)
  })

  const belly = new THREE.Mesh(new THREE.SphereGeometry(0.13, 18, 14), std(inner, 0.95))
  belly.scale.set(1, 0.85, 0.5)
  belly.position.set(0, -0.05, 0.14)
  g.add(belly)

  return g
}

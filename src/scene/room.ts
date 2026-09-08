import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import { isPhoneUA } from '../device'
import { registerRgb } from './rgb'
import { maps } from './textures'

export const ROOM = {
  halfWidth: 7,
  depth: 9,
  backZ: -4.5,
  height: 5,
}

/** Dusk-lit gamer bedroom: real wood and plaster, with RGB as the accent. */
const WALL = '#6A5A72'
const WALL_LOWER = '#5C4C64'
const TRIM = '#E8D5C8'

function std(color: string, roughness = 0.75, metalness = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness, metalness })
}

function plaster(color: string) {
  const { plaster, bump } = maps()
  return new THREE.MeshStandardMaterial({
    color,
    map: plaster,
    bumpMap: bump,
    bumpScale: 0.028,
    roughness: 0.88,
  })
}

function woodFloor() {
  const { wood, bump } = maps()
  return new THREE.MeshStandardMaterial({
    color: '#D2B08A',
    map: wood,
    bumpMap: bump,
    bumpScale: 0.1,
    roughness: 0.72,
  })
}

function fabric(color: string, map: THREE.Texture) {
  return new THREE.MeshPhysicalMaterial({
    color,
    map,
    roughness: 0.82,
    sheen: 1,
    sheenRoughness: 0.55,
    sheenColor: new THREE.Color('#f3c4d6'),
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
  const radius = Math.min(0.04, w * 0.12, h * 0.12, d * 0.12)
  const mesh = new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 1, Math.max(radius, 0.004)), material)
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
  segments = 20,
): THREE.Mesh {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBottom, h, segments), material)
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  return mesh
}

export function createRoom(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'room'

  const wallMat = plaster(WALL)
  const wainscotMat = plaster(WALL_LOWER)
  const trimMat = std(TRIM, 0.45)

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.halfWidth * 2, ROOM.depth),
    woodFloor(),
  )
  floor.name = 'slot-floor'
  floor.rotation.x = -Math.PI / 2
  floor.position.z = ROOM.backZ + ROOM.depth / 2
  floor.receiveShadow = true
  root.add(floor)

  root.add(box(ROOM.halfWidth * 2, ROOM.height, 0.3, wallMat, 0, ROOM.height / 2, ROOM.backZ - 0.15))
  root.add(box(ROOM.halfWidth * 2, 1.15, 0.06, wainscotMat, 0, 0.575, ROOM.backZ + 0.02))
  root.add(box(ROOM.halfWidth * 2, 0.09, 0.12, trimMat, 0, 1.16, ROOM.backZ + 0.04))
  root.add(box(ROOM.halfWidth * 2, 0.16, 0.14, trimMat, 0, 0.08, ROOM.backZ + 0.05))

  const rightX = ROOM.halfWidth
  const midZ = ROOM.backZ + ROOM.depth / 2
  root.add(box(0.3, ROOM.height, ROOM.depth, wallMat, rightX + 0.15, ROOM.height / 2, midZ))
  root.add(box(0.06, 1.15, ROOM.depth, wainscotMat, rightX - 0.02, 0.575, midZ))
  root.add(box(0.12, 0.09, ROOM.depth, trimMat, rightX - 0.04, 1.16, midZ))
  root.add(box(0.14, 0.16, ROOM.depth, trimMat, rightX - 0.05, 0.08, midZ))
  root.add(box(0.3, ROOM.height, ROOM.depth, wallMat, -rightX - 0.15, ROOM.height / 2, midZ))

  const ceiling = new THREE.Mesh(
    new THREE.PlaneGeometry(ROOM.halfWidth * 2, ROOM.depth),
    plaster('#4A3C52'),
  )
  ceiling.rotation.x = Math.PI / 2
  ceiling.position.set(0, ROOM.height, midZ)
  root.add(ceiling)

  root.add(createRug())
  root.add(createBed())
  root.add(createPoster())
  root.add(createHangingPlant())

  return root
}

function createRug(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'slot-rug'
  const { fabricPink, bump } = maps()
  const pile = fabric('#E8B4C8', fabricPink)
  pile.bumpMap = bump
  pile.bumpScale = 0.03
  const base = new THREE.Mesh(new THREE.CircleGeometry(2.5, 64), pile)
  base.rotation.x = -Math.PI / 2
  base.position.set(0.3, 0.008, -0.4)
  base.receiveShadow = true
  g.add(base)

  const rings = ['#F3D0DC', '#C994B0', '#F7E6EE']
  rings.forEach((color, i) => {
    const ring = new THREE.Mesh(new THREE.RingGeometry(1.55 - i * 0.5, 1.75 - i * 0.5, 64), fabric(color, fabricPink))
    ring.rotation.x = -Math.PI / 2
    ring.position.set(0.3, 0.012 + i * 0.002, -0.4)
    g.add(ring)
  })
  return g
}

function createBed(): THREE.Group {
  const g = new THREE.Group()
  g.position.set(5.2, 0, 3.1)
  g.rotation.y = -Math.PI / 2

  const bed = new THREE.Group()
  bed.name = 'slot-bed'

  const { walnut, fabricPink, fabricCream } = maps()
  const frame = new THREE.MeshStandardMaterial({ color: '#8A5A48', map: walnut, roughness: 0.55 })
  bed.add(box(3.4, 0.42, 1.9, frame, 0, 0.28, 0))
  bed.add(box(0.18, 1.6, 1.9, frame, -1.7, 0.8, 0))
  bed.add(box(3.3, 0.32, 1.82, fabric('#F4E6DC', fabricCream), 0.03, 0.63, 0))
  bed.add(box(2.35, 0.3, 1.9, fabric('#E8A8C0', fabricPink), 0.5, 0.79, 0))
  bed.add(box(0.5, 0.32, 1.9, fabric('#C4A0D4', fabricPink), -0.75, 0.8, 0))

  const pillowMat = fabric('#F7F0EA', fabricCream)
  const pillowA = box(0.75, 0.26, 0.72, pillowMat, -1.25, 0.9, -0.42)
  pillowA.rotation.z = 0.08
  bed.add(pillowA)
  const pillowB = box(0.75, 0.26, 0.72, pillowMat, -1.25, 0.9, 0.42)
  pillowB.rotation.z = -0.06
  bed.add(pillowB)
  g.add(bed)

  // Plushies stay even when a GLB replaces slot-bed.
  g.add(createPlushie('#F7A8CE', '#FFD9EA', -0.55, 1.02, -0.35, 0.5))
  g.add(createPlushie('#B98BD6', '#E4CFF5', -0.35, 1.0, 0.42, -0.9))
  g.add(createPlushie('#8FD9E0', '#D6F4F7', 0.45, 0.98, 0.0, 0.2))

  return g
}

/** Round cat plushie: body, ears, and a stitched face. */
function createPlushie(
  body: string,
  inner: string,
  x: number,
  y: number,
  z: number,
  rotY: number,
): THREE.Group {
  const g = new THREE.Group()
  g.position.set(x, y, z)
  g.rotation.y = rotY

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

  const eyeMat = std('#3A2A3D', 0.4)
  ;[-0.07, 0.07].forEach((ex) => {
    const eye = new THREE.Mesh(new THREE.SphereGeometry(0.022, 12, 10), eyeMat)
    eye.position.set(ex, 0.03, 0.19)
    g.add(eye)
  })
  const blushMat = std('#FF8FB4', 0.9)
  ;[-0.12, 0.12].forEach((ex) => {
    const blush = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 10), blushMat)
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

function createPoster(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'slot-posters'
  const frameMat = std('#2E2233', 0.6)
  const shots: Array<[number, number, number, number, string]> = [
    [-1.9, 3.35, 0.62, 0.82, '#F19BC6'],
    [-0.9, 3.5, 0.46, 0.56, '#8FD9E0'],
  ]
  shots.forEach(([x, y, w, h, tint]) => {
    g.add(box(w, h, 0.06, frameMat, x, y, ROOM.backZ + 0.06))
    const art = new THREE.Mesh(
      new THREE.PlaneGeometry(w - 0.09, h - 0.09),
      new THREE.MeshStandardMaterial({
        color: tint,
        roughness: 0.7,
        emissive: new THREE.Color(tint),
        emissiveIntensity: 0.35,
      }),
    )
    art.position.set(x, y, ROOM.backZ + 0.1)
    g.add(art)
  })
  return g
}

function createHangingPlant(): THREE.Group {
  const g = new THREE.Group()
  g.name = 'slot-plant'
  g.position.set(-6.2, 0, -1.4)

  g.add(box(0.7, 0.06, 0.7, std('#7A5A6E', 0.7), 0, 0.6, 0))
  g.add(cyl(0.3, 0.22, 0.42, std('#E9A9C6', 0.7), 0, 0.84, 0, 24))

  const leafMat = std('#7FB98C', 0.8)
  for (let i = 0; i < 11; i += 1) {
    const a = (i / 11) * Math.PI * 2
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.16, 14, 10), leafMat)
    leaf.scale.set(0.42, 1.5, 0.42)
    leaf.position.set(Math.cos(a) * 0.24, 1.25 + (i % 3) * 0.2, Math.sin(a) * 0.24)
    leaf.rotation.z = Math.cos(a) * 0.5
    leaf.rotation.x = Math.sin(a) * 0.5
    leaf.castShadow = true
    g.add(leaf)
  }
  return g
}

/** Every glowing fixture in the room: hex panels, cove strips, neon, fairy lights. */
export function createNeonRig(): { group: THREE.Group; lights: THREE.PointLight[] } {
  const group = new THREE.Group()
  group.name = 'neon'
  const lights: THREE.PointLight[] = []

  group.add(createHexPanels())
  group.add(createCoveStrips())
  group.add(createNeonHeart())
  group.add(createFairyLights())
  group.add(createCornerLamp())

  const pinkGlow = new THREE.PointLight('#E8A0C0', 3.2, 7, 2)
  pinkGlow.position.set(-3.4, 2.6, ROOM.backZ + 1.2)
  const violetGlow = new THREE.PointLight('#B8A0D8', 2.8, 7, 2)
  violetGlow.position.set(3.4, 2.9, ROOM.backZ + 1.2)
  const cyanGlow = new THREE.PointLight('#A8D0D8', 2.2, 6, 2)
  cyanGlow.position.set(-6.2, 1.6, 0.6)
  lights.push(pinkGlow, violetGlow, cyanGlow)
  lights.forEach((light) => group.add(light))

  return { group, lights }
}

/** Honeycomb of RGB wall panels between the shelf and the desk. */
function createHexPanels(): THREE.Group {
  const g = new THREE.Group()
  const layout: Array<[number, number]> = [
    [0, 0],
    [0.46, 0.27],
    [0.46, -0.27],
    [-0.46, 0.27],
    [-0.46, -0.27],
    [0, 0.54],
    [0, -0.54],
    [0.92, 0],
    [-0.92, 0],
  ]

  layout.forEach(([dx, dy], i) => {
    const material = new THREE.MeshPhysicalMaterial({
      color: '#E8C0D4',
      roughness: 0.35,
      metalness: 0.05,
      emissive: new THREE.Color('#E8A0C4'),
      emissiveIntensity: 0.55,
      clearcoat: 0.25,
      clearcoatRoughness: 0.4,
    })
    registerRgb(material, i * 0.11, {
      speed: 0.28,
      saturation: 0.38,
      lightness: 0.56,
      tone: i % 3 === 0 ? 'pink' : i % 3 === 1 ? 'lilac' : 'mint',
    })

    const panel = new THREE.Mesh(new THREE.CylinderGeometry(0.26, 0.26, 0.05, 6), material)
    panel.rotation.x = Math.PI / 2
    panel.position.set(-3.4 + dx, 2.75 + dy, ROOM.backZ + 0.06)
    g.add(panel)
  })
  return g
}

/** LED strips tucked along the top of both walls. */
function createCoveStrips(): THREE.Group {
  const g = new THREE.Group()

  const back = new THREE.MeshStandardMaterial({
    color: '#FF7FC4',
    emissive: new THREE.Color('#FF7FC4'),
    emissiveIntensity: 0.9,
    roughness: 0.45,
  })
  registerRgb(back, 0.15, { speed: 0.22, lightness: 0.62, tone: 'pink' })
  g.add(box(ROOM.halfWidth * 2 - 0.4, 0.07, 0.07, back, 0, 4.42, ROOM.backZ + 0.14))

  const side = new THREE.MeshStandardMaterial({
    color: '#9B7BE8',
    emissive: new THREE.Color('#9B7BE8'),
    emissiveIntensity: 0.75,
    roughness: 0.45,
  })
  registerRgb(side, 0.55, { speed: 0.2, lightness: 0.58, tone: 'lilac' })
  g.add(box(0.07, 0.07, ROOM.depth - 0.4, side, ROOM.halfWidth - 0.14, 4.42, ROOM.backZ + ROOM.depth / 2))

  const skirt = new THREE.MeshStandardMaterial({
    color: '#7FE3F0',
    emissive: new THREE.Color('#7FE3F0'),
    emissiveIntensity: 0.55,
    roughness: 0.5,
  })
  // Skirt stays mint, no register — less motion noise near the floor.
  g.add(box(ROOM.halfWidth * 2 - 0.6, 0.045, 0.045, skirt, 0, 0.19, ROOM.backZ + 0.13))

  return g
}

/** Neon heart sign on the wall above the kitchenette. */
function createNeonHeart(): THREE.Group {
  const g = new THREE.Group()
  g.position.set(3.35, 3.0, ROOM.backZ + 0.14)

  const shape = new THREE.Shape()
  shape.moveTo(0, 0.22)
  shape.bezierCurveTo(0, 0.4, -0.18, 0.56, -0.38, 0.4)
  shape.bezierCurveTo(-0.66, 0.16, -0.26, -0.16, 0, -0.44)
  shape.bezierCurveTo(0.26, -0.16, 0.66, 0.16, 0.38, 0.4)
  shape.bezierCurveTo(0.18, 0.56, 0, 0.4, 0, 0.22)

  const tubeMat = new THREE.MeshStandardMaterial({
    color: '#FF5FA8',
    emissive: new THREE.Color('#FF5FA8'),
    emissiveIntensity: 1.4,
    roughness: 0.35,
  })
  const tube = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.07, bevelEnabled: false, curveSegments: 24 }),
    tubeMat,
  )
  g.add(tube)

  const halo = new THREE.Mesh(
    new THREE.ExtrudeGeometry(shape, { depth: 0.02, bevelEnabled: false, curveSegments: 24 }),
    new THREE.MeshBasicMaterial({
      color: '#FF9FCB',
      transparent: true,
      opacity: 0.16,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  halo.scale.set(1.22, 1.22, 1)
  halo.position.set(0, 0.02, 0.01)
  g.add(halo)

  const heartLight = new THREE.PointLight('#FF5FA8', 3.5, 5, 2)
  heartLight.position.set(0, 0, 0.6)
  g.add(heartLight)

  return g
}

/** Warm fairy-light garland sagging across the back wall. */
function createFairyLights(): THREE.Group {
  const g = new THREE.Group()
  const bulbMat = new THREE.MeshStandardMaterial({
    color: '#FFE0B0',
    emissive: new THREE.Color('#FFD9A0'),
    emissiveIntensity: 1.1,
    roughness: 0.55,
  })
  const wireMat = new THREE.LineBasicMaterial({ color: '#7A5A6E', transparent: true, opacity: 0.45 })

  const spans: Array<[number, number]> = [
    [-6.4, -2.1],
    [-2.1, 2.2],
    [2.2, 6.4],
  ]

  spans.forEach(([x0, x1]) => {
    const points: THREE.Vector3[] = []
    const steps = 22
    for (let i = 0; i <= steps; i += 1) {
      const t = i / steps
      const x = x0 + (x1 - x0) * t
      const sag = Math.sin(t * Math.PI) * 0.42
      points.push(new THREE.Vector3(x, 4.05 - sag, ROOM.backZ + 0.22))
    }
    g.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), wireMat))

    for (let i = 2; i < steps - 1; i += 3) {
      const p = points[i]
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.038, 10, 8), bulbMat)
      bulb.position.set(p.x, p.y - 0.06, p.z)
      g.add(bulb)
    }
  })

  return g
}

/** Floor lamp bar in the left corner. */
function createCornerLamp(): THREE.Group {
  const g = new THREE.Group()
  g.position.set(-6.3, 0, 1.4)

  g.add(cyl(0.24, 0.3, 0.06, std('#2E2233', 0.6), 0, 0.03, 0, 22))
  g.add(cyl(0.05, 0.05, 2.5, std('#2E2233', 0.5, 0.3), 0, 1.28, 0, 14))

  const barMat = new THREE.MeshStandardMaterial({
    color: '#A8D0D8',
    emissive: new THREE.Color('#7FE3F0'),
    emissiveIntensity: 0.85,
    roughness: 0.4,
  })
  g.add(box(0.07, 2.3, 0.07, barMat, 0.055, 1.35, 0.055))
  g.add(box(0.07, 2.3, 0.07, barMat, -0.055, 1.35, -0.055))

  return g
}

/** Dusk light coming through the window, kept restrained so materials read. */
export function createRoomLights(): { group: THREE.Group; sun: THREE.DirectionalLight } {
  const group = new THREE.Group()

  const sun = new THREE.DirectionalLight('#F2E4D4', 0.95)
  sun.position.set(-4.5, 9, 6)
  sun.castShadow = true
  const mapSize = isPhoneUA ? 512 : 2048
  sun.shadow.mapSize.set(mapSize, mapSize)
  sun.shadow.camera.near = 1
  sun.shadow.camera.far = 30
  sun.shadow.camera.left = -11
  sun.shadow.camera.right = 11
  sun.shadow.camera.top = 11
  sun.shadow.camera.bottom = -6
  sun.shadow.bias = -0.0004
  sun.shadow.normalBias = 0.03
  group.add(sun)

  group.add(new THREE.HemisphereLight('#EDE4DC', '#5A4A52', 0.26))

  const overhead = new THREE.PointLight('#FFE2C4', 4.2, 8, 2)
  overhead.position.set(0.3, 3.4, -0.4)
  group.add(overhead)

  const windowFill = new THREE.RectAreaLight('#B8C4E0', 3.0, 2.1, 1.9)
  windowFill.position.set(1.35, 2.55, ROOM.backZ + 0.3)
  windowFill.lookAt(1.35, 2.2, 0)
  group.add(windowFill)

  group.add(createPendantLamp())

  return { group, sun }
}

function createPendantLamp(): THREE.Group {
  const g = new THREE.Group()
  g.position.set(0.3, 0, -0.4)

  g.add(cyl(0.015, 0.015, 1.3, std('#2E2233', 0.8), 0, 4.35, 0, 8))

  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.62, 0.62, 32, 1, true),
    new THREE.MeshStandardMaterial({ color: '#F4B8D6', roughness: 0.6, side: THREE.DoubleSide }),
  )
  shade.rotation.x = Math.PI
  shade.position.y = 3.42
  g.add(shade)

  const bulb = new THREE.Mesh(
    new THREE.SphereGeometry(0.16, 20, 14),
    new THREE.MeshStandardMaterial({
      color: '#FFEBD2',
      emissive: new THREE.Color('#FFE6C8'),
      emissiveIntensity: 1.2,
      roughness: 0.5,
    }),
  )
  bulb.position.y = 3.2
  g.add(bulb)

  return g
}

export function createDust(): { points: THREE.Points; update: (time: number) => void } {
  const count = isPhoneUA ? 70 : 160
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    positions[i * 3] = (Math.random() - 0.5) * 13
    positions[i * 3 + 1] = Math.random() * 4.2 + 0.2
    positions[i * 3 + 2] = ROOM.backZ + Math.random() * ROOM.depth
    seeds[i] = Math.random() * Math.PI * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: '#FFD9F0',
      size: 0.035,
      transparent: true,
      opacity: 0.8,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  points.frustumCulled = false

  const attr = geometry.getAttribute('position') as THREE.BufferAttribute
  const baseY = Float32Array.from(positions.filter((_, i) => i % 3 === 1))

  const update = (time: number) => {
    for (let i = 0; i < count; i += 1) {
      const drift = ((time * 0.06 + seeds[i] * 0.4) % 4.4) - 0.1
      attr.setY(i, ((baseY[i] + drift) % 4.4) + 0.2)
      attr.setX(i, attr.getX(i) + Math.sin(time * 0.4 + seeds[i]) * 0.0009)
    }
    attr.needsUpdate = true
  }

  return { points, update }
}

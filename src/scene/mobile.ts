import * as THREE from 'three'
import type { CharmProject, CharmShape } from '../data/projects'
import { createVelvetMaterial, setVelvetGlow } from './velvet'

export type CharmHandle = {
  id: string
  project: CharmProject
  /** Pivot at the ceiling hook */
  pivot: THREE.Group
  /** Mesh group that hangs and sways */
  charm: THREE.Group
  body: THREE.Mesh
  material: THREE.ShaderMaterial
  thread: THREE.Line
  hook: THREE.Vector3
  restDrop: number
  angle: number
  velocity: number
  hover: boolean
  pull: number
}

const BAR_HALF = 4.2
const CEILING_Y = 3.35

function roundedTicket(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  const w = 0.55
  const h = 0.78
  const r = 0.08
  shape.moveTo(-w + r, -h)
  shape.lineTo(w - r, -h)
  shape.quadraticCurveTo(w, -h, w, -h + r)
  shape.lineTo(w, h - r)
  shape.quadraticCurveTo(w, h, w - r, h)
  shape.lineTo(-w + r, h)
  shape.quadraticCurveTo(-w, h, -w, h - r)
  shape.lineTo(-w, -h + r)
  shape.quadraticCurveTo(-w, -h, -w + r, -h)
  // Ticket notch
  const hole = new THREE.Path()
  hole.absarc(-w, 0, 0.1, -Math.PI / 2, Math.PI / 2, false)
  shape.holes.push(hole)
  return new THREE.ExtrudeGeometry(shape, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2 })
}

function openBook(): THREE.Group {
  const g = new THREE.Group()
  const page = new THREE.BoxGeometry(0.55, 0.75, 0.05)
  const left = new THREE.Mesh(page)
  left.position.set(-0.28, 0, 0)
  left.rotation.y = 0.35
  const right = new THREE.Mesh(page)
  right.position.set(0.28, 0, 0)
  right.rotation.y = -0.35
  const spine = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.12))
  g.add(left, right, spine)
  return g
}

function capsuleCharm(): THREE.BufferGeometry {
  return new THREE.CapsuleGeometry(0.28, 0.55, 6, 16)
}

function wingCharm(): THREE.BufferGeometry {
  const shape = new THREE.Shape()
  shape.moveTo(0, 0)
  shape.bezierCurveTo(0.2, 0.35, 0.7, 0.55, 1.0, 0.15)
  shape.bezierCurveTo(0.75, -0.05, 0.35, -0.15, 0, -0.05)
  shape.bezierCurveTo(-0.35, -0.15, -0.75, -0.05, -1.0, 0.15)
  shape.bezierCurveTo(-0.7, 0.55, -0.2, 0.35, 0, 0)
  return new THREE.ExtrudeGeometry(shape, {
    depth: 0.08,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.025,
    bevelSegments: 2,
  })
}

function lanternCharm(): THREE.Group {
  const g = new THREE.Group()
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 0.7, 16, 1, false))
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 0.16, 16))
  top.position.y = 0.42
  const bottom = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.22, 0.12, 16))
  bottom.position.y = -0.4
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.025, 8, 24))
  ring.position.y = 0.58
  ring.rotation.x = Math.PI / 2
  g.add(body, top, bottom, ring)
  return g
}

function buildShape(shape: CharmShape, material: THREE.Material): { root: THREE.Group; pickMesh: THREE.Mesh } {
  const root = new THREE.Group()
  if (shape === 'book') {
    const book = openBook()
    book.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) (obj as THREE.Mesh).material = material
    })
    root.add(book)
    const pick = book.children[1] as THREE.Mesh
    return { root, pickMesh: pick }
  }
  if (shape === 'lantern') {
    const lantern = lanternCharm()
    lantern.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) (obj as THREE.Mesh).material = material
    })
    root.add(lantern)
    return { root, pickMesh: lantern.children[0] as THREE.Mesh }
  }

  let geo: THREE.BufferGeometry
  switch (shape) {
    case 'ticket':
      geo = roundedTicket()
      geo.center()
      break
    case 'capsule':
      geo = capsuleCharm()
      break
    case 'wing':
      geo = wingCharm()
      geo.center()
      geo.rotateX(-0.4)
      break
    default:
      geo = new THREE.IcosahedronGeometry(0.45, 1)
  }
  const mesh = new THREE.Mesh(geo, material)
  root.add(mesh)
  return { root, pickMesh: mesh }
}

export function createMobile(projects: CharmProject[]): {
  root: THREE.Group
  handles: CharmHandle[]
} {
  const root = new THREE.Group()
  root.name = 'mobile'

  // Ceiling bar — brass-pink rail the charms hang from.
  const bar = new THREE.Mesh(
    new THREE.CapsuleGeometry(0.06, BAR_HALF * 2, 4, 12),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#E8B4C4'),
      metalness: 0.55,
      roughness: 0.35,
    }),
  )
  bar.rotation.z = Math.PI / 2
  bar.position.y = CEILING_Y
  root.add(bar)

  // End caps / ceiling mounts.
  for (const x of [-BAR_HALF - 0.15, BAR_HALF + 0.15]) {
    const mount = new THREE.Mesh(
      new THREE.SphereGeometry(0.11, 16, 16),
      new THREE.MeshStandardMaterial({ color: '#DCC6E8', metalness: 0.4, roughness: 0.4 }),
    )
    mount.position.set(x, CEILING_Y, 0)
    root.add(mount)
  }

  const handles: CharmHandle[] = []

  for (const project of projects) {
    const hook = new THREE.Vector3(project.slot * BAR_HALF, CEILING_Y, 0)
    const pivot = new THREE.Group()
    pivot.position.copy(hook)
    pivot.name = project.id

    const material = createVelvetMaterial(project.color, project.accent)
    const { root: charmRoot, pickMesh } = buildShape(project.shape, material)
    charmRoot.scale.setScalar(project.scale)
    charmRoot.position.y = -project.drop
    pickMesh.userData.projectId = project.id
    // Ensure every mesh in the charm can be raycast with the id.
    charmRoot.traverse((obj) => {
      if ((obj as THREE.Mesh).isMesh) obj.userData.projectId = project.id
    })

    const threadGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, -project.drop, 0),
    ])
    const thread = new THREE.Line(
      threadGeo,
      new THREE.LineBasicMaterial({
        color: new THREE.Color(project.accent),
        transparent: true,
        opacity: 0.55,
      }),
    )

    pivot.add(thread)
    pivot.add(charmRoot)
    root.add(pivot)

    handles.push({
      id: project.id,
      project,
      pivot,
      charm: charmRoot,
      body: pickMesh,
      material,
      thread,
      hook: hook.clone(),
      restDrop: project.drop,
      angle: project.phase,
      velocity: 0,
      hover: false,
      pull: 0,
    })
  }

  return { root, handles }
}

function updateThread(handle: CharmHandle) {
  const localCharm = new THREE.Vector3(0, handle.charm.position.y, 0)
  const positions = handle.thread.geometry.getAttribute('position') as THREE.BufferAttribute
  positions.setXYZ(0, 0, 0, 0)
  positions.setXYZ(1, localCharm.x, localCharm.y, localCharm.z)
  positions.needsUpdate = true
}

export function updateMobile(
  handles: CharmHandle[],
  dt: number,
  time: number,
  reducedMotion: boolean,
  selectedId: string | null,
) {
  for (const handle of handles) {
    const targetPull = handle.id === selectedId ? 1 : 0
    handle.pull += (targetPull - handle.pull) * Math.min(1, dt * 4)

    if (!reducedMotion) {
      // Pendulum: soft spring toward 0 with wind-like forcing.
      const wind = Math.sin(time * 0.55 + handle.project.phase) * handle.project.sway
      const accel = -2.4 * handle.angle + wind * 0.8 - handle.velocity * 0.55
      handle.velocity += accel * dt
      handle.angle += handle.velocity * dt
      handle.pivot.rotation.z = handle.angle * 0.55
      handle.pivot.rotation.x = Math.sin(time * 0.4 + handle.project.phase) * 0.08
    }

    const lift = handle.pull * 1.35
    const targetY = -(handle.restDrop - lift)
    handle.charm.position.y += (targetY - handle.charm.position.y) * Math.min(1, dt * 5)
    handle.charm.rotation.y = time * 0.15 + handle.project.phase

    const glow = handle.hover || handle.id === selectedId ? 1 : 0
    const current = handle.material.uniforms.uGlow.value as number
    setVelvetGlow(handle.material, current + (glow - current) * Math.min(1, dt * 8), time)

    // Dim non-selected charms when one is pulled close.
    if (selectedId && handle.id !== selectedId) {
      handle.material.uniforms.uGlow.value *= 0.35
      handle.charm.scale.setScalar(handle.project.scale * 0.92)
    } else {
      const s = handle.project.scale * (handle.hover ? 1.08 : 1)
      handle.charm.scale.setScalar(s)
    }

    updateThread(handle)
  }
}

export function setCharmHover(handles: CharmHandle[], id: string | null) {
  for (const handle of handles) {
    handle.hover = handle.id === id
  }
}

export function impulseCharm(handle: CharmHandle, strength = 0.9) {
  handle.velocity += strength
}

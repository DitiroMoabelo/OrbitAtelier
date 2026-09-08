import * as THREE from 'three'
import type { OrbitProject } from '../data/projects'

export type PlanetHandle = {
  id: string
  project: OrbitProject
  group: THREE.Group
  body: THREE.Mesh
  atmosphere: THREE.Mesh
  angle: number
  baseEmissive: THREE.Color
  hover: boolean
}

function makeBodyMaterial(color: string): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color(color),
    roughness: 0.55,
    metalness: 0.08,
    emissive: new THREE.Color(color).multiplyScalar(0.12),
    emissiveIntensity: 0.35,
  })
}

function makeAtmosphere(color: string, size: number): THREE.Mesh {
  return new THREE.Mesh(
    new THREE.SphereGeometry(size * 1.18, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color(color),
      transparent: true,
      opacity: 0.22,
      depthWrite: false,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
    }),
  )
}

function makeRing(color: string, size: number): THREE.Mesh {
  const geo = new THREE.RingGeometry(size * 1.35, size * 1.95, 64)
  const mat = new THREE.MeshBasicMaterial({
    color: new THREE.Color(color),
    transparent: true,
    opacity: 0.45,
    side: THREE.DoubleSide,
    depthWrite: false,
  })
  const ring = new THREE.Mesh(geo, mat)
  ring.rotation.x = Math.PI / 2.4
  return ring
}

function makeOrbitPath(radius: number): THREE.Line {
  const pts: THREE.Vector3[] = []
  const segments = 128
  for (let i = 0; i <= segments; i++) {
    const t = (i / segments) * Math.PI * 2
    pts.push(new THREE.Vector3(Math.cos(t) * radius, 0, Math.sin(t) * radius))
  }
  const geo = new THREE.BufferGeometry().setFromPoints(pts)
  const mat = new THREE.LineBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.12,
  })
  return new THREE.Line(geo, mat)
}

export function createPlanets(projects: OrbitProject[]): {
  root: THREE.Group
  handles: PlanetHandle[]
} {
  const root = new THREE.Group()
  root.name = 'planets'
  const handles: PlanetHandle[] = []

  projects.forEach((project, index) => {
    root.add(makeOrbitPath(project.orbitRadius))

    const group = new THREE.Group()
    group.name = project.id
    group.userData.projectId = project.id

    const body = new THREE.Mesh(
      new THREE.SphereGeometry(project.size, 48, 48),
      makeBodyMaterial(project.color),
    )
    body.castShadow = false
    body.userData.projectId = project.id
    group.add(body)

    const atmosphere = makeAtmosphere(project.atmosphere, project.size)
    group.add(atmosphere)

    if (project.hasRing && project.ringColor) {
      group.add(makeRing(project.ringColor, project.size))
    }

    // Stagger starting positions around the sun.
    const angle = (index / projects.length) * Math.PI * 2 + 0.4
    group.position.set(
      Math.cos(angle) * project.orbitRadius,
      Math.sin(angle * 0.7) * 0.15,
      Math.sin(angle) * project.orbitRadius,
    )

    root.add(group)

    const mat = body.material as THREE.MeshStandardMaterial
    handles.push({
      id: project.id,
      project,
      group,
      body,
      atmosphere,
      angle,
      baseEmissive: mat.emissive.clone(),
      hover: false,
    })
  })

  return { root, handles }
}

export function updatePlanets(
  handles: PlanetHandle[],
  dt: number,
  reducedMotion: boolean,
  frozenId: string | null = null,
) {
  for (const handle of handles) {
    const frozen = handle.id === frozenId
    if (!reducedMotion && !frozen) {
      handle.angle += handle.project.orbitSpeed * dt
      handle.group.position.set(
        Math.cos(handle.angle) * handle.project.orbitRadius,
        Math.sin(handle.angle * 0.7) * 0.18,
        Math.sin(handle.angle) * handle.project.orbitRadius,
      )
    }
    if (!reducedMotion) {
      handle.body.rotation.y += handle.project.spinSpeed * dt * (frozen ? 0.35 : 1)
    }

    const mat = handle.body.material as THREE.MeshStandardMaterial
    const targetIntensity = handle.hover ? 0.95 : 0.35
    mat.emissiveIntensity += (targetIntensity - mat.emissiveIntensity) * Math.min(1, dt * 8)

    const atm = handle.atmosphere.material as THREE.MeshBasicMaterial
    const targetOpacity = handle.hover ? 0.42 : 0.22
    atm.opacity += (targetOpacity - atm.opacity) * Math.min(1, dt * 8)
  }
}

export function setPlanetHover(handles: PlanetHandle[], id: string | null) {
  for (const handle of handles) {
    handle.hover = handle.id === id
  }
}

import * as THREE from 'three'
import { SURFACE_MAPS } from '../assets/slots'

const base = import.meta.env.BASE_URL || '/'

function assetUrl(path: string): string {
  return `${base}${path.replace(/^\//, '')}`
}

async function fileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (response.ok) return true
  } catch {
    /* ignore */
  }
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: { Range: 'bytes=0-0' },
    })
    return response.ok || response.status === 206
  } catch {
    return false
  }
}

async function loadMap(
  loader: THREE.TextureLoader,
  path: string,
  srgb: boolean,
  repeatX: number,
  repeatY: number,
): Promise<THREE.Texture | null> {
  const url = assetUrl(path)
  if (!(await fileExists(url))) return null
  const tex = await loader.loadAsync(url)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.repeat.set(repeatX, repeatY)
  tex.needsUpdate = true
  return tex
}

/**
 * Swaps procedural floor / rug materials for Poly Haven PBR maps when present.
 */
export async function upgradeRoomSurfaces(
  roomRoot: THREE.Object3D,
  onProgress?: (label: string) => void,
): Promise<string[]> {
  const loader = new THREE.TextureLoader()
  const loaded: string[] = []

  onProgress?.('Laying the floorboards…')
  const floorDiff = await loadMap(loader, SURFACE_MAPS.floor.diff, true, 5, 6)
  if (floorDiff) {
    const floorNor = await loadMap(loader, SURFACE_MAPS.floor.nor, false, 5, 6)
    const floorRough = await loadMap(loader, SURFACE_MAPS.floor.rough, false, 5, 6)
    const floor = roomRoot.getObjectByName('slot-floor')
    if (floor instanceof THREE.Mesh) {
      const mat = new THREE.MeshStandardMaterial({
        color: '#E8D2B4',
        map: floorDiff,
        normalMap: floorNor ?? undefined,
        roughnessMap: floorRough ?? undefined,
        roughness: 0.78,
      })
      if (floorNor) mat.normalScale.set(0.85, 0.85)
      floor.material = mat
      loaded.push('floor')
    }
  }

  onProgress?.('Unrolling the rug…')
  const carpetDiff = await loadMap(loader, SURFACE_MAPS.carpet.diff, true, 2.2, 2.2)
  if (carpetDiff) {
    const carpetNor = await loadMap(loader, SURFACE_MAPS.carpet.nor, false, 2.2, 2.2)
    const carpetRough = await loadMap(loader, SURFACE_MAPS.carpet.rough, false, 2.2, 2.2)
    const rug = roomRoot.getObjectByName('slot-rug')
    if (rug) {
      const pile = new THREE.MeshPhysicalMaterial({
        color: '#E8B4C8',
        map: carpetDiff,
        normalMap: carpetNor ?? undefined,
        roughnessMap: carpetRough ?? undefined,
        roughness: 0.92,
        sheen: 1,
        sheenRoughness: 0.65,
        sheenColor: new THREE.Color('#f3c4d6'),
      })
      if (carpetNor) pile.normalScale.set(1.1, 1.1)

      // Replace decorative rings with one high-quality disc.
      while (rug.children.length) rug.remove(rug.children[0])
      const disc = new THREE.Mesh(new THREE.CircleGeometry(2.55, 72), pile)
      disc.rotation.x = -Math.PI / 2
      disc.position.set(0.3, 0.01, -0.4)
      disc.receiveShadow = true
      rug.add(disc)
      loaded.push('carpet')
    }
  }

  return loaded
}

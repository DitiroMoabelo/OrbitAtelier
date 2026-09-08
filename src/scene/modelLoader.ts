import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
import { MeshoptDecoder } from 'three/addons/libs/meshopt_decoder.module.js'
import { MODEL_SLOTS, type ModelSlot } from '../assets/slots'
import type { PropHandle } from './props'

const base = import.meta.env.BASE_URL || '/'

function assetUrl(path: string): string {
  const clean = path.replace(/^\//, '')
  return `${base}${clean}`
}

function fitHeight(root: THREE.Object3D, targetHeight: number): number {
  const box = new THREE.Box3().setFromObject(root)
  const size = new THREE.Vector3()
  box.getSize(size)
  if (size.y < 0.001) return 1
  return targetHeight / size.y
}

function prepareModel(root: THREE.Object3D, castShadow = true): void {
  root.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = castShadow
      child.receiveShadow = true
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material && 'envMapIntensity' in material) {
          ;(material as THREE.MeshStandardMaterial).envMapIntensity = 1
        }
      })
    }
  })
}

function placeSlot(host: THREE.Object3D, model: THREE.Object3D, slot: ModelSlot): void {
  if (slot.replaces) {
    const old = host.getObjectByName(slot.replaces)
    if (old) {
      old.visible = false
      old.removeFromParent()
    }
  }

  if (slot.position) model.position.set(...slot.position)
  if (slot.rotationY !== undefined) model.rotation.y = slot.rotationY

  let scale = slot.scale ?? 1
  if (slot.targetHeight) scale = fitHeight(model, slot.targetHeight)
  model.scale.setScalar(scale)

  const box = new THREE.Box3().setFromObject(model)
  if (Number.isFinite(box.min.y)) {
    if (slot.ground === false && slot.position) {
      // Keep wall/desk props: snap the model's bottom to the given Y.
      model.position.y += slot.position[1] - box.min.y
    } else if (slot.ground !== false) {
      model.position.y -= box.min.y
    }
  }

  host.add(model)
}

async function loadOne(
  loader: GLTFLoader,
  slot: ModelSlot,
  roomRoot: THREE.Object3D,
  byId: Map<string, PropHandle>,
): Promise<string | null> {
  const url = assetUrl(`models/${slot.file}`)
  try {
    const gltf = await loader.loadAsync(url)
    const model = gltf.scene
    model.name = `gltf-${slot.file.replace(/\.glb$/i, '')}`
    prepareModel(model, slot.castShadow !== false)

    const host =
      slot.attachTo === 'room' ? roomRoot : byId.get(slot.attachTo)?.group ?? roomRoot

    placeSlot(host, model, slot)

    if (slot.attachTo !== 'room') {
      const handle = byId.get(slot.attachTo)
      if (handle) {
        model.traverse((child) => {
          if (child instanceof THREE.Mesh) {
            child.userData.projectId = handle.project.id
            handle.picks.push(child)
          }
        })
      }
    }

    return slot.file
  } catch {
    // Missing or corrupt file — keep the procedural fallback.
    return null
  }
}

/**
 * Loads every drop-in GLB in parallel. Missing files are ignored.
 */
export async function loadOptionalModels(
  roomRoot: THREE.Object3D,
  handles: PropHandle[],
  onProgress?: (label: string) => void,
): Promise<string[]> {
  const loader = new GLTFLoader()
  loader.setMeshoptDecoder(MeshoptDecoder)
  const byId = new Map(handles.map((handle) => [handle.project.id, handle]))

  onProgress?.('Dressing the room…')
  const results = await Promise.all(
    MODEL_SLOTS.map((slot) => loadOne(loader, slot, roomRoot, byId)),
  )
  return results.filter((name): name is string => Boolean(name))
}

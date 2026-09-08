import * as THREE from 'three'
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js'
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
      // Keep glTF materials, but make sure they play with our ACES pipeline.
      const materials = Array.isArray(child.material) ? child.material : [child.material]
      materials.forEach((material) => {
        if (material && 'envMapIntensity' in material) {
          ;(material as THREE.MeshStandardMaterial).envMapIntensity = 1
        }
      })
    }
  })
}

async function fileExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: 'HEAD' })
    if (response.ok) return true
    // Some hosts reject HEAD — fall through to a tiny range GET.
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

  // After scaling, sit floor props on y = 0. Wall props keep their Y.
  if (slot.ground !== false) {
    const box = new THREE.Box3().setFromObject(model)
    if (Number.isFinite(box.min.y)) {
      model.position.y -= box.min.y
    }
  }

  host.add(model)
}

/**
 * Tries each drop-in GLB. Missing files are ignored so the procedural room
 * always works out of the box.
 */
export async function loadOptionalModels(
  roomRoot: THREE.Object3D,
  handles: PropHandle[],
  onProgress?: (label: string) => void,
): Promise<string[]> {
  const loader = new GLTFLoader()
  const loaded: string[] = []
  const byId = new Map(handles.map((handle) => [handle.project.id, handle]))

  for (const slot of MODEL_SLOTS) {
    const url = assetUrl(`models/${slot.file}`)
    onProgress?.(`Checking ${slot.file}…`)

    if (!(await fileExists(url))) continue

    try {
      onProgress?.(`Loading ${slot.file}…`)
      const gltf = await loader.loadAsync(url)
      const model = gltf.scene
      model.name = `gltf-${slot.file.replace(/\.glb$/i, '')}`
      prepareModel(model, slot.castShadow !== false)

      const host =
        slot.attachTo === 'room'
          ? roomRoot
          : byId.get(slot.attachTo)?.group ?? roomRoot

      placeSlot(host, model, slot)

      // Make the new meshes clickable when attached to a project prop.
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

      loaded.push(slot.file)
    } catch (error) {
      console.warn(`[The Setup] Could not load ${slot.file}`, error)
    }
  }

  return loaded
}

import type { Vec3 } from '../data/projects'

/**
 * Drop a `.glb` into `public/models/` matching `file` and it will appear at boot.
 * Missing files are skipped — procedural geometry stays as the fallback.
 *
 * Free sources: Poly Haven, Kenney, Quaternius, Sketchfab (CC0 / CC-BY).
 */
export type ModelSlot = {
  /** Filename under /models/ */
  file: string
  /** Prop project id, or "room" for a free-standing decor piece. */
  attachTo: string | 'room'
  /** Remove a named child from the host before adding the GLB. */
  replaces?: string
  position?: Vec3
  rotationY?: number
  /** Uniform scale. Prefer targetHeight when you don't know the asset size. */
  scale?: number
  /** Auto-scale so the model is roughly this tall in metres. */
  targetHeight?: number
  castShadow?: boolean
}

export const HDRI_URL = '/hdri/studio_small_09_1k.hdr'

export const MODEL_SLOTS: ModelSlot[] = [
  {
    file: 'chair.glb',
    attachTo: 'helpdesk',
    replaces: 'slot-chair',
    position: [-0.15, 0, 1.2],
    rotationY: 0.12,
    targetHeight: 1.15,
  },
  {
    file: 'plant.glb',
    attachTo: 'room',
    replaces: 'slot-plant',
    position: [-6.2, 0, -1.4],
    rotationY: 0.4,
    targetHeight: 1.4,
  },
  {
    file: 'bookshelf.glb',
    attachTo: 'twiceasbooks',
    replaces: 'slot-bookshelf',
    position: [0, 0, 0],
    rotationY: 0,
    targetHeight: 2.9,
  },
  {
    file: 'bed.glb',
    attachTo: 'room',
    position: [5.2, 0, 3.1],
    rotationY: -Math.PI / 2,
    targetHeight: 1.1,
  },
  {
    file: 'desk.glb',
    attachTo: 'helpdesk',
    replaces: 'slot-desk-surface',
    position: [0, 0, 0],
    rotationY: 0,
    targetHeight: 1.2,
  },
  {
    file: 'nightstand.glb',
    attachTo: 'medibook',
    replaces: 'slot-nightstand',
    position: [0, 0, 0],
    rotationY: 0,
    targetHeight: 0.9,
  },
]

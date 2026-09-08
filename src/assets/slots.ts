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
  /**
   * When true (default), drop the model onto y = 0 after scaling.
   * Set false for wall-mounted pieces so `position.y` is kept.
   */
  ground?: boolean
}

export const HDRI_URL = '/hdri/studio_small_09_1k.hdr'

/** PBR maps under /textures/ — applied when present. */
export const SURFACE_MAPS = {
  floor: {
    diff: 'textures/floor_diff.jpg',
    nor: 'textures/floor_nor.jpg',
    rough: 'textures/floor_rough.jpg',
  },
  carpet: {
    diff: 'textures/carpet_diff.jpg',
    nor: 'textures/carpet_nor.jpg',
    rough: 'textures/carpet_rough.jpg',
  },
} as const

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
    targetHeight: 1.45,
  },
  {
    file: 'bookshelf.glb',
    attachTo: 'twiceasbooks',
    replaces: 'slot-bookshelf',
    position: [0, 0, 0],
    rotationY: 0,
    targetHeight: 2.85,
  },
  {
    file: 'books.glb',
    attachTo: 'twiceasbooks',
    replaces: 'slot-shelf-books',
    position: [-0.15, 0.85, 0.02],
    rotationY: 0.08,
    targetHeight: 0.55,
    ground: false,
  },
  {
    file: 'bed.glb',
    attachTo: 'room',
    replaces: 'slot-bed',
    position: [5.2, 0, 3.1],
    rotationY: -Math.PI / 2,
    targetHeight: 1.05,
  },
  {
    file: 'desk.glb',
    attachTo: 'helpdesk',
    replaces: 'slot-desk',
    position: [0, 0, 0],
    rotationY: 0,
    targetHeight: 0.82,
  },
  {
    file: 'monitor.glb',
    attachTo: 'helpdesk',
    replaces: 'slot-monitor-main',
    position: [-0.25, 0.79, -0.22],
    rotationY: 0.05,
    targetHeight: 0.56,
    ground: false,
  },
  {
    file: 'monitor-side.glb',
    attachTo: 'helpdesk',
    replaces: 'slot-monitor-side',
    position: [0.78, 0.79, -0.18],
    rotationY: -0.42,
    targetHeight: 0.5,
    ground: false,
  },
  {
    file: 'desk-lamp.glb',
    attachTo: 'helpdesk',
    position: [-1.15, 0.78, -0.35],
    rotationY: 0.6,
    targetHeight: 0.72,
    ground: false,
  },
  {
    file: 'nightstand.glb',
    attachTo: 'medibook',
    replaces: 'slot-nightstand',
    position: [0, 0, 0],
    rotationY: 0,
    targetHeight: 0.9,
  },
  {
    file: 'frame-a.glb',
    attachTo: 'room',
    replaces: 'slot-posters',
    position: [-1.95, 3.15, -4.38],
    rotationY: 0,
    targetHeight: 0.9,
    ground: false,
    castShadow: false,
  },
  {
    file: 'frame-b.glb',
    attachTo: 'room',
    position: [-0.85, 3.35, -4.38],
    rotationY: 0,
    targetHeight: 0.62,
    ground: false,
    castShadow: false,
  },
  {
    // Open shuttered window (GetGLB / CC Attribution) — not Poly Haven rollershutter.
    file: 'window.glb',
    attachTo: 'birdtrail',
    replaces: 'slot-window',
    position: [-0.98, 1.48, -0.06],
    rotationY: Math.PI / 2,
    targetHeight: 1.9,
    ground: false,
  },
  {
    file: 'window.glb',
    attachTo: 'birdtrail',
    replaces: 'slot-window-b',
    position: [0.98, 1.48, -0.06],
    rotationY: Math.PI / 2,
    targetHeight: 1.9,
    ground: false,
  },
  {
    file: 'kitchen.glb',
    attachTo: 'gas',
    replaces: 'slot-kitchen',
    position: [0.55, 0, -0.05],
    rotationY: 0,
    targetHeight: 1.05,
  },
  {
    file: 'stove.glb',
    attachTo: 'gas',
    replaces: 'slot-stove',
    position: [-0.55, 0, 0.05],
    rotationY: Math.PI,
    targetHeight: 0.95,
  },
  {
    file: 'cylinder.glb',
    attachTo: 'gas',
    replaces: 'slot-cylinders',
    position: [1.05, 0, 0.55],
    rotationY: -0.4,
    targetHeight: 0.85,
  },
]

import * as THREE from 'three'

type RgbEntry = {
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial
  /** Hue offset in turns, so strips and panels never land on the same colour. */
  offset: number
  saturation: number
  lightness: number
  speed: number
}

const entries: RgbEntry[] = []

/** Registers a material to ride the shared RGB cycle used across the room. */
export function registerRgb(
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial,
  offset = 0,
  options: { saturation?: number; lightness?: number; speed?: number } = {},
): void {
  entries.push({
    material,
    offset,
    saturation: options.saturation ?? 0.52,
    lightness: options.lightness ?? 0.55,
    speed: options.speed ?? 0.055,
  })
}

export function updateRgb(time: number): void {
  for (const entry of entries) {
    const hue = (time * entry.speed + entry.offset) % 1
    entry.material.color.setHSL(hue, entry.saturation, entry.lightness)
    const standard = entry.material as THREE.MeshStandardMaterial
    if (standard.emissive) {
      standard.emissive.setHSL(hue, entry.saturation, entry.lightness)
    }
  }
}

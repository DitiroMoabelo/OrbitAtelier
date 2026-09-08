import * as THREE from 'three'

type RgbEntry = {
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial
  /** Fixed hue in turns (0–1). */
  hue: number
  saturation: number
  lightness: number
  /** Soft brightness pulse speed. */
  speed: number
  phase: number
}

const entries: RgbEntry[] = []

/** Palette accents — locked hues, subtle pulse only (no rainbow cycle). */
const HUES = {
  pink: 0.92,
  lilac: 0.78,
  mint: 0.48,
  warm: 0.08,
} as const

/** Registers a material for a restrained accent pulse. */
export function registerRgb(
  material: THREE.MeshStandardMaterial | THREE.MeshBasicMaterial,
  offset = 0,
  options: {
    saturation?: number
    lightness?: number
    speed?: number
    /** 'pink' | 'lilac' | 'mint' | 'warm' — defaults by offset band. */
    tone?: keyof typeof HUES
  } = {},
): void {
  const tone =
    options.tone ??
    (offset < 0.33 ? 'pink' : offset < 0.66 ? 'lilac' : 'mint')

  entries.push({
    material,
    hue: HUES[tone],
    saturation: options.saturation ?? 0.42,
    lightness: options.lightness ?? 0.58,
    speed: options.speed ?? 0.35,
    phase: offset * Math.PI * 2,
  })

  // Set the locked color immediately so first frame isn't wrong.
  material.color.setHSL(HUES[tone], options.saturation ?? 0.42, options.lightness ?? 0.58)
  const standard = material as THREE.MeshStandardMaterial
  if (standard.emissive) {
    standard.emissive.setHSL(HUES[tone], options.saturation ?? 0.42, options.lightness ?? 0.58)
  }
}

export function updateRgb(time: number): void {
  for (const entry of entries) {
    const pulse = 0.5 + 0.5 * Math.sin(time * entry.speed + entry.phase)
    const lightness = entry.lightness + (pulse - 0.5) * 0.06
    entry.material.color.setHSL(entry.hue, entry.saturation, lightness)
    const standard = entry.material as THREE.MeshStandardMaterial
    if (standard.emissive) {
      standard.emissive.setHSL(entry.hue, entry.saturation, lightness)
      if ('emissiveIntensity' in standard) {
        standard.emissiveIntensity = 0.55 + pulse * 0.35
      }
    }
  }
}

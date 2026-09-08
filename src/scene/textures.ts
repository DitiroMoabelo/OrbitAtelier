import * as THREE from 'three'

function canvas(size: number): CanvasRenderingContext2D {
  const el = document.createElement('canvas')
  el.width = size
  el.height = size
  const ctx = el.getContext('2d')
  if (!ctx) throw new Error('2D canvas unavailable')
  return ctx
}

function toMap(ctx: CanvasRenderingContext2D, srgb: boolean): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(ctx.canvas)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.anisotropy = 8
  tex.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace
  tex.needsUpdate = true
  return tex
}

function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453
  return n - Math.floor(n)
}

/** Oak floorboards with grain, knots, and plank seams. */
export function makeWoodMap(): THREE.CanvasTexture {
  const size = 512
  const ctx = canvas(size)
  const data = ctx.createImageData(size, size)
  const planks = 8
  const plankH = size / planks

  for (let p = 0; p < planks; p += 1) {
    const base = 118 + (p % 3) * 10
    for (let y = 0; y < plankH; y += 1) {
      for (let x = 0; x < size; x += 1) {
        const gy = (p * plankH + y) | 0
        const grain = Math.sin(x * 0.045 + noise(x * 0.02, p) * 14 + y * 0.02)
        const pore = noise(x * 0.35, gy * 0.08) * 18
        const v = base + grain * 28 + pore - (y < 2 || y > plankH - 3 ? 42 : 0)
        const i = (gy * size + x) * 4
        data.data[i] = Math.min(255, v + 36)
        data.data[i + 1] = v + 2
        data.data[i + 2] = Math.max(0, v - 38)
        data.data[i + 3] = 255
      }
    }
  }
  ctx.putImageData(data, 0, 0)
  const tex = toMap(ctx, true)
  tex.repeat.set(6, 8)
  return tex
}

/** Closer-grain walnut for furniture. */
export function makeWalnutMap(): THREE.CanvasTexture {
  const size = 256
  const ctx = canvas(size)
  const data = ctx.createImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const grain = Math.sin(x * 0.09 + noise(y * 0.04, 2) * 9) * 32
      const v = 88 + grain + noise(x, y) * 14
      const i = (y * size + x) * 4
      data.data[i] = v + 18
      data.data[i + 1] = v - 8
      data.data[i + 2] = v - 28
      data.data[i + 3] = 255
    }
  }
  ctx.putImageData(data, 0, 0)
  const tex = toMap(ctx, true)
  tex.repeat.set(2, 2)
  return tex
}

/** Painted plaster: fine noise so walls catch the light. */
export function makePlasterMap(): THREE.CanvasTexture {
  const size = 256
  const ctx = canvas(size)
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 210 + Math.random() * 28
    img.data[i] = n
    img.data[i + 1] = n
    img.data[i + 2] = n
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = toMap(ctx, true)
  tex.repeat.set(4, 3)
  return tex
}

/** Soft pile for the rug and bedding. */
export function makeFabricMap(tint: [number, number, number]): THREE.CanvasTexture {
  const size = 256
  const ctx = canvas(size)
  const [tr, tg, tb] = tint
  const data = ctx.createImageData(size, size)
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const weave = ((x + y) % 3 === 0 ? 10 : 0) + noise(x * 0.2, y * 0.2) * 16
      const i = (y * size + x) * 4
      data.data[i] = tr + weave
      data.data[i + 1] = tg + weave * 0.6
      data.data[i + 2] = tb + weave * 0.5
      data.data[i + 3] = 255
    }
  }
  ctx.putImageData(data, 0, 0)
  const tex = toMap(ctx, true)
  tex.repeat.set(3, 3)
  return tex
}

/** Bump for plaster and fabric. */
export function makeNoiseBump(): THREE.CanvasTexture {
  const size = 256
  const ctx = canvas(size)
  const img = ctx.createImageData(size, size)
  for (let i = 0; i < img.data.length; i += 4) {
    const n = Math.random() * 255
    img.data[i] = n
    img.data[i + 1] = n
    img.data[i + 2] = n
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  const tex = toMap(ctx, false)
  tex.repeat.set(4, 4)
  return tex
}

let cache: {
  wood: THREE.CanvasTexture
  walnut: THREE.CanvasTexture
  plaster: THREE.CanvasTexture
  fabricPink: THREE.CanvasTexture
  fabricCream: THREE.CanvasTexture
  bump: THREE.CanvasTexture
} | null = null

export function maps() {
  if (!cache) {
    cache = {
      wood: makeWoodMap(),
      walnut: makeWalnutMap(),
      plaster: makePlasterMap(),
      fabricPink: makeFabricMap([210, 140, 168]),
      fabricCream: makeFabricMap([232, 214, 200]),
      bump: makeNoiseBump(),
    }
  }
  return cache
}

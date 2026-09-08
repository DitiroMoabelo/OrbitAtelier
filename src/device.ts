/** Shared device flags — used for camera, quality, and touch UX. */
export const isTouch =
  typeof window !== 'undefined' &&
  (window.matchMedia('(pointer: coarse)').matches || 'ontouchstart' in window)

export const isPhoneUA = /iPhone|iPod|Android.+Mobile/i.test(navigator.userAgent)
export const isTabletUA = /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent)

export function isCompact(): boolean {
  return Math.min(window.innerWidth, window.innerHeight) < 820
}

export function isPortrait(): boolean {
  return window.innerHeight > window.innerWidth * 1.05
}

export function viewSize(): { width: number; height: number } {
  const vv = window.visualViewport
  return {
    width: Math.round(vv?.width ?? window.innerWidth),
    height: Math.round(vv?.height ?? window.innerHeight),
  }
}

export function pixelCap(): number {
  if (isPhoneUA) return 1.25
  if (isTouch || isCompact()) return 1.5
  return 2
}

export function shadowMapSize(): number {
  if (isPhoneUA) return 512
  if (isTouch) return 1024
  return 2048
}

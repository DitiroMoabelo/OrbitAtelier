import * as THREE from 'three'
import { RGBELoader } from 'three/addons/loaders/RGBELoader.js'
import { HDRI_URL } from '../assets/slots'
import { isPhoneUA } from '../device'

function resolveUrl(path: string): string {
  const base = import.meta.env.BASE_URL || '/'
  return `${base}${path.replace(/^\//, '')}`
}

/** Loads a Poly Haven HDRI as the scene environment (real sky / studio light). */
export async function loadHdriEnvironment(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  onProgress?: (ratio: number) => void,
): Promise<boolean> {
  const pmrem = new THREE.PMREMGenerator(renderer)
  pmrem.compileEquirectangularShader()

  try {
    const texture = await new RGBELoader().loadAsync(resolveUrl(HDRI_URL))
    if (onProgress) onProgress(1)
    texture.mapping = THREE.EquirectangularReflectionMapping

    const previous = scene.environment
    const env = pmrem.fromEquirectangular(texture).texture
    scene.environment = env
    scene.environmentIntensity = isPhoneUA ? 0.55 : 0.72
    scene.background = null

    texture.dispose()
    pmrem.dispose()
    if (previous && previous !== env) previous.dispose()
    return true
  } catch (error) {
    console.warn('[The Setup] HDRI failed to load, keeping RoomEnvironment fallback.', error)
    pmrem.dispose()
    return false
  }
}

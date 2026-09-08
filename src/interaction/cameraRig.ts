import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { isPortrait, isTouch } from '../device'

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera
  readonly controls: OrbitControls
  private readonly homePos = new THREE.Vector3(0.5, 2.8, 9.3)
  private readonly homeTarget = new THREE.Vector3(0.35, 1.55, -1.8)
  private blending = false
  private blend = 0
  private readonly fromPos = new THREE.Vector3()
  private readonly fromTarget = new THREE.Vector3()
  private readonly toPos = new THREE.Vector3()
  private readonly toTarget = new THREE.Vector3()

  constructor(canvas: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(46, 1, 0.1, 90)
    this.camera.position.copy(this.homePos)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.enablePan = !isTouch
    this.controls.touches.ONE = THREE.TOUCH.ROTATE
    this.controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE
    this.controls.minDistance = 1.6
    this.controls.maxDistance = 18
    this.controls.minPolarAngle = Math.PI * 0.12
    this.controls.maxPolarAngle = Math.PI * 0.5
    this.controls.target.copy(this.homeTarget)
    this.controls.update()
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(height, 1)
    this.applyHomeLayout(width, height)
    this.camera.updateProjectionMatrix()
  }

  /** Pulls the doorway view back on portrait so the whole room still fits. */
  private applyHomeLayout(width: number, height: number) {
    const portrait = height > width * 1.05
    const narrow = width < 900

    if (portrait) {
      this.homePos.set(0.15, 2.45, 8.15)
      this.homeTarget.set(0.1, 1.35, -1.6)
      this.camera.fov = 52
      this.controls.minDistance = 2.2
      this.controls.maxDistance = 16
    } else if (narrow) {
      this.homePos.set(0.45, 2.85, 10.2)
      this.homeTarget.set(0.25, 1.5, -1.5)
      this.camera.fov = 48
      this.controls.minDistance = 2.0
      this.controls.maxDistance = 16
    } else {
      this.homePos.set(0.5, 2.8, 9.3)
      this.homeTarget.set(0.35, 1.55, -1.8)
      this.camera.fov = 42
      this.controls.minDistance = 1.6
      this.controls.maxDistance = 15
    }
  }

  private framedOffset(offset: THREE.Vector3): THREE.Vector3 {
    const scaled = offset.clone()
    if (isPortrait()) {
      scaled.multiplyScalar(1.12)
      scaled.y += 0.15
      scaled.z += 0.35
    } else if (this.camera.aspect < 1.2) {
      scaled.multiplyScalar(1.15)
      scaled.z += 0.45
    }
    return scaled
  }

  focusOn(target: THREE.Vector3, offset: THREE.Vector3) {
    this.toTarget.copy(target)
    this.toPos.copy(target).add(this.framedOffset(offset))
    this.beginBlend()
  }

  /** Deep links should arrive already framed, with no dolly from the doorway. */
  snapTo(target: THREE.Vector3, offset: THREE.Vector3) {
    this.blending = false
    this.controls.enabled = true
    this.camera.position.copy(target).add(this.framedOffset(offset))
    this.controls.target.copy(target)
    this.controls.update()
  }

  resetHome() {
    this.toPos.copy(this.homePos)
    this.toTarget.copy(this.homeTarget)
    this.beginBlend()
  }

  /** After rotate/resize, snap to the current doorway if we have not focused a prop. */
  snapHome() {
    this.blending = false
    this.camera.position.copy(this.homePos)
    this.controls.target.copy(this.homeTarget)
    this.controls.update()
  }

  private beginBlend() {
    this.fromPos.copy(this.camera.position)
    this.fromTarget.copy(this.controls.target)
    this.blend = 0
    this.blending = true
    this.controls.enabled = false
  }

  update(dt: number) {
    if (this.blending) {
      this.blend = Math.min(1, this.blend + dt * 1.35)
      const t = easeInOutCubic(this.blend)
      this.camera.position.lerpVectors(this.fromPos, this.toPos, t)
      this.controls.target.lerpVectors(this.fromTarget, this.toTarget, t)
      this.controls.update()
      if (this.blend >= 1) {
        this.blending = false
        this.controls.enabled = true
      }
      return
    }
    this.controls.update()
  }
}

function easeInOutCubic(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

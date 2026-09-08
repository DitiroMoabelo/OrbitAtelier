import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'

export class CameraRig {
  readonly camera: THREE.PerspectiveCamera
  readonly controls: OrbitControls
  private readonly homePos = new THREE.Vector3(0, 7.5, 18)
  private readonly homeTarget = new THREE.Vector3(0, 0, 0)
  private blending = false
  private blend = 0
  private readonly fromPos = new THREE.Vector3()
  private readonly fromTarget = new THREE.Vector3()
  private readonly toPos = new THREE.Vector3()
  private readonly toTarget = new THREE.Vector3()

  constructor(canvas: HTMLCanvasElement) {
    this.camera = new THREE.PerspectiveCamera(45, 1, 0.1, 200)
    this.camera.position.copy(this.homePos)

    this.controls = new OrbitControls(this.camera, canvas)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.06
    this.controls.minDistance = 3.5
    this.controls.maxDistance = 36
    this.controls.maxPolarAngle = Math.PI * 0.49
    this.controls.target.copy(this.homeTarget)
    this.controls.update()
  }

  resize(width: number, height: number) {
    this.camera.aspect = width / Math.max(height, 1)
    this.camera.updateProjectionMatrix()
  }

  /** Ease the camera toward a planet inspection angle. */
  focusOn(worldPos: THREE.Vector3) {
    const offset = new THREE.Vector3(2.4, 1.2, 3.2).normalize().multiplyScalar(4.2)
    this.toPos.copy(worldPos).add(offset)
    this.toTarget.copy(worldPos)
    this.beginBlend()
  }

  resetHome() {
    this.toPos.copy(this.homePos)
    this.toTarget.copy(this.homeTarget)
    this.beginBlend()
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

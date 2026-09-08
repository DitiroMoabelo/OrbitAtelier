import * as THREE from 'three'
import type { PlanetHandle } from '../scene/planets'

export class PlanetPicker {
  private readonly raycaster = new THREE.Raycaster()
  private readonly pointer = new THREE.Vector2()
  private readonly bodies: THREE.Object3D[]
  private readonly byId: Map<string, PlanetHandle>
  private downX = 0
  private downY = 0

  constructor(handles: PlanetHandle[]) {
    this.bodies = handles.map((h) => h.body)
    this.byId = new Map(handles.map((h) => [h.id, h]))
  }

  /** Track pointer for hover without treating a drag as a click. */
  onPointerDown(clientX: number, clientY: number) {
    this.downX = clientX
    this.downY = clientY
  }

  wasClick(clientX: number, clientY: number) {
    const dx = clientX - this.downX
    const dy = clientY - this.downY
    return dx * dx + dy * dy < 36
  }

  setPointerFromEvent(event: PointerEvent, rect: DOMRect) {
    this.pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
    this.pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  }

  pick(camera: THREE.Camera): PlanetHandle | null {
    this.raycaster.setFromCamera(this.pointer, camera)
    const hits = this.raycaster.intersectObjects(this.bodies, false)
    if (!hits.length) return null
    const id = hits[0].object.userData.projectId as string | undefined
    return id ? this.byId.get(id) ?? null : null
  }
}

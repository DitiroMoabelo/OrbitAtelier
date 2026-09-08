import * as THREE from 'three'
import type { PropHandle } from '../scene/props'

export class PropPicker {
  private readonly raycaster = new THREE.Raycaster()
  private readonly pointer = new THREE.Vector2()
  private readonly targets: THREE.Object3D[] = []
  private readonly byId = new Map<string, PropHandle>()
  private downX = 0
  private downY = 0

  constructor(handles: PropHandle[]) {
    for (const handle of handles) {
      this.byId.set(handle.project.id, handle)
      this.targets.push(...handle.picks)
    }
  }

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

  pick(camera: THREE.Camera): PropHandle | null {
    this.raycaster.setFromCamera(this.pointer, camera)
    const hits = this.raycaster.intersectObjects(this.targets, false)
    if (!hits.length) return null
    const id = hits[0].object.userData.projectId as string | undefined
    return id ? this.byId.get(id) ?? null : null
  }
}

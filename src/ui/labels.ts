import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import type { PropHandle } from '../scene/props'

export class PropLabels {
  private readonly elements = new Map<string, HTMLElement>()

  constructor(handles: PropHandle[]) {
    handles.forEach((handle) => {
      const el = document.createElement('div')
      el.className = 'prop-label'
      el.textContent = handle.project.short
      const label = new CSS2DObject(el)
      label.position.set(0, handle.project.labelHeight, 0)
      handle.group.add(label)
      this.elements.set(handle.project.id, el)
    })
  }

  /** Only the selected prop keeps a label once the camera has moved in. */
  setSelected(id: string | null) {
    this.elements.forEach((el, key) => {
      el.classList.toggle('is-dim', id !== null && key !== id)
    })
  }
}

export function createLabelRenderer(container: HTMLElement): CSS2DRenderer {
  const labelRenderer = new CSS2DRenderer()
  labelRenderer.setSize(window.innerWidth, window.innerHeight)
  labelRenderer.domElement.style.position = 'absolute'
  labelRenderer.domElement.style.inset = '0'
  labelRenderer.domElement.style.pointerEvents = 'none'
  labelRenderer.domElement.style.zIndex = '1'
  container.appendChild(labelRenderer.domElement)
  return labelRenderer
}

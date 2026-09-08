import {
  CSS2DObject,
  CSS2DRenderer,
} from 'three/addons/renderers/CSS2DRenderer.js'
import type { PlanetHandle } from '../scene/planets'

export function attachPlanetLabels(handles: PlanetHandle[]): CSS2DObject[] {
  return handles.map((handle) => {
    const el = document.createElement('div')
    el.className = 'planet-label'
    el.textContent = handle.project.name.split('—')[0]?.trim() || handle.project.name
    const label = new CSS2DObject(el)
    label.position.set(0, handle.project.size + 0.55, 0)
    handle.group.add(label)
    return label
  })
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

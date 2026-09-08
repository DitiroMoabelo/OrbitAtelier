import type { CharmProject } from '../data/projects'

export class ProjectPanel {
  private readonly panel: HTMLElement
  private readonly tech: HTMLElement
  private readonly title: HTMLElement
  private readonly body: HTMLElement
  private readonly proof: HTMLElement
  private readonly actions: HTMLElement
  private readonly hint: HTMLElement
  private readonly onClose: () => void

  constructor(onClose: () => void) {
    this.onClose = onClose
    this.panel = el('panel')
    this.tech = el('panel-tech')
    this.title = el('panel-title')
    this.body = el('panel-body')
    this.proof = el('panel-proof')
    this.actions = el('panel-actions')
    this.hint = el('hint')

    el('panel-close').addEventListener('click', () => {
      this.hide()
      this.onClose()
    })

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && !this.panel.hasAttribute('hidden')) {
        this.hide()
        this.onClose()
      }
    })
  }

  show(project: CharmProject) {
    this.tech.textContent = project.tech
    this.title.textContent = project.name
    this.body.textContent = project.blurb
    this.proof.textContent = project.proof
    this.actions.replaceChildren()

    for (const link of project.links) {
      const a = document.createElement('a')
      a.href = link.href
      a.target = '_blank'
      a.rel = 'noopener noreferrer'
      a.className = 'panel__btn'
      a.textContent = link.label
      this.actions.appendChild(a)
    }

    this.panel.hidden = false
    requestAnimationFrame(() => this.panel.classList.add('is-open'))
    this.hint.textContent = 'Press Esc or release the charm to return'
  }

  hide() {
    this.panel.classList.remove('is-open')
    window.setTimeout(() => {
      this.panel.hidden = true
    }, 280)
    this.hint.textContent = 'Drag to look · Scroll to zoom · Pull a charm'
  }

  get open() {
    return !this.panel.hasAttribute('hidden')
  }
}

function el<T extends HTMLElement = HTMLElement>(id: string): T {
  const node = document.getElementById(id)
  if (!node) throw new Error(`Missing #${id}`)
  return node as T
}

export class BootScreen {
  private readonly root = el('boot')
  private readonly fill = el('boot-fill')
  private readonly hint = el('boot-hint')

  setProgress(value: number, label?: string) {
    const pct = Math.max(0, Math.min(100, value))
    this.fill.style.width = `${pct}%`
    if (label) this.hint.textContent = label
  }

  async finish() {
    this.setProgress(100, 'Ready')
    this.root.classList.add('is-done')
    await wait(420)
    this.root.remove()
  }
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

import * as THREE from 'three'
import { ROOM } from './room'
import { isPhoneUA } from '../device'

/** Afternoon sun through the window — the hero light of the room. */
export function createSunRig(): {
  group: THREE.Group
  sun: THREE.DirectionalLight
  update: (time: number) => void
} {
  const group = new THREE.Group()
  group.name = 'sun-rig'

  // Golden-hour direction: enters through the BirdTrail window and pools on the floor.
  const sun = new THREE.DirectionalLight('#FFE2B8', isPhoneUA ? 2.4 : 3.1)
  sun.position.set(3.8, 7.2, 2.2)
  sun.target.position.set(0.4, 0.2, -1.2)
  sun.castShadow = true
  const mapSize = isPhoneUA ? 1024 : 4096
  sun.shadow.mapSize.set(mapSize, mapSize)
  sun.shadow.camera.near = 0.5
  sun.shadow.camera.far = 40
  sun.shadow.camera.left = -10
  sun.shadow.camera.right = 10
  sun.shadow.camera.top = 10
  sun.shadow.camera.bottom = -8
  sun.shadow.bias = -0.00015
  sun.shadow.normalBias = 0.02
  sun.shadow.radius = isPhoneUA ? 2 : 4
  group.add(sun)
  group.add(sun.target)

  // Soft sky bounce — cool, so warm sun reads as sunlight.
  group.add(new THREE.HemisphereLight('#C9D6F0', '#3A2E2A', 0.55))
  group.add(new THREE.AmbientLight('#B8A898', 0.12))

  // Window as a soft area source (the glass itself).
  const windowGlow = new THREE.RectAreaLight('#FFF0D2', 8, 2.15, 1.95)
  windowGlow.position.set(1.35, 2.55, ROOM.backZ + 0.22)
  windowGlow.lookAt(1.35, 1.4, 1.5)
  group.add(windowGlow)

  // Fill from the open side of the room so shadows aren't crushed.
  const fill = new THREE.DirectionalLight('#D8E0F0', 0.55)
  fill.position.set(-6, 5, 8)
  group.add(fill)

  // Warm bounce off the floor near the sun pool.
  const bounce = new THREE.PointLight('#FFD9A8', 5, 7, 2)
  bounce.position.set(1.2, 0.35, -1.4)
  group.add(bounce)

  // Soft pendant — practical lamp, not the hero light.
  const pendant = new THREE.PointLight('#FFE8C8', 4.5, 6, 2)
  pendant.position.set(0.3, 3.15, -0.4)
  group.add(pendant)

  group.add(createGodRays())
  group.add(createSunPool())
  group.add(createSkyBeyondWindow())

  const update = (time: number) => {
    // Very slow sun drift so the pool of light feels alive.
    const wobble = Math.sin(time * 0.07) * 0.08
    sun.intensity = (isPhoneUA ? 2.4 : 3.1) + Math.sin(time * 0.2) * 0.08
    bounce.intensity = 4.5 + Math.sin(time * 0.35 + 1) * 0.4
    sun.position.x = 3.8 + wobble
  }

  return { group, sun, update }
}

/** Soft volumetric shafts pouring through the window glass. */
function createGodRays(): THREE.Group {
  const g = new THREE.Group()
  g.position.set(1.35, 2.55, ROOM.backZ + 0.35)

  const shaftMat = new THREE.MeshBasicMaterial({
    color: '#FFE6C0',
    transparent: true,
    opacity: 0.07,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  })

  // Several overlapping cones / planes so the beam feels volumetric.
  for (let i = 0; i < (isPhoneUA ? 3 : 5); i += 1) {
    const cone = new THREE.Mesh(
      new THREE.ConeGeometry(0.55 + i * 0.22, 5.2, 24, 1, true),
      shaftMat.clone(),
    )
    ;(cone.material as THREE.MeshBasicMaterial).opacity = 0.028 - i * 0.004
    cone.rotation.x = Math.PI
    cone.position.set((i - 2) * 0.18, -1.9, 2.1 + i * 0.15)
    cone.rotation.z = (i - 2) * 0.04
    cone.rotation.x = Math.PI + 0.55
    g.add(cone)
  }

  // Flat sheet of light for a denser core.
  const sheet = new THREE.Mesh(
    new THREE.PlaneGeometry(1.8, 4.8),
    new THREE.MeshBasicMaterial({
      color: '#FFF2D4',
      transparent: true,
      opacity: 0.022,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide,
    }),
  )
  sheet.position.set(0, -1.5, 2.0)
  sheet.rotation.x = -0.85
  g.add(sheet)

  return g
}

/** Bright warm ellipse on the floor where the sun lands. */
function createSunPool(): THREE.Mesh {
  const pool = new THREE.Mesh(
    new THREE.CircleGeometry(1.65, 48),
    new THREE.MeshBasicMaterial({
      color: '#FFE2B0',
      transparent: true,
      opacity: 0.09,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  pool.rotation.x = -Math.PI / 2
  pool.position.set(1.15, 0.015, -1.55)
  pool.scale.set(1.35, 1, 0.85)
  return pool
}

/** Real sky + sun disc visible through the window glass. */
function createSkyBeyondWindow(): THREE.Group {
  const g = new THREE.Group()

  const sky = new THREE.Mesh(
    new THREE.PlaneGeometry(2.05, 1.95),
    new THREE.ShaderMaterial({
      uniforms: {
        uTop: { value: new THREE.Color('#6BA3E0') },
        uHorizon: { value: new THREE.Color('#F2C9A0') },
        uBot: { value: new THREE.Color('#E8A878') },
      },
      vertexShader: /* glsl */ `
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying vec2 vUv;
        uniform vec3 uTop;
        uniform vec3 uHorizon;
        uniform vec3 uBot;
        void main() {
          float t = vUv.y;
          vec3 col = mix(uBot, uHorizon, smoothstep(0.0, 0.45, t));
          col = mix(col, uTop, smoothstep(0.4, 1.0, t));
          float d = distance(vUv, vec2(0.72, 0.62));
          col += vec3(1.0, 0.85, 0.55) * exp(-d * 14.0) * 1.4;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  )
  // Sit just outside the wall opening so it reads through the glass.
  sky.position.set(1.35, 2.55, ROOM.backZ - 0.42)
  g.add(sky)

  const sunDisc = new THREE.Mesh(
    new THREE.CircleGeometry(0.14, 32),
    new THREE.MeshBasicMaterial({
      color: '#FFF6D8',
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  sunDisc.position.set(1.72, 2.95, ROOM.backZ - 0.41)
  g.add(sunDisc)

  const halo = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 32),
    new THREE.MeshBasicMaterial({
      color: '#FFD9A0',
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  halo.position.copy(sunDisc.position)
  halo.position.z -= 0.005
  g.add(halo)

  return g
}

/** Dust that lives mostly inside the sun beam. */
export function createSunDust(): { points: THREE.Points; update: (time: number) => void } {
  const count = isPhoneUA ? 90 : 220
  const positions = new Float32Array(count * 3)
  const seeds = new Float32Array(count)

  for (let i = 0; i < count; i += 1) {
    // Bias toward the window light cone.
    positions[i * 3] = 1.35 + (Math.random() - 0.5) * 3.2
    positions[i * 3 + 1] = Math.random() * 3.6 + 0.15
    positions[i * 3 + 2] = ROOM.backZ + 0.5 + Math.random() * 5.5
    seeds[i] = Math.random() * Math.PI * 2
  }

  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))

  const points = new THREE.Points(
    geometry,
    new THREE.PointsMaterial({
      color: '#FFEBD0',
      size: 0.028,
      transparent: true,
      opacity: 0.4,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    }),
  )
  points.frustumCulled = false

  const attr = geometry.getAttribute('position') as THREE.BufferAttribute
  const baseY = Float32Array.from(positions.filter((_, i) => i % 3 === 1))

  const update = (time: number) => {
    for (let i = 0; i < count; i += 1) {
      const drift = ((time * 0.045 + seeds[i] * 0.35) % 3.8)
      attr.setY(i, ((baseY[i] + drift) % 3.8) + 0.15)
      attr.setX(i, attr.getX(i) + Math.sin(time * 0.25 + seeds[i]) * 0.0007)
    }
    attr.needsUpdate = true
  }

  return { points, update }
}

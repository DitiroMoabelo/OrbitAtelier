import * as THREE from 'three'

/** Cream atelier shell — window light, not outer space. */
export function createAtelierRoom(): THREE.Group {
  const root = new THREE.Group()
  root.name = 'atelier'

  const sky = new THREE.Mesh(
    new THREE.SphereGeometry(40, 48, 32),
    new THREE.ShaderMaterial({
      side: THREE.BackSide,
      depthWrite: false,
      uniforms: {
        uTop: { value: new THREE.Color('#F7E7F0') },
        uMid: { value: new THREE.Color('#FFF4EA') },
        uBot: { value: new THREE.Color('#E8D5C4') },
      },
      vertexShader: /* glsl */ `
        varying vec3 vDir;
        void main() {
          vDir = normalize(position);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: /* glsl */ `
        precision mediump float;
        varying vec3 vDir;
        uniform vec3 uTop;
        uniform vec3 uMid;
        uniform vec3 uBot;
        void main() {
          float h = vDir.y * 0.5 + 0.5;
          vec3 col = mix(uBot, uMid, smoothstep(0.0, 0.45, h));
          col = mix(col, uTop, smoothstep(0.45, 1.0, h));
          // Soft window wash on one side.
          float window = pow(max(dot(normalize(vDir), normalize(vec3(-0.55, 0.2, 0.8))), 0.0), 6.0);
          col += vec3(1.0, 0.92, 0.88) * window * 0.18;
          gl_FragColor = vec4(col, 1.0);
        }
      `,
    }),
  )
  root.add(sky)

  const floor = new THREE.Mesh(
    new THREE.CircleGeometry(12, 64),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F3E2D4'),
      roughness: 0.85,
      metalness: 0.02,
    }),
  )
  floor.rotation.x = -Math.PI / 2
  floor.position.y = -3.2
  floor.receiveShadow = true
  root.add(floor)

  // Soft elliptical rug under the mobile.
  const rug = new THREE.Mesh(
    new THREE.CircleGeometry(4.2, 64),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#F7C7D3'),
      roughness: 1,
      metalness: 0,
      transparent: true,
      opacity: 0.35,
    }),
  )
  rug.rotation.x = -Math.PI / 2
  rug.position.y = -3.18
  rug.scale.set(1.4, 1, 1)
  root.add(rug)

  return root
}

export function createDust(count = 140): THREE.Points {
  const positions = new Float32Array(count * 3)
  const phases = new Float32Array(count)
  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10
    positions[i * 3 + 1] = Math.random() * 6 - 1.5
    positions[i * 3 + 2] = (Math.random() - 0.5) * 8
    phases[i] = Math.random() * Math.PI * 2
  }
  const geo = new THREE.BufferGeometry()
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geo.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1))

  const mat = new THREE.PointsMaterial({
    color: new THREE.Color('#FFFFFF'),
    size: 0.035,
    transparent: true,
    opacity: 0.45,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    sizeAttenuation: true,
  })
  const points = new THREE.Points(geo, mat)
  points.name = 'dust'
  points.userData.phases = phases
  return points
}

export function updateDust(points: THREE.Points, time: number) {
  const pos = points.geometry.getAttribute('position') as THREE.BufferAttribute
  const phases = points.userData.phases as Float32Array
  for (let i = 0; i < pos.count; i++) {
    const phase = phases[i]
    const y = pos.getY(i) + Math.sin(time * 0.35 + phase) * 0.002
    const wrap = ((y + 1.5) % 6) - 1.5
    pos.setY(i, wrap)
    pos.setX(i, pos.getX(i) + Math.sin(time * 0.2 + phase) * 0.0015)
  }
  pos.needsUpdate = true
}

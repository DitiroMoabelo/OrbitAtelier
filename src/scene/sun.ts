import * as THREE from 'three'

/** Soft glowing sun at the centre — brand-forward visual anchor. */
export function createSun(): THREE.Group {
  const group = new THREE.Group()
  group.name = 'sun'

  const core = new THREE.Mesh(
    new THREE.SphereGeometry(1.35, 48, 48),
    new THREE.MeshStandardMaterial({
      color: new THREE.Color('#FFE8C8'),
      emissive: new THREE.Color('#F7C7D3'),
      emissiveIntensity: 1.4,
      roughness: 0.45,
      metalness: 0.05,
    }),
  )
  group.add(core)

  const glow = new THREE.Mesh(
    new THREE.SphereGeometry(1.85, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#F7C7D3'),
      transparent: true,
      opacity: 0.28,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  group.add(glow)

  const halo = new THREE.Mesh(
    new THREE.SphereGeometry(2.45, 32, 32),
    new THREE.MeshBasicMaterial({
      color: new THREE.Color('#EFDDF4'),
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    }),
  )
  group.add(halo)

  const light = new THREE.PointLight(0xffe0d0, 48, 60, 1.6)
  light.position.set(0, 0, 0)
  group.add(light)

  return group
}

export function pulseSun(sun: THREE.Group, time: number) {
  const glow = sun.children[1] as THREE.Mesh
  const halo = sun.children[2] as THREE.Mesh
  const s = 1 + Math.sin(time * 1.4) * 0.03
  glow.scale.setScalar(s)
  halo.scale.setScalar(1 + Math.sin(time * 0.9 + 1.0) * 0.04)
  const glowMat = glow.material as THREE.MeshBasicMaterial
  glowMat.opacity = 0.24 + Math.sin(time * 1.6) * 0.05
}

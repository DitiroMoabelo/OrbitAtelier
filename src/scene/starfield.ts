import * as THREE from 'three'

const vertexShader = /* glsl */ `
  varying vec3 vDirection;
  void main() {
    vec4 world = modelMatrix * vec4(position, 1.0);
    vDirection = world.xyz - cameraPosition;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`

const fragmentShader = /* glsl */ `
  precision mediump float;
  varying vec3 vDirection;
  uniform float uTime;
  uniform vec2 uResolution;

  // Hash helpers for a procedural starfield — no texture downloads.
  float hash(vec3 p) {
    p = fract(p * 0.3183099 + vec3(0.1, 0.2, 0.3));
    p *= 17.0;
    return fract(p.x * p.y * p.z * (p.x + p.y + p.z));
  }

  void main() {
    vec3 dir = normalize(vDirection);
    // Soft cosmic cream-navy gradient instead of flat black.
    float elev = dir.y * 0.5 + 0.5;
    vec3 deep = vec3(0.06, 0.05, 0.10);
    vec3 haze = vec3(0.14, 0.10, 0.16);
    vec3 col = mix(deep, haze, elev);

    // Layered star cells.
    for (int layer = 0; layer < 3; layer++) {
      float scale = 80.0 + float(layer) * 55.0;
      vec3 p = dir * scale;
      vec3 cell = floor(p);
      vec3 f = fract(p) - 0.5;
      float n = hash(cell + float(layer) * 19.0);
      float twinkle = 0.65 + 0.35 * sin(uTime * (1.2 + n * 2.0) + n * 40.0);
      float d = length(f);
      float star = smoothstep(0.045 * (1.0 - n * 0.5), 0.0, d) * step(0.92 - float(layer) * 0.04, n);
      vec3 tint = mix(vec3(1.0, 0.92, 0.95), vec3(0.85, 0.9, 1.0), n);
      col += tint * star * twinkle * (0.55 - float(layer) * 0.12);
    }

    // Gentle nebula wash near the horizon.
    float neb = pow(1.0 - abs(dir.y), 3.0) * 0.18;
    col += vec3(0.55, 0.32, 0.42) * neb;

    gl_FragColor = vec4(col, 1.0);
  }
`

export function createStarfield(): THREE.Mesh {
  const geometry = new THREE.SphereGeometry(80, 64, 64)
  const material = new THREE.ShaderMaterial({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime: { value: 0 },
      uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
    },
    side: THREE.BackSide,
    depthWrite: false,
  })
  const mesh = new THREE.Mesh(geometry, material)
  mesh.name = 'starfield'
  mesh.frustumCulled = false
  return mesh
}

export function updateStarfield(mesh: THREE.Mesh, time: number, width: number, height: number) {
  const mat = mesh.material as THREE.ShaderMaterial
  mat.uniforms.uTime.value = time
  mat.uniforms.uResolution.value.set(width, height)
}

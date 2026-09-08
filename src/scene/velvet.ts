import * as THREE from 'three'

/**
 * Soft porcelain / velvet fresnel — not stock MeshStandardMaterial.
 * Rim light reads like glazed ceramic under atelier windows.
 */
export function createVelvetMaterial(color: string, accent: string): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({
    uniforms: {
      uColor: { value: new THREE.Color(color) },
      uAccent: { value: new THREE.Color(accent) },
      uTime: { value: 0 },
      uGlow: { value: 0 },
    },
    vertexShader: /* glsl */ `
      varying vec3 vNormal;
      varying vec3 vView;
      void main() {
        vec4 world = modelMatrix * vec4(position, 1.0);
        vNormal = normalize(mat3(modelMatrix) * normal);
        vView = normalize(cameraPosition - world.xyz);
        gl_Position = projectionMatrix * viewMatrix * world;
      }
    `,
    fragmentShader: /* glsl */ `
      precision mediump float;
      uniform vec3 uColor;
      uniform vec3 uAccent;
      uniform float uTime;
      uniform float uGlow;
      varying vec3 vNormal;
      varying vec3 vView;

      void main() {
        vec3 n = normalize(vNormal);
        vec3 v = normalize(vView);
        float fresnel = pow(1.0 - max(dot(n, v), 0.0), 2.4);
        float soft = 0.55 + 0.45 * max(dot(n, normalize(vec3(0.35, 0.9, 0.25))), 0.0);
        vec3 base = uColor * soft;
        vec3 rim = uAccent * fresnel * (0.85 + uGlow * 0.8);
        // Tiny time shimmer so porcelain never looks dead.
        float shimmer = 0.015 * sin(uTime * 2.2 + fresnel * 8.0);
        vec3 col = base + rim + shimmer;
        col = mix(col, uAccent, uGlow * 0.22);
        gl_FragColor = vec4(col, 1.0);
      }
    `,
  })
}

export function setVelvetGlow(mat: THREE.ShaderMaterial, glow: number, time: number) {
  mat.uniforms.uGlow.value = glow
  mat.uniforms.uTime.value = time
}

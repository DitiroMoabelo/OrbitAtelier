import * as THREE from 'three'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js'
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js'
import { isPhoneUA } from '../device'

/** Subtle cinematic grade: warm midtones, soft vignette, filmic contrast. */
const GradeShader = {
  uniforms: {
    tDiffuse: { value: null as THREE.Texture | null },
    uVignette: { value: 0.38 },
    uWarmth: { value: 0.08 },
    uContrast: { value: 1.08 },
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
    uniform sampler2D tDiffuse;
    uniform float uVignette;
    uniform float uWarmth;
    uniform float uContrast;
    varying vec2 vUv;

    void main() {
      vec4 color = texture2D(tDiffuse, vUv);
      vec3 c = color.rgb;

      // Soft contrast around mid-grey.
      c = (c - 0.5) * uContrast + 0.5;

      // Warmth lift in the highlights — afternoon sun feel.
      float luma = dot(c, vec3(0.299, 0.587, 0.114));
      c.r += uWarmth * luma;
      c.b -= uWarmth * 0.45 * luma;

      // Vignette.
      float d = distance(vUv, vec2(0.5));
      c *= 1.0 - smoothstep(0.35, 0.95, d) * uVignette;

      gl_FragColor = vec4(c, color.a);
    }
  `,
}

export type PostPipeline = {
  composer: EffectComposer
  resize: (width: number, height: number, pixelRatio: number) => void
  render: () => void
}

export function createPostPipeline(
  renderer: THREE.WebGLRenderer,
  scene: THREE.Scene,
  camera: THREE.Camera,
): PostPipeline {
  const composer = new EffectComposer(renderer)
  composer.addPass(new RenderPass(scene, camera))

  const bloomStrength = isPhoneUA ? 0.12 : 0.18
  const bloom = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    bloomStrength,
    0.4,
    0.92,
  )
  composer.addPass(bloom)

  const grade = new ShaderPass(GradeShader)
  grade.uniforms.uVignette.value = isPhoneUA ? 0.22 : 0.32
  grade.uniforms.uWarmth.value = 0.045
  grade.uniforms.uContrast.value = 1.04
  composer.addPass(grade)

  composer.addPass(new OutputPass())

  const resize = (width: number, height: number, pixelRatio: number) => {
    composer.setSize(width, height)
    composer.setPixelRatio(pixelRatio)
    bloom.resolution.set(width, height)
  }

  const render = () => {
    composer.render()
  }

  return { composer, resize, render }
}

/** รวมสองฉาก WebGL ระหว่างเปลี่ยนช็อต (วงอุ้งเท้า / จาง) — render ลง target แล้วผสมด้วย shader */
import * as THREE from 'three';
import type { GLKit } from './gl';
import { H, W } from './gl';

export type CompositeMode = 'paw' | 'fade';

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;
const FRAG = /* glsl */ `
uniform sampler2D tA;
uniform sampler2D tB;
uniform sampler2D tPaw;
uniform float p;
uniform float mode;
uniform float pawSize;
uniform vec2 res;
varying vec2 vUv;
void main() {
  vec4 a = texture2D(tA, vUv);
  vec4 b = texture2D(tB, vUv);
  float m;
  if (mode < 0.5) {
    // หน้ากากรูปอุ้งเท้าขยายจากกลางจอ (ขนาดเป็นพิกเซล เท่ากับ CSS mask ของชั้น DOM)
    vec2 px = (vUv - 0.5) * res;
    vec2 q = px / max(pawSize, 1.0) + 0.5;
    m = (q.x < 0.0 || q.y < 0.0 || q.x > 1.0 || q.y > 1.0) ? 0.0 : texture2D(tPaw, q).a;
  } else {
    m = p;
  }
  gl_FragColor = mix(a, b, m);
  #include <colorspace_fragment>
}
`;

export class Compositor {
  private rtA: THREE.WebGLRenderTarget;
  private rtB: THREE.WebGLRenderTarget;
  private mat: THREE.ShaderMaterial;
  private scene = new THREE.Scene();
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

  constructor(pawTex: THREE.Texture) {
    const opts = { type: THREE.HalfFloatType, depthBuffer: true, samples: 0 } as const;
    this.rtA = new THREE.WebGLRenderTarget(W, H, opts);
    this.rtB = new THREE.WebGLRenderTarget(W, H, opts);
    this.mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        tA: { value: this.rtA.texture },
        tB: { value: this.rtB.texture },
        tPaw: { value: pawTex },
        p: { value: 0 },
        mode: { value: 0 },
        pawSize: { value: 0 },
        res: { value: new THREE.Vector2(W, H) },
      },
      depthTest: false,
      depthWrite: false,
    });
    this.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mat));
  }

  /** render ฉากหนึ่งลง target ที่กำหนด (null = จอ) */
  static into(kit: GLKit, target: THREE.WebGLRenderTarget | null, draw: () => void) {
    kit.renderer.setRenderTarget(target);
    draw();
    kit.renderer.setRenderTarget(null);
  }

  targetA() {
    return this.rtA;
  }

  targetB() {
    return this.rtB;
  }

  composite(kit: GLKit, mode: CompositeMode, p: number, pawSize: number, out: THREE.WebGLRenderTarget | null = null) {
    this.mat.uniforms.mode.value = mode === 'paw' ? 0 : 1;
    this.mat.uniforms.p.value = p;
    this.mat.uniforms.pawSize.value = pawSize;
    kit.renderer.setRenderTarget(out);
    kit.renderer.render(this.scene, this.cam);
  }
}

/** ภาพอุ้งเท้า (ทรงเดียวกับ PAW_SVG ของ CSS mask) */
export async function pawMaskTexture(kit: GLKit): Promise<THREE.CanvasTexture> {
  return kit.canvasTex(512, 512, (c) => {
    const k = 512 / 100;
    c.fillStyle = '#000';
    for (const [cx, cy, rx, ry] of [[50, 64, 24, 20], [22, 40, 9, 11], [38, 24, 9, 12], [62, 24, 9, 12], [78, 40, 9, 11]]) {
      c.beginPath();
      c.ellipse(cx * k, cy * k, rx * k, ry * k, 0, 0, Math.PI * 2);
      c.fill();
    }
  });
}

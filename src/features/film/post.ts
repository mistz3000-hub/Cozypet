/**
 * ชั้น post-process ของทุกเฟรม WebGL: bloom (ฟุ้งเฉพาะส่วนที่สว่างเกินเกณฑ์), vignette, grain และปรับโทนสีเล็กน้อย
 * ทุกฉาก render ลง input() แล้ว finish() ส่งออกจอ — ความสุ่มของ grain ผูกกับเวลา (deterministic)
 * bloom แบบ dual filter: ดึงเฉพาะ “ส่วนเกิน” เหนือ threshold → ย่อหลายระดับ → ขยายกลับแบบ tent แล้วบวกเข้าภาพ
 */
import * as THREE from 'three';
import type { GLKit } from './gl';
import { H, W } from './gl';

export interface PostOpts {
  /** ความแรงของ bloom (0 = ปิด) */
  bloom?: number;
  /** ความสว่าง (linear) ที่เริ่มฟุ้ง — ฟุ้งเฉพาะส่วนที่เกินค่านี้ */
  threshold?: number;
  /** กระจายกว้าง (0..1) */
  radius?: number;
  vignette?: number;
  grain?: number;
  /** ความเปรียบต่าง/อิ่มสี (1 = เดิม) */
  contrast?: number;
  saturation?: number;
  /** ย้อมสีเงา/ส่วนสว่าง (เงาอมฟ้า ส่วนสว่างอมทองแบบหนัง) */
  tint?: number;
  /** แสงอุ่นทั้งจอ (ใช้ทำแฟลชอุ่นที่ไม่ใช่ขาวล้วน) */
  lift?: number;
  /** ค่าแสง (คูณก่อนปรับโทน) */
  exposure?: number;
}

export const DEFAULT_POST: Required<PostOpts> = { bloom: 0.8, threshold: 0.9, radius: 0.7, vignette: 0.28, grain: 0.03, contrast: 1.04, saturation: 1.04, tint: 0.3, lift: 0, exposure: 1 };

const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const BRIGHT = /* glsl */ `
uniform sampler2D tIn;
uniform vec2 texel;
uniform float thr;
varying vec2 vUv;
void main() {
  vec3 c = vec3(0.0);
  c += texture2D(tIn, vUv + texel * vec2(-0.5, -0.5)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(0.5, -0.5)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(-0.5, 0.5)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(0.5, 0.5)).rgb;
  c *= 0.25;
  float br = max(c.r, max(c.g, c.b));
  float knee = thr * 0.25 + 1e-4;
  float soft = clamp(br - thr + knee, 0.0, 2.0 * knee);
  soft = soft * soft / (4.0 * knee);
  float w = max(soft, br - thr) / max(br, 1e-4);
  gl_FragColor = vec4(min(c * w, vec3(6.0)), 1.0);
}
`;

const DOWN = /* glsl */ `
uniform sampler2D tIn;
uniform vec2 texel;
varying vec2 vUv;
void main() {
  vec3 c = texture2D(tIn, vUv).rgb * 4.0;
  c += texture2D(tIn, vUv + texel * vec2(-1.0, -1.0)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(1.0, -1.0)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(-1.0, 1.0)).rgb;
  c += texture2D(tIn, vUv + texel * vec2(1.0, 1.0)).rgb;
  gl_FragColor = vec4(c / 8.0, 1.0);
}
`;

const UP = /* glsl */ `
uniform sampler2D tIn;
uniform sampler2D tBase;
uniform vec2 texel;
uniform float spread;
varying vec2 vUv;
void main() {
  vec2 o = texel * spread;
  vec3 c = vec3(0.0);
  c += texture2D(tIn, vUv + vec2(-o.x, -o.y)).rgb;
  c += texture2D(tIn, vUv + vec2(0.0, -o.y)).rgb * 2.0;
  c += texture2D(tIn, vUv + vec2(o.x, -o.y)).rgb;
  c += texture2D(tIn, vUv + vec2(-o.x, 0.0)).rgb * 2.0;
  c += texture2D(tIn, vUv).rgb * 4.0;
  c += texture2D(tIn, vUv + vec2(o.x, 0.0)).rgb * 2.0;
  c += texture2D(tIn, vUv + vec2(-o.x, o.y)).rgb;
  c += texture2D(tIn, vUv + vec2(0.0, o.y)).rgb * 2.0;
  c += texture2D(tIn, vUv + vec2(o.x, o.y)).rgb;
  gl_FragColor = vec4(c / 16.0 + texture2D(tBase, vUv).rgb, 1.0);
}
`;

const FINAL = /* glsl */ `
uniform sampler2D tIn;
uniform sampler2D tBloom;
uniform float uBloom;
uniform float uVig;
uniform float uGrain;
uniform float uContrast;
uniform float uSat;
uniform float uTint;
uniform float uLift;
uniform float uExposure;
uniform float uSeed;
uniform vec2 res;
varying vec2 vUv;
float hash(vec2 p) { p = fract(p * vec2(443.897, 441.423)); p += dot(p, p.yx + 19.19); return fract((p.x + p.y) * p.x); }
void main() {
  vec2 d = vUv - 0.5;
  float ca = 0.0016 * dot(d, d) * 4.0;
  vec3 col;
  col.r = texture2D(tIn, vUv + d * ca).r;
  col.g = texture2D(tIn, vUv).g;
  col.b = texture2D(tIn, vUv - d * ca).b;
  col += texture2D(tBloom, vUv).rgb * uBloom;
  col *= uExposure;
  float l = dot(col, vec3(0.2126, 0.7152, 0.0722));
  vec3 shadowTint = vec3(0.93, 0.97, 1.07);
  vec3 highTint = vec3(1.04, 1.0, 0.93);
  col *= mix(vec3(1.0), mix(shadowTint, highTint, smoothstep(0.05, 0.6, l)), uTint);
  col = mix(vec3(l), col, uSat);
  col = max(vec3(0.0), (col - 0.18) * uContrast + 0.18);
  col += uLift * vec3(1.0, 0.9, 0.74);
  // ม้วนส่วนสว่างจัดให้นุ่ม (ไม่ตัดขาวแข็ง)
  col = col / (1.0 + max(vec3(0.0), col - 1.0) * 0.6);
  float v = smoothstep(0.92, 0.28, length(d * vec2(1.0, 0.82)));
  col *= mix(1.0 - uVig, 1.0, v);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
  float g = hash(vUv * res + uSeed) - 0.5;
  gl_FragColor.rgb += g * uGrain;
}
`;

function mat(frag: string, uniforms: Record<string, THREE.IUniform>): THREE.ShaderMaterial {
  return new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
}

export class Post {
  private rt: THREE.WebGLRenderTarget;
  private down: THREE.WebGLRenderTarget[] = [];
  private up: THREE.WebGLRenderTarget[] = [];
  private quad: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private scene = new THREE.Scene();
  private cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  private mBright = mat(BRIGHT, { tIn: { value: null }, texel: { value: new THREE.Vector2() }, thr: { value: 1 } });
  private mDown = mat(DOWN, { tIn: { value: null }, texel: { value: new THREE.Vector2() } });
  private mUp = mat(UP, { tIn: { value: null }, tBase: { value: null }, texel: { value: new THREE.Vector2() }, spread: { value: 1 } });
  private mFinal: THREE.ShaderMaterial;

  constructor(samples = 4) {
    this.rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, depthBuffer: true, samples });
    const LEVELS = 6;
    for (let i = 0; i < LEVELS; i++) {
      const w = Math.max(1, Math.round(W / 2 ** (i + 1)));
      const h = Math.max(1, Math.round(H / 2 ** (i + 1)));
      const o = { type: THREE.HalfFloatType, depthBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter } as const;
      this.down.push(new THREE.WebGLRenderTarget(w, h, o));
      this.up.push(new THREE.WebGLRenderTarget(w, h, o));
    }
    this.mFinal = mat(FINAL, {
      tIn: { value: this.rt.texture },
      tBloom: { value: null },
      uBloom: { value: 0 },
      uVig: { value: 0 },
      uGrain: { value: 0 },
      uContrast: { value: 1 },
      uSat: { value: 1 },
      uTint: { value: 0 },
      uLift: { value: 0 },
      uExposure: { value: 1 },
      uSeed: { value: 0 },
      res: { value: new THREE.Vector2(W, H) },
    });
    this.quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), this.mFinal);
    this.scene.add(this.quad);
  }

  input(): THREE.WebGLRenderTarget {
    return this.rt;
  }

  private pass(r: THREE.WebGLRenderer, m: THREE.ShaderMaterial, out: THREE.WebGLRenderTarget | null) {
    this.quad.material = m;
    r.setRenderTarget(out);
    r.render(this.scene, this.cam);
  }

  /** bloom + ปรับสี แล้วส่งออกจอ */
  finish(kit: GLKit, t: number, o: PostOpts = {}) {
    const p = { ...DEFAULT_POST, ...o };
    const r = kit.renderer;
    let bloomTex: THREE.Texture | null = null;
    if (p.bloom > 0.001) {
      const d = this.down;
      this.mBright.uniforms.tIn.value = this.rt.texture;
      this.mBright.uniforms.texel.value.set(1 / W, 1 / H);
      this.mBright.uniforms.thr.value = p.threshold;
      this.pass(r, this.mBright, d[0]);
      for (let i = 1; i < d.length; i++) {
        this.mDown.uniforms.tIn.value = d[i - 1].texture;
        this.mDown.uniforms.texel.value.set(1 / d[i - 1].width, 1 / d[i - 1].height);
        this.pass(r, this.mDown, d[i]);
      }
      let src = d[d.length - 1].texture;
      for (let i = d.length - 2; i >= 0; i--) {
        this.mUp.uniforms.tIn.value = src;
        this.mUp.uniforms.tBase.value = d[i].texture;
        this.mUp.uniforms.texel.value.set(1 / d[i + 1].width, 1 / d[i + 1].height);
        this.mUp.uniforms.spread.value = 0.6 + p.radius;
        this.pass(r, this.mUp, this.up[i]);
        src = this.up[i].texture;
      }
      bloomTex = src;
    }
    const u = this.mFinal.uniforms;
    u.tBloom.value = bloomTex ?? this.down[0].texture;
    u.uBloom.value = bloomTex ? p.bloom / 6 : 0;
    u.uVig.value = p.vignette;
    u.uGrain.value = p.grain;
    u.uContrast.value = p.contrast;
    u.uSat.value = p.saturation;
    u.uTint.value = p.tint;
    u.uLift.value = p.lift;
    u.uExposure.value = p.exposure;
    u.uSeed.value = Math.floor(t * 30) * 7.13;
    this.pass(r, this.mFinal, null);
  }
}

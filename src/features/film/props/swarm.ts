/**
 * ฝูงการ์ดน้อง ๆ หลายพันใบ (InstancedMesh + shader เดียว) — บินวนเป็นพายุ แล้วรวมตัวเป็นรูปทรงเป้าหมายได้ (เช่นโลโก้)
 * ตำแหน่งทุกใบเป็นฟังก์ชันของเวลา (seeded) จึง seek ได้ทุกเฟรม
 */
import * as THREE from 'three';
import { rngFromKey } from '@/lib/seeded-random';
import { clamp, ease } from '../timeline';
import type { CardAtlas } from './atlas';

const VERT = /* glsl */ `
attribute float aTile;
attribute float aShade;
uniform vec2 grid;
varying vec2 vUv;
varying float vShade;
varying float vLight;
varying float vSpec;
void main() {
  float col = mod(aTile, grid.x);
  float row = floor(aTile / grid.x);
  vUv = vec2((uv.x + col) / grid.x, 1.0 - (row + 1.0 - uv.y) / grid.y);
  vShade = aShade;
  mat4 mv = modelViewMatrix * instanceMatrix;
  vec3 n = normalize(mat3(mv) * vec3(0.0, 0.0, 1.0));
  vec4 p = mv * vec4(position, 1.0);
  vec3 v = normalize(-p.xyz);
  vec3 l = normalize(vec3(-0.4, 0.7, 0.6));
  vLight = abs(dot(n, l));
  vSpec = pow(max(dot(reflect(-l, n * sign(dot(n, v))), v), 0.0), 24.0);
  gl_Position = projectionMatrix * p;
}
`;
const FRAG = /* glsl */ `
uniform sampler2D map;
uniform float uBright;
uniform vec3 uTint;
uniform float uFogNear;
uniform float uFogFar;
uniform vec3 uFog;
varying vec2 vUv;
varying float vShade;
varying float vLight;
varying float vSpec;
void main() {
  vec4 c = texture2D(map, vUv);
  if (c.a < 0.5) discard;
  vec3 col = gl_FrontFacing ? c.rgb : vec3(0.93, 0.9, 0.85);
  col *= (0.55 + 0.55 * vLight) * vShade * uBright * uTint;
  col += vSpec * 0.6 * uBright;
  float depth = gl_FragCoord.z / gl_FragCoord.w;
  float f = smoothstep(uFogNear, uFogFar, depth);
  col = mix(col, uFog, f);
  gl_FragColor = vec4(col, 1.0);
  #include <colorspace_fragment>
}
`;

interface Card { th: number; w: number; r: number; y: number; ya: number; yp: number; z: number; spin: THREE.Vector3; ph: number; delay: number; tile: number; size: number }

export interface SwarmPose {
  /** เวลาของฝูง (วินาที) */
  t: number;
  /** 0..1 การรวมตัวเข้าหาเป้าหมาย */
  form?: number;
  /** ระยะเวลาที่การ์ดแต่ละใบทยอยรวมตัว (สัดส่วน 0..1 ของ form) */
  stagger?: number;
  targets?: THREE.Vector3[];
  targetScale?: number;
  /** หมุนหน้าเข้าหากล้องตอนรวมตัว */
  cam?: THREE.Camera;
  /** 0..1 การ์ดทยอยปรากฏ */
  appear?: number;
  center?: THREE.Vector3;
  /** ความเร็วพายุ (คูณ) */
  speed?: number;
  /** ขยายรัศมีพายุ (คูณ) */
  spread?: number;
  /** 0..1 ให้การ์ดในพายุหันหน้าเข้าหากล้องมากขึ้น (เห็นภาพน้องมากกว่าด้านหลัง) */
  face?: number;
}

export class CardSwarm {
  mesh: THREE.InstancedMesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  private cards: Card[] = [];
  private dummy = new THREE.Object3D();
  private q = new THREE.Quaternion();
  private e = new THREE.Euler();

  constructor(atlas: CardAtlas, n: number, key: string, opts: { size?: number; rMin?: number; rMax?: number; height?: number; depth?: number; spin?: number } = {}) {
    const geo = new THREE.PlaneGeometry(0.8, 1.0);
    const tile = new Float32Array(n);
    const shade = new Float32Array(n);
    const rnd = rngFromKey(`cozypet:v1:film:swarm:${key}`);
    const rMin = opts.rMin ?? 2.5;
    const rMax = opts.rMax ?? 14;
    const h = opts.height ?? 9;
    for (let i = 0; i < n; i++) {
      tile[i] = Math.floor(rnd() * atlas.count);
      shade[i] = 0.8 + rnd() * 0.25;
      this.cards.push({
        th: rnd() * Math.PI * 2,
        w: (0.12 + rnd() * 0.35) * (rnd() < 0.5 ? 1 : 1),
        r: rMin + Math.pow(rnd(), 0.7) * (rMax - rMin),
        y: (rnd() - 0.5) * h,
        ya: 0.2 + rnd() * 0.8,
        yp: rnd() * 6,
        z: (rnd() - 0.5) * (opts.depth ?? 0),
        spin: new THREE.Vector3(rnd() * 2 - 1, (rnd() * 2 - 1) * 0.6, rnd() * 2 - 1).multiplyScalar(opts.spin ?? 1.8),
        ph: rnd() * 10,
        delay: rnd(),
        tile: tile[i],
        size: (opts.size ?? 0.5) * (0.7 + rnd() * 0.6),
      });
    }
    geo.setAttribute('aTile', new THREE.InstancedBufferAttribute(tile, 1));
    geo.setAttribute('aShade', new THREE.InstancedBufferAttribute(shade, 1));
    const mat = new THREE.ShaderMaterial({
      vertexShader: VERT,
      fragmentShader: FRAG,
      uniforms: {
        map: { value: atlas.tex },
        grid: { value: new THREE.Vector2(...atlas.grid) },
        uBright: { value: 1 },
        uTint: { value: new THREE.Color(1, 1, 1) },
        uFog: { value: new THREE.Color(0, 0, 0) },
        uFogNear: { value: 1000 },
        uFogFar: { value: 1001 },
      },
      side: THREE.DoubleSide,
    });
    this.mesh = new THREE.InstancedMesh(geo, mat, n);
    this.mesh.frustumCulled = false;
  }

  get count() {
    return this.cards.length;
  }

  setFog(color: THREE.ColorRepresentation, near: number, far: number) {
    const u = this.mesh.material.uniforms;
    u.uFog.value.set(color);
    u.uFogNear.value = near;
    u.uFogFar.value = far;
  }

  setLook(bright: number, tint: THREE.ColorRepresentation = '#ffffff') {
    const u = this.mesh.material.uniforms;
    u.uBright.value = bright;
    u.uTint.value.set(tint);
  }

  update(p: SwarmPose) {
    const center = p.center ?? new THREE.Vector3();
    const form = p.form ?? 0;
    const stagger = p.stagger ?? 0.6;
    const appear = p.appear ?? 1;
    const sp = p.speed ?? 1;
    const spread = p.spread ?? 1;
    const T = p.t;
    const d = this.dummy;
    this.cards.forEach((c, i) => {
      const vis = clamp((appear - c.delay * 0.85) / 0.15);
      // พายุ: หมุนวนรอบแกนตั้ง + ลอยขึ้นลง + พลิกตัว
      const th = c.th + c.w * T * sp;
      const r = c.r * spread;
      const sx = center.x + Math.cos(th) * r;
      const sz = center.z + Math.sin(th) * r + c.z;
      const sy = center.y + c.y + Math.sin(T * c.ya + c.yp) * 0.6;
      let k = 0;
      if (form > 0 && p.targets?.length) {
        const a = c.delay * stagger;
        k = ease.inOut(clamp((form - a) / Math.max(0.0001, 1 - stagger)));
      }
      this.e.set(c.spin.x * T * sp + c.ph, c.spin.y * T * sp + c.ph * 2, c.spin.z * T * sp);
      this.q.setFromEuler(this.e);
      if (p.cam && p.face) this.q.slerp(p.cam.quaternion, p.face);
      if (k > 0 && p.targets) {
        const tg = p.targets[i % p.targets.length];
        const lift = Math.sin(k * Math.PI) * 1.2;
        d.position.set(sx + (tg.x - sx) * k, sy + (tg.y - sy) * k + lift, sz + (tg.z - sz) * k);
        if (p.cam) this.q.slerp(p.cam.quaternion, k);
        d.scale.setScalar(c.size * vis * (1 + ((p.targetScale ?? 1) - 1) * k));
      } else {
        d.position.set(sx, sy, sz);
        d.scale.setScalar(c.size * vis);
      }
      d.quaternion.copy(this.q);
      d.updateMatrix();
      this.mesh.setMatrixAt(i, d.matrix);
    });
    this.mesh.instanceMatrix.needsUpdate = true;
  }
}

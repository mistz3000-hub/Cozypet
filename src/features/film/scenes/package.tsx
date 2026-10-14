/**
 * แพ็กเกจของใช้ (1 ห้อง): กล่องคราฟต์ปิดฝาแล้วบินโค้งจากคู่ค้าไปหาผู้ดูแล แถบเสบียงเปลี่ยนจากแดงเป็นเขียว
 * จบด้วยกล่องพุ่งเข้าหากล้อง (ต่อด้วยภาพเปลี่ยนฉาก “กล่องพัสดุเข้าจอ”) · ตัวเลขเสบียงเป็นข้อมูลสาธิต
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { fill } from '../context';
import { clamp, ease, lerp, prog } from '../timeline';
import { SupplyBox, iconDisc, preloadKraft } from '../props/objects';
import type { SceneModule, SceneSfx } from './types';
import { Beam, Floaters, Sparks, applyCam, atlasCanvasTex, featureCoin, glowTexture, iconCardTexture, makeCamera, portraitDisc, project, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const FROM = new THREE.Vector3(-4.3, 0.2, 0);
const TO = new THREE.Vector3(4.2, 0.4, 0);
const TT = { close: 0.15, fly: 0.55, land: 1.55, dive: 2.05 };

const rig = (t: number): CamRig => ({ pos: [0.3 * Math.sin(t * 0.8), 1.2, lerp(12.5, 11.5, prog(t, 0, 2.67))], look: [0, 0.4, 0], fov: 30 });

class PackageScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private box!: SupplyBox;
  private partner!: THREE.Group;
  private caregiver!: THREE.Group;
  private arc = new Beam('#f4b400', 0.03, 0.9);
  private sparks!: Sparks;
  private floaters!: Floaters;

  async init(kit: GLKit) {
    await studio(kit, this.scene, { env: 0.85 });
    this.scene.environmentRotation.set(0.35, 0.9, 0);
    const glow = await glowTexture(kit);
    this.floaters = new Floaters(glow, 40, 'package', { x: 26, y: 14, z0: -10, z1: -3 });
    this.scene.add(this.floaters.mesh);
    await preloadKraft(kit);
    this.box = new SupplyBox(kit, 1.3, await iconDisc(kit, 'heart', '#fff3d1'));
    this.scene.add(this.box.group);
    this.partner = featureCoin(await iconCardTexture(kit, 'box', { size: 256 }), 0.85);
    this.partner.position.copy(FROM).add(new THREE.Vector3(0, 0.3, -0.5));
    this.scene.add(this.partner);
    this.caregiver = portraitDisc(await atlasCanvasTex(kit, '/images/people/people-01.png', 5, 5, 0, 384), 0.95);
    this.caregiver.position.copy(TO).add(new THREE.Vector3(0, 0.3, -0.5));
    this.scene.add(this.caregiver);
    this.scene.add(this.arc.mesh);
    this.sparks = new Sparks(glow, 50, 'package');
    this.scene.add(this.sparks.mesh);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    for (const g of [this.partner, this.caregiver]) g.quaternion.copy(this.camera.quaternion);
    this.partner.scale.setScalar(Math.max(0.001, ease.backOut(prog(t, 0, 0.35))));
    this.caregiver.scale.setScalar(Math.max(0.001, ease.backOut(prog(t, 0.1, 0.45))));
    this.box.setOpen(1 - ease.inOut(prog(t, TT.close, TT.fly)));
    const fly = ease.inOut(prog(t, TT.fly, TT.land));
    const mid = FROM.clone().lerp(TO, 0.5).add(new THREE.Vector3(0, 2.2, 0.8));
    const curve = new THREE.QuadraticBezierCurve3(FROM.clone().add(new THREE.Vector3(1.2, -0.6, 0.5)), mid, TO.clone().add(new THREE.Vector3(-1.4, -0.8, 0.6)));
    const p = curve.getPoint(fly);
    const dive = ease.in(prog(t, TT.dive, 2.667));
    const camFront = new THREE.Vector3(...rig(t).pos).add(new THREE.Vector3(0, -0.4, -2.2));
    this.box.group.position.copy(p).lerp(camFront, dive);
    this.box.group.rotation.set(0.25 + dive * 0.4, lerp(0.6, -0.3, fly) + Math.sin(fly * Math.PI) * 0.8, Math.sin(fly * Math.PI) * 0.25);
    this.box.group.scale.setScalar(1 + dive * 0.6);
    this.arc.set(FROM.clone().add(new THREE.Vector3(1.2, -0.6, 0.5)), TO.clone().add(new THREE.Vector3(-1.4, -0.8, 0.6)), 2.3, 0.03, 48);
    this.arc.progress(0, fly);
    this.sparks.burst(TO.clone().add(new THREE.Vector3(-1.3, -0.4, 0.8)), t - TT.land, this.camera, 1.2);
    this.floaters.update(t + 5, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function PackageOverlay({ t, ctx }: SceneProps) {
  const st = ctx.fm.story;
  const r = rig(t);
  const pa = project(r, FROM.clone().add(new THREE.Vector3(0, -1.0, -0.5)));
  const ca = project(r, TO.clone().add(new THREE.Vector3(0, -1.0, -0.5)));
  const full = ease.expoOut(prog(t, TT.land, TT.land + 0.6));
  const days = Math.round(lerp(2, 9, full));
  const fade = 1 - prog(t, TT.dive, TT.dive + 0.3);
  return (
    <div className={s.full} style={{ opacity: fade }}>
      <span className={s.pkLabel} style={{ left: pa.x, top: pa.y, opacity: ease.out(prog(t, 0.1, 0.4)) }}>{st.warehouse}</span>
      <div className={s.pkSupply} style={{ left: ca.x, top: ca.y, opacity: ease.out(prog(t, 0.2, 0.5)) }}>
        <span className={s.pkLabelInline}>{st.caregiver}</span>
        <span className={s.pkBar} data-ok={full > 0.5 ? 'true' : undefined}><i style={{ transform: `scaleX(${lerp(0.18, 0.9, full).toFixed(3)})` }} /></span>
        <span className={s.pkDays}>{fill(full > 0.5 ? st.supplyAfter : st.supply, { days })} · {st.demoData}</span>
      </div>
      <div className={s.pkSteps} style={{ opacity: ease.out(prog(t, 0.3, 0.6)) }}>
        {st.timeline.map((x, i) => {
          const on = clamp((t - (TT.fly + i * 0.28)) / 0.15);
          return <span key={x} data-on={on > 0.5 ? 'true' : undefined}>{x}</span>;
        })}
      </div>
    </div>
  );
}

function packageSfx(): SceneSfx[] {
  return [
    { at: TT.close, kind: 'thud', note: 2, gain: 0.45 },
    { at: TT.fly - 0.1, kind: 'stamp', gain: 0.4 },
    { at: TT.fly, kind: 'whoosh', dur: 1.0, gain: 0.55 },
    { at: TT.fly + 0.0, kind: 'tick', note: 4, gain: 0.25 },
    { at: TT.fly + 0.28, kind: 'tick', note: 5, gain: 0.25 },
    { at: TT.fly + 0.56, kind: 'tick', note: 7, gain: 0.25 },
    { at: TT.fly + 0.84, kind: 'tick', note: 9, gain: 0.25 },
    { at: TT.land, kind: 'success', gain: 0.6 },
    { at: TT.dive, kind: 'whoosh', dur: 0.6, gain: 0.7 },
  ];
}

export const pkg: SceneModule = {
  gl: (_ctx: FilmContext) => new PackageScene(),
  Overlay: PackageOverlay,
  hud: 'light',
  sfx: packageSfx,
  post: () => ({ bloom: 0.7, threshold: 0.95, vignette: 0.3 }),
};

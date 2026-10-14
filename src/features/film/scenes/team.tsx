/**
 * การ์ดทีม + ข้อความปิด (2 ห้อง): โลโก้ 3 มิติ ชื่อทีม สมาชิก (จาก team.local.json เท่านั้น ไม่แต่งเอง) QR เว็บเดโม
 * ช่องที่ยังไม่มีข้อมูลแสดง [[ต้องเติม: …]] ให้ทีมเติมก่อน render จริง · ข้อความปิดบอกว่าอะไรเป็นข้อมูลจำลอง/สังเคราะห์
 */
import * as THREE from 'three';
import QRCode from 'qrcode';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { fill } from '../context';
import { ease, lerp, prog } from '../timeline';
import { Logo3D } from '../props/logo3d';
import { cardAtlas } from '../props/atlas';
import { CardSwarm } from '../props/swarm';
import { photoCard } from '../props/objects';
import type { SceneModule, SceneSfx } from './types';
import { Floaters, applyCam, glowTexture, makeCamera, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const SITE = 'https://cozypet-iota.vercel.app';
const rig = (t: number): CamRig => ({ pos: [0.2 * Math.sin(t * 0.5), 0.2, lerp(11.5, 10.8, prog(t, 0, 5.33))], look: [0, 0, 0], fov: 30 });

class TeamScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private logo = new Logo3D(1.9);
  private qr!: THREE.Group;
  private swarm!: CardSwarm;
  private floaters!: Floaters;
  private ctx: FilmContext;

  constructor(ctx: FilmContext) {
    this.ctx = ctx;
  }

  async init(kit: GLKit) {
    await studio(kit, this.scene, { env: 0.8 });
    this.scene.environmentRotation.set(0.35, 0.9, 0);
    const glow = await glowTexture(kit);
    this.floaters = new Floaters(glow, 40, 'team', { x: 26, y: 14, z0: -10, z1: -3 });
    this.scene.add(this.floaters.mesh);
    this.logo.group.position.set(-3.75, 0.95, 0);
    this.scene.add(this.logo.group);
    const atlas = await cardAtlas(kit);
    this.swarm = new CardSwarm(atlas, 150, 'team', { size: 0.5, rMin: 6, rMax: 11, height: 10, spin: 0.5 });
    this.swarm.setLook(0.95);
    this.swarm.setFog('#fff3d1', 10, 26);
    this.scene.add(this.swarm.mesh);
    const url = this.ctx.team?.siteUrl || SITE;
    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, url, { margin: 1, width: 512, color: { dark: '#2b2118', light: '#fffdf8' } });
    const tex = new THREE.CanvasTexture(qrCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    this.qr = photoCard(tex, 1.75, 1.75);
    this.qr.position.set(3.75, 0.55, 0);
    this.scene.add(this.qr);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig(t));
    this.logo.setBuild(prog(t, 0, 0.9));
    this.logo.blink(Math.max(0, 1 - Math.abs(t - 2.4) / 0.09));
    this.logo.group.rotation.y = 0.12 * Math.sin(t * 0.8);
    this.qr.scale.setScalar(Math.max(0.001, ease.backOut(prog(t, 0.5, 0.95))));
    this.qr.rotation.y = -0.15 + 0.05 * Math.sin(t);
    this.swarm.update({ t: t + 40, speed: 0.25, cam: this.camera, face: 0.6, center: new THREE.Vector3(0, 0, -12) });
    this.floaters.update(t, this.camera);
    kit.renderer.render(this.scene, this.camera);
  }
}

function TeamOverlay({ t, ctx }: SceneProps) {
  const fm = ctx.fm;
  const team = ctx.team;
  const miss = (field: string) => fill(fm.team.missing, { field });
  const members = team?.members?.length ? team.members : [{}, {}, {}];
  const name = (ctx.locale === 'en' ? team?.teamNameEn : team?.teamName) ?? fm.team.title;
  const site = (team?.siteUrl || SITE).replace(/^https?:\/\//, '');
  const close = ease.out(prog(t, 3.3, 3.7));
  return (
    <div className={s.full}>
      <div className={s.tmHead} style={{ opacity: ease.out(prog(t, 0.3, 0.7)) }}>
        <span className={s.tmProject}>{team?.projectName ?? fm.team.project}</span>
        <h2 className={s.tmName}>{name}</h2>
      </div>
      <div className={s.tmMembers}>
        <span className={s.tmMembersTitle} style={{ opacity: ease.out(prog(t, 0.6, 0.9)) }}>{fm.team.members}</span>
        {members.map((m, i) => {
          const a = 0.7 + i * 0.07;
          const full = (ctx.locale === 'en' ? m.fullNameEn : m.fullNameTh) ?? m.fullNameTh;
          return (
            <span key={i} className={s.tmMember} style={{ opacity: ease.out(prog(t, a, a + 0.3)), transform: `translateX(${((1 - ease.out(prog(t, a, a + 0.3))) * 20).toFixed(1)}px)` }}>
              <i>{String(i + 1).padStart(2, '0')}</i>
              <b>{full ?? miss('ชื่อ–นามสกุล')}</b>
              <span>{m.studentId ?? miss('รหัสนักศึกษา')}</span>
            </span>
          );
        })}
      </div>
      <div className={s.tmTry} style={{ opacity: ease.out(prog(t, 0.9, 1.2)) }}>
        <span>{fm.team.tryAt}</span>
        <b>{site}</b>
      </div>
      <div className={s.tmClose} style={{ opacity: close }}>
        {fm.closing.lines.map((l) => <span key={l}>{l}</span>)}
      </div>
    </div>
  );
}

function teamSfx(): SceneSfx[] {
  return [
    { at: 0.05, kind: 'sparkle', gain: 0.4 },
    { at: 0.5, kind: 'pop', note: 3, gain: 0.4 },
    { at: 2.4, kind: 'tick', note: 9, gain: 0.2 },
  ];
}

export const team: SceneModule = {
  gl: (ctx) => new TeamScene(ctx),
  Overlay: TeamOverlay,
  hud: 'light',
  sfx: teamSfx,
  post: (t) => ({ bloom: 0.6, threshold: 0.95, vignette: 0.3, exposure: lerp(1, 0.0, ease.in(prog(t, 4.9, 5.33))) }),
};

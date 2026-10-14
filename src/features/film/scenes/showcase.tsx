/**
 * แผ่นรวม prop 3 มิติ (cut=props) — ใช้ตรวจหน้าตา prop ทุกชิ้นก่อนนำไปใช้ในวิดีโอ ไม่ได้อยู่ในวิดีโอเดโม
 */
import * as THREE from 'three';
import type { GLKit, GLScene } from '../gl';
import type { FilmContext, SceneProps } from '../context';
import { ease, prog } from '../timeline';
import { Logo3D } from '../props/logo3d';
import { CapacityTank, ChatBubble, MapPin, ScanFrame, STATUS, SupplyBox, heartCoin, iconDisc, noticeFace, photoCard, pushPin, readCheck } from '../props/objects';
import type { SceneModule } from './types';
import { applyCam, atlasCanvasTex, featureCoin, iconCardTexture, makeCamera, phoneModel, portraitDisc, project, studio, type CamRig } from './stage';
import s from './scenes.module.css';

const COLS = [-6.3, -2.1, 2.1, 6.3];
const ROWS = [2.45, -0.35, -3.05];
const LABELS = ['Logo3D', 'MapPin × 3', 'CapacityTank × 3', 'SupplyBox', 'ChatBubble + ReadCheck', 'HeartCoin', 'ScanFrame + PhotoCard', 'NoticeCard + PushPin', 'Phone', 'FeatureCoin', 'PortraitDisc', 'Icon set'];

const rig = (): CamRig => ({ pos: [0, 0.6, 22], look: [0, -0.2, 0], fov: 30 });

class ShowcaseScene implements GLScene {
  scene = new THREE.Scene();
  camera = makeCamera();
  private items: THREE.Object3D[] = [];
  private logo = new Logo3D(1.9);
  private pins: MapPin[] = [];
  private tanks: CapacityTank[] = [];
  private box!: SupplyBox;
  private bubbles: ChatBubble[] = [];
  private scan!: ScanFrame;

  async init(kit: GLKit) {
    await studio(kit, this.scene, { env: 0.9 });
    this.scene.environmentRotation.set(0.35, 0.9, 0);
    const at = (i: number) => new THREE.Vector3(COLS[i % 4], ROWS[Math.floor(i / 4)], 0);
    const add = (o: THREE.Object3D, i: number, dy = 0) => {
      const g = new THREE.Group();
      g.add(o);
      g.position.copy(at(i)).add(new THREE.Vector3(0, dy, 0));
      this.scene.add(g);
      this.items[i] = g;
    };
    add(this.logo.group, 0);
    const pinG = new THREE.Group();
    const faces = await Promise.all([iconDisc(kit, 'home'), iconDisc(kit, 'home'), iconDisc(kit, 'home')]);
    (['open', 'tight', 'full'] as const).forEach((st, i) => {
      const p = new MapPin(STATUS[st], faces[i], 0.55);
      p.group.position.set((i - 1) * 1.1, -0.9, 0);
      this.pins.push(p);
      pinG.add(p.group);
    });
    add(pinG, 1);
    const tankG = new THREE.Group();
    for (let i = 0; i < 3; i++) {
      const tk = new CapacityTank(0.32, 1.5);
      tk.group.position.set((i - 1) * 0.95, -0.9, 0);
      this.tanks.push(tk);
      tankG.add(tk.group);
    }
    add(tankG, 2);
    const sticker = await iconDisc(kit, 'heart', '#fff3d1');
    this.box = new SupplyBox(kit, 1.3, sticker);
    this.box.group.position.y = -0.7;
    add(this.box.group, 3);
    const bg = new THREE.Group();
    const b1 = new ChatBubble(1.7, 0.7, 'left');
    b1.group.position.set(-0.3, 0.45, 0);
    const b2 = new ChatBubble(1.5, 0.62, 'right');
    b2.group.position.set(0.35, -0.5, 0);
    this.bubbles.push(b1, b2);
    const rc = readCheck('#f4b400', 0.38);
    rc.position.set(1.2, -0.95, 0.2);
    bg.add(b1.group, b2.group, rc);
    add(bg, 4);
    const hc = heartCoin(1.5);
    add(hc, 5);
    const photoTex = await atlasCanvasTex(kit, '/images/cats/cats-01.png', 4, 4, 3, 512);
    const pc = photoCard(photoTex, 1.5, 1.5);
    this.scan = new ScanFrame(kit, 1.8, 1.8, await ScanFrame.laserTexture(kit));
    this.scan.group.position.z = 0.1;
    const sg = new THREE.Group();
    sg.add(pc, this.scan.group);
    add(sg, 6);
    const street = kit.shared.get('street') as string | undefined;
    const nf = await noticeFace(kit, street ? await kit.image(street) : await kit.image('/mascot/cat-happy.png'));
    const notice = photoCard(nf, 1.35, 1.8);
    const pin = pushPin();
    pin.position.set(0, 0.85, 0.05);
    notice.add(pin);
    add(notice, 7);
    const scr = await kit.canvasTex(390, 844, (c) => {
      c.fillStyle = '#fffdf8';
      c.fillRect(0, 0, 390, 844);
      c.fillStyle = '#f4b400';
      c.beginPath();
      c.roundRect(24, 90, 342, 180, 24);
      c.fill();
    });
    add(phoneModel(scr, 2.3), 8);
    const coinTex = await iconCardTexture(kit, 'balancer', { size: 256 });
    add(featureCoin(coinTex, 0.8), 9);
    const ptex = await atlasCanvasTex(kit, '/images/people/people-01.png', 5, 5, 0, 384);
    add(portraitDisc(ptex, 0.85), 10);
    const icons = new THREE.Group();
    const names = ['scan', 'notice', 'ai', 'balancer', 'chat', 'handoff', 'box', 'split', 'dashboard'] as const;
    for (let i = 0; i < names.length; i++) {
      const tex = await iconCardTexture(kit, names[i], { size: 192 });
      const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), new THREE.MeshBasicMaterial({ map: tex, toneMapped: false }));
      m.position.set(((i % 3) - 1) * 0.72, (1 - Math.floor(i / 3)) * 0.72, 0);
      icons.add(m);
    }
    add(icons, 11);
  }

  render(t: number, kit: GLKit) {
    applyCam(this.camera, rig());
    this.logo.setBuild(Math.min(1, t / 1.2));
    this.items.forEach((g, i) => {
      if (i === 11) return;
      g.rotation.y = 0.45 * Math.sin(t * 0.8 + i);
    });
    this.pins.forEach((p, i) => p.update(t + i * 0.3, prog(t, 0.2 + i * 0.15, 1.2 + i * 0.15), this.camera));
    this.tanks.forEach((tk, i) => tk.set([0.3, 0.75, 1.05][i], (['open', 'tight', 'full'] as const)[i], t + i, i === 2 ? 1 : 0));
    this.box.setOpen(0.5 + 0.5 * Math.sin(t * 1.2));
    this.bubbles[0].set(t, true);
    this.bubbles[1].set(t, false);
    this.scan.set((t * 0.5) % 1, 1);
    kit.renderer.render(this.scene, this.camera);
  }
}

function ShowcaseOverlay({ t }: SceneProps) {
  const r = rig();
  return (
    <div className={s.full}>
      {LABELS.map((l, i) => {
        const p = project(r, [COLS[i % 4], ROWS[Math.floor(i / 4)] - 1.3, 0]);
        return <span key={l} className={s.propLabel} style={{ left: p.x, top: p.y, opacity: ease.out(prog(t, 0, 0.3)) }}>{l}</span>;
      })}
    </div>
  );
}

export const showcase: SceneModule = {
  gl: (_ctx: FilmContext) => new ShowcaseScene(),
  Overlay: ShowcaseOverlay,
  post: () => ({ bloom: 0.6, threshold: 0.95, vignette: 0.15 }),
};

/**
 * ชั้นอธิบายขั้นตอน (D34, แบบคลิปอ้างอิง 2): ระหว่างช็อตแอปจริง prop 3 มิติชิ้นเด่นโผล่ข้างโทรศัพท์เพื่อเล่าว่าขั้นนั้นทำอะไร
 * เรนเดอร์ทับฉากโทรศัพท์ด้วยกล้องคงที่ (ไม่ขยับตามการซูมของช็อต) — ป้ายข้อความเป็น DOM ใน FilmPlayer
 */
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import type { FilmContext } from './context';
import type { ExplainKind, Shot } from './cuts';
import type { GLKit } from './gl';
import { clamp, ease, lerp, prog } from './timeline';
import { CapacityTank, ChatBubble, MapPin, STATUS, ScanFrame, SupplyBox, clay, preloadKraft, heartCoin, iconDisc, noticeFace, photoCard, pushPin, readCheck } from './props/objects';
import { Beam, Sparks, atlasCanvasTex, dotSphere, featureCoin, glowSprite, glowTexture, iconCardTexture, makeCamera, project, setShock, shockRing, type CamRig } from './scenes/stage';

/** ตำแหน่งกลางของพื้นที่ prop (ขวาล่าง ใต้คำบรรยาย) */
export const ZONE = new THREE.Vector3(1.75, -0.95, 0);
/** ช็อตเบราว์เซอร์ (desktop): หน้าต่างเลื่อนไปซ้าย prop อยู่คอลัมน์ขวา */
export const ZONE_DESK = new THREE.Vector3(3.05, -0.3, 0);
const zoneOf = (desktop: boolean) => (desktop ? ZONE_DESK : ZONE);

/** 0..1 ช่วงที่หน้าต่าง desktop หลบไปซ้ายให้ prop (เข้าก่อน prop เล็กน้อย ออกหลัง prop) */
export function explainSide(shot: Shot, lt: number) {
  const e = shot.explain?.find((c) => lt >= c.from - 0.6 && lt <= c.to + 0.8);
  if (!e) return 0;
  return Math.min(ease.inOut(prog(lt, e.from - 0.6, e.from + 0.15)), 1 - ease.inOut(prog(lt, e.to, e.to + 0.7)));
}
export const EXPLAIN_RIG: CamRig = { pos: [0, 0, 10], look: [0, 0, 0], fov: 30 };

export function explainAt(shot: Shot, lt: number) {
  return shot.explain?.find((e) => lt >= e.from - 0.05 && lt <= e.to + 0.4);
}

/** 0..1 เข้า และ 0..1 ออก ของ cue */
export function explainPhase(e: { from: number; to: number }, lt: number) {
  return { pin: ease.backOut(prog(lt, e.from, e.from + 0.45)), pout: ease.in(prog(lt, e.to - 0.05, e.to + 0.35)), k: lt - e.from, dur: e.to - e.from };
}

/** แท่งเปรียบเทียบการจำลอง (run): ฐาน y และความสูงสูงสุด */
export const RUN = { base: -1.05, max: 2.0, x: 0.62, drop: [1.7, 2.5] as const };
export const runHeights = (k: number, before: number, after: number) => {
  const hb = RUN.max * ease.expoOut(prog(k, 0.15, 0.85));
  const up = RUN.max * ease.expoOut(prog(k, 0.45, 1.15));
  const ha = lerp(up, (RUN.max * after) / Math.max(1, before), ease.backOut(prog(k, RUN.drop[0], RUN.drop[1])));
  return { hb, ha };
};

export class ExplainLayer {
  scene = new THREE.Scene();
  camera = makeCamera();
  private groups = new Map<ExplainKind, THREE.Group>();
  private heart!: THREE.Group;
  private coins: THREE.Group[] = [];
  private scan!: ScanFrame;
  private photo!: THREE.Group;
  private notices: THREE.Group[] = [];
  private postCard!: THREE.Group;
  private board!: THREE.Mesh;
  private ring = shockRing('#ffd23f');
  private bubbleIn!: ChatBubble;
  private bubbleOut!: ChatBubble;
  private check!: THREE.Group;
  private box!: SupplyBox;
  private splitCoin!: THREE.Group;
  private pins: MapPin[] = [];
  private arc = new Beam('#ffd23f', 0.035, 1);
  private globe!: THREE.Points;
  private assistBubble!: ChatBubble;
  private assistCoins: THREE.Group[] = [];
  private sparks!: Sparks;
  private glow!: THREE.Sprite;
  private tank!: CapacityTank;
  private bars: THREE.Mesh[] = [];
  private calls = { before: 1, after: 1 };

  async init(kit: GLKit, ctx: FilmContext) {
    const { scene } = this;
    const pm = new THREE.PMREMGenerator(kit.renderer);
    const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js');
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.7;
    scene.environmentRotation.set(0.35, 0.9, 0);
    pm.dispose();
    scene.add(new THREE.HemisphereLight('#fff6e0', '#3a2a1c', 1.0));
    const key = new THREE.DirectionalLight('#ffffff', 1.4);
    key.position.set(-3, 4, 8);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#ffcf6b', 1.6);
    rim.position.set(5, 3, -4);
    scene.add(rim);
    const glowTex = await glowTexture(kit);
    this.glow = glowSprite(glowTex, '#ffc94a', 4.2, 0);
    this.glow.position.copy(ZONE).add(new THREE.Vector3(0, 0, -1));
    scene.add(this.glow);
    this.sparks = new Sparks(glowTex, 60, 'explain', ['#ffd23f', '#ffffff', '#f0707a']);
    scene.add(this.sparks.mesh);
    const mk = (k: ExplainKind) => {
      const g = new THREE.Group();
      g.visible = false;
      scene.add(g);
      this.groups.set(k, g);
      return g;
    };
    const street = kit.shared.get('street') as string | undefined;
    const streetImg = street ? await kit.image(street) : await kit.image('/mascot/cat-neutral.png');
    const photoTex = await kit.canvasTex(512, 512, (c) => {
      const k = Math.min(streetImg.width, streetImg.height);
      c.drawImage(streetImg, (streetImg.width - k) / 2, (streetImg.height - k) / 2, k, k, 0, 0, 512, 512);
    });

    // micro: หัวใจทอง + เหรียญหล่นรวมกัน
    const micro = mk('micro');
    this.heart = heartCoin(1.3);
    micro.add(this.heart);
    const coinTex = await iconCardTexture(kit, 'heart', { size: 128, accent: '#f0707a' });
    for (let i = 0; i < 7; i++) {
      const c = featureCoin(coinTex, 0.24);
      this.coins.push(c);
      micro.add(c);
    }

    // scan: การ์ดภาพ + กรอบสแกนเลเซอร์
    const scanG = mk('scan');
    this.photo = photoCard(photoTex, 1.7, 1.7);
    scanG.add(this.photo);
    this.scan = new ScanFrame(kit, 2.05, 2.05, await ScanFrame.laserTexture(kit));
    this.scan.group.position.z = 0.15;
    scanG.add(this.scan.group);

    // compare: การ์ดน้อง + ประกาศสัตว์หายเรียงเป็นพัด
    const cmp = mk('compare');
    const mini = photoCard(photoTex, 1.0, 1.0);
    mini.name = 'mini';
    cmp.add(mini);
    for (let i = 0; i < 5; i++) {
      const img = await kit.image(i % 2 ? '/images/cats/cats-02.png' : '/images/cats/cats-01.png');
      const face = await noticeFace(kit, null);
      const tex = await kit.canvasTex(600, 800, (c) => {
        c.drawImage(face.image as HTMLCanvasElement, 0, 0);
        const cols = 4;
        const idx = [2, 7, 11, 14, 5][i];
        const sw = img.width / cols;
        c.save();
        c.beginPath();
        c.roundRect(28, 136, 544, 440, 22);
        c.clip();
        c.drawImage(img, (idx % cols) * sw, Math.floor(idx / cols) * sw, sw, sw, 28, 108, 544, 544);
        c.restore();
      });
      const card = photoCard(tex, 0.75, 1.0);
      this.notices.push(card);
      cmp.add(card);
    }

    // post: ประกาศพบสัตว์บินมาปักบนบอร์ด
    const post = mk('post');
    const board = new THREE.Mesh(new THREE.CircleGeometry(1.25, 64), new THREE.MeshPhysicalMaterial({ color: '#d9b98c', roughness: 0.85, clearcoat: 0.2 }));
    board.position.z = -0.1;
    this.board = board;
    post.add(board);
    const nf = await noticeFace(kit, streetImg);
    this.postCard = photoCard(nf, 1.2, 1.6);
    const pin = pushPin('#c0392b');
    pin.position.set(0, 0.76, 0.05);
    this.postCard.add(pin);
    post.add(this.postCard);
    post.add(this.ring);

    // assist: ข้อความ → ประกายวิ่ง → เหรียญตัวกรอง
    const asg = mk('assist');
    this.assistBubble = new ChatBubble(1.7, 0.75, 'left');
    asg.add(this.assistBubble.group);
    for (const ic of ['paw', 'heart', 'home'] as const) {
      const t = await iconCardTexture(kit, ic, { size: 192 });
      const c = featureCoin(t, 0.36);
      this.assistCoins.push(c);
      asg.add(c);
    }

    // nearby: ที่ใกล้สุดเต็ม → ที่ว่างได้ดาว
    const nb = mk('nearby');
    const ground = new THREE.Mesh(new THREE.CircleGeometry(1.6, 64), new THREE.MeshPhysicalMaterial({ color: '#2a2f63', roughness: 0.6, clearcoat: 0.4, emissive: '#2c2c8a', emissiveIntensity: 0.2 }));
    ground.rotation.x = -Math.PI / 2;
    nb.add(ground);
    const face = await iconDisc(kit, 'home');
    for (const st of ['full', 'open'] as const) {
      const p = new MapPin(STATUS[st], face, 0.62);
      this.pins.push(p);
      nb.add(p.group);
    }
    this.tank = new CapacityTank(0.22, 0.9);
    nb.add(this.tank.group);
    nb.add(this.arc.mesh);

    // chat: ฟองข้อความ + อ่านแล้ว
    const ch = mk('chat');
    this.bubbleOut = new ChatBubble(1.6, 0.66, 'right');
    this.bubbleIn = new ChatBubble(1.7, 0.7, 'left');
    this.check = readCheck('#2e8b62', 0.32);
    ch.add(this.bubbleOut.group, this.bubbleIn.group, this.check);

    // handoff: หัวใจใหญ่ + ประกาย
    const ho = mk('handoff');
    const big = heartCoin(1.45);
    big.name = 'heart';
    ho.add(big);

    // donate: กล่องของใช้บินมาแล้วเปิด + เหรียญแบ่งส่วน
    const dn = mk('donate');
    const sticker = await iconDisc(kit, 'heart', '#fff3d1');
    await preloadKraft(kit);
    this.box = new SupplyBox(kit, 1.15, sticker);
    dn.add(this.box.group);
    const splitTex = await iconCardTexture(kit, 'split', { size: 192 });
    this.splitCoin = featureCoin(splitTex, 0.42);
    dn.add(this.splitCoin);

    // run: แท่งจำนวนครั้งที่ต้องโทร แบบเดิม → Smart Load Balancer (การจำลองเดียวกับ /insights)
    const rn = mk('run');
    this.calls = ctx.facts.calls;
    const barGeo = new RoundedBoxGeometry(0.6, 1, 0.6, 4, 0.1);
    barGeo.translate(0, 0.5, 0);
    for (const col of ['#b9ab9a', '#f4b400']) {
      const b = new THREE.Mesh(barGeo, clay(col, 0.35));
      this.bars.push(b);
      rn.add(b);
    }
    const plate = new THREE.Mesh(new RoundedBoxGeometry(2.5, 0.12, 1.1, 3, 0.05), clay('#3a2c22', 0.6));
    plate.position.y = RUN.base - 0.06;
    rn.add(plate);

    // globe: สองภาษา
    const gl = mk('globe');
    this.globe = dotSphere(glowTex, 700, 0.9, '#ffd23f', 0.07);
    gl.add(this.globe);
    void atlasCanvasTex;
    void ctx;
  }

  /** เรนเดอร์ทับฉากปัจจุบัน (ไม่ล้างสี) */
  render(shot: Shot, lt: number, kit: GLKit, desktop = false) {
    const zone = zoneOf(desktop);
    this.glow.position.copy(zone).add(new THREE.Vector3(0, 0, -1));
    const e = explainAt(shot, lt);
    this.groups.forEach((g) => (g.visible = false));
    this.glow.material.opacity = 0;
    this.sparks.mesh.visible = false;
    if (!e) return;
    const g = this.groups.get(e.kind);
    if (!g) return;
    const { pin, pout, k } = explainPhase(e, lt);
    const vis = pin * (1 - pout);
    if (vis <= 0.001) return;
    g.visible = true;
    const r = EXPLAIN_RIG;
    this.camera.position.set(...r.pos);
    this.camera.fov = r.fov;
    this.camera.updateProjectionMatrix();
    this.camera.lookAt(new THREE.Vector3(...r.look));
    g.position.copy(zone).add(new THREE.Vector3(0.6 * (1 - pin), -0.3 * (1 - pin) - 0.5 * pout, 0));
    g.scale.setScalar(Math.max(0.001, vis));
    g.rotation.set(0.08 * Math.sin(lt * 0.9), -0.25 + 0.12 * Math.sin(lt * 0.7), 0);
    this.glow.material.opacity = 0.5 * vis;
    const T = lt;
    switch (e.kind) {
      case 'micro': {
        this.heart.rotation.y = Math.sin(T * 1.6) * 0.5;
        this.heart.position.y = 0.2 + 0.06 * Math.sin(T * 2.4);
        this.coins.forEach((c, i) => {
          const a = 0.35 + i * 0.22;
          const f = prog(k, a, a + 0.5);
          c.visible = k > a && f < 1;
          // เหรียญลอยโค้งจากฝั่งโทรศัพท์ (ซ้ายล่าง) เข้าหัวใจ ไม่ผ่านคำบรรยายด้านบน
          const fx = ease.inOut(f);
          c.position.set(lerp(-2.3 + Math.sin(i * 2.3) * 0.2, Math.sin(i * 2.3) * 0.3, fx), lerp(-0.9, 0.15, fx) + Math.sin(fx * Math.PI) * 0.75, 0.3);
          c.rotation.set(T * 4 + i, T * 3, 0);
        });
        this.heart.scale.setScalar(1 + 0.06 * Math.sin(prog(k, 0.85, 3) * 40) * (1 - prog(k, 0.85, 3)));
        break;
      }
      case 'scan': {
        this.scan.set((k * 0.55) % 1, ease.backOut(prog(k, 0.25, 0.7)));
        this.photo.rotation.set(0.05 * Math.sin(T), 0.12 * Math.sin(T * 0.8), 0);
        break;
      }
      case 'compare': {
        const mini = g.getObjectByName('mini')!;
        mini.position.set(-1.15, 0.1, 0.3);
        this.notices.forEach((n, i) => {
          const a = 0.2 + i * 0.12;
          const f = ease.backOut(prog(k, a, a + 0.4));
          const ang = (i - 2) * 0.22;
          n.position.set(0.75 + Math.sin(ang) * 1.1, 0.1 + Math.cos(ang) * 0.2 - 0.2, -0.1 - Math.abs(i - 2) * 0.05);
          n.rotation.set(0, -0.2, -ang * 0.8);
          n.scale.setScalar(Math.max(0.001, f));
          const sweep = clamp(1 - Math.abs(k - (1.0 + i * 0.3)) / 0.18);
          n.position.y += 0.18 * sweep;
          const dim = prog(k, 2.6, 3.0);
          n.traverse((o) => {
            const m = (o as THREE.Mesh).material as THREE.MeshBasicMaterial | undefined;
            if (m && 'color' in m && (o as THREE.Mesh).geometry?.type === 'ShapeGeometry') m.color.setScalar(lerp(1, 0.55, dim));
          });
        });
        break;
      }
      case 'post': {
        const fly = ease.expoOut(prog(k, 0.0, 0.7));
        this.postCard.position.set(lerp(-2.6, 0, fly), lerp(0.4, 0, fly), lerp(1.6, 0.1, fly));
        this.postCard.rotation.set(0, lerp(1.2, 0, fly), lerp(-0.5, 0.04, fly));
        this.board.scale.setScalar(Math.max(0.001, ease.backOut(prog(k, 0, 0.4))));
        setShock(this.ring, k - 0.7, 2.2, 0.8);
        this.ring.position.z = 0.05;
        break;
      }
      case 'assist': {
        this.assistBubble.group.position.set(-1.0, 0.55, 0);
        this.assistBubble.set(T, k < 0.6);
        this.assistCoins.forEach((c, i) => {
          const a = 0.6 + i * 0.15;
          const f = ease.backBig(prog(k, a, a + 0.45));
          c.position.set(lerp(-1.0, 0.25 + i * 0.85, ease.out(prog(k, a, a + 0.5))), lerp(0.55, -0.55, ease.out(prog(k, a, a + 0.5))), 0.2);
          c.scale.setScalar(Math.max(0.001, f));
          c.rotation.y = 0.4 * Math.sin(T * 2 + i);
        });
        break;
      }
      case 'nearby': {
        g.rotation.x = 0.55;
        this.pins[0].group.position.set(-0.75, 0, 0.2);
        this.pins[1].group.position.set(0.85, 0, -0.3);
        this.pins[0].update(T, prog(k, 0.0, 0.5), this.camera);
        this.pins[1].update(T, prog(k, 0.6, 1.1), this.camera);
        this.tank.group.position.set(-0.2, 0, 0.35);
        this.tank.set(1.02, 'full', T, 1);
        this.arc.set(new THREE.Vector3(-0.75, 0.05, 0.2), new THREE.Vector3(0.85, 0.05, -0.3), 0.9, 0.035, 40);
        this.arc.progress(0, ease.inOut(prog(k, 0.7, 1.4)));
        break;
      }
      case 'chat': {
        this.bubbleOut.group.position.set(0.4, 0.55, 0);
        this.bubbleOut.set(T, false);
        this.bubbleOut.group.scale.setScalar(Math.max(0.001, ease.backOut(prog(k, 0, 0.4))));
        this.check.position.set(1.25, 0.12, 0.2);
        this.check.scale.setScalar(Math.max(0.001, ease.backBig(prog(k, 0.9, 1.3))));
        this.bubbleIn.group.position.set(-0.45, -0.55, 0);
        this.bubbleIn.set(T, k < 2.6);
        this.bubbleIn.group.scale.setScalar(Math.max(0.001, ease.backOut(prog(k, 1.5, 1.9))));
        break;
      }
      case 'handoff': {
        const h = g.getObjectByName('heart')!;
        h.position.x = -0.35;
        h.rotation.y = T * 1.5;
        h.scale.setScalar(1 + 0.12 * Math.sin(prog(k, 0, 1.2) * Math.PI * 4) * (1 - prog(k, 0, 1.2)));
        this.sparks.mesh.visible = true;
        this.sparks.burst(zone.clone().add(new THREE.Vector3(-0.35, 0, 0.5)), k - 0.15, this.camera, 1.6);
        break;
      }
      case 'donate': {
        const fly = ease.expoOut(prog(k, 0, 0.6));
        this.box.group.position.set(lerp(-2.4, 0, fly), lerp(1.6, -0.55, fly), 0);
        this.box.group.rotation.set(0.3, lerp(-1.5, -0.45, fly), 0);
        this.box.setOpen(prog(k, 0.9, 1.6));
        const pop = ease.backBig(prog(k, 1.4, 1.9));
        // เหรียญแบ่งส่วนเด้งออกจากกล่องไปทางซ้าย (ไม่ขึ้นไปทับคำบรรยาย)
        const up = ease.out(prog(k, 1.4, 1.9));
        this.splitCoin.position.set(lerp(0, -1.15, up), lerp(-0.2, 0.35, up) + 0.25 * Math.sin(up * Math.PI), 0.35);
        this.splitCoin.scale.setScalar(Math.max(0.001, pop));
        this.splitCoin.rotation.y = 0.5 * Math.sin(T * 2);
        break;
      }
      case 'run': {
        g.rotation.set(0.12, -0.18 + 0.05 * Math.sin(T * 0.7), 0);
        const { hb, ha } = runHeights(k, this.calls.before, this.calls.after);
        this.bars.forEach((b, i) => {
          b.position.set(i ? RUN.x : -RUN.x, RUN.base, 0);
          b.scale.set(1, Math.max(0.001, i ? ha : hb), 1);
        });
        this.sparks.mesh.visible = true;
        this.sparks.burst(zone.clone().add(new THREE.Vector3(RUN.x, RUN.base + 0.9, 0.5)), k - RUN.drop[1] + 0.3, this.camera, 1.1);
        break;
      }
      case 'globe': {
        this.globe.rotation.y = T * 0.8;
        this.globe.rotation.x = 0.3;
        break;
      }
    }
    if (e.kind !== 'handoff' && e.kind !== 'run') this.sparks.mesh.visible = false;
    const r0 = kit.renderer;
    const ac = r0.autoClear;
    r0.autoClear = false;
    r0.clearDepth();
    r0.render(this.scene, this.camera);
    r0.autoClear = ac;
  }
}

/** ตำแหน่งบนจอของจุดในพื้นที่ prop (ใช้วางป้าย DOM) */
export function zonePx(dx: number, dy: number, desktop = false) {
  const z = zoneOf(desktop);
  return project(EXPLAIN_RIG, [z.x + dx, z.y + dy, 0]);
}

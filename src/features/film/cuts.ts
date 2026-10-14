/**
 * โครงวิดีโอเดโม (DEMO_VIDEO.md ฉบับ D33) — ทุกช็อตเริ่มตรงต้นห้องเพลง 90 BPM
 * demo = 2:50.7 (64 ห้อง) · demo-short = 2:02.7 (46 ห้อง) · ภาพใช้งานจริงประมาณ 60%
 */
import type { FilmMessages } from '@/i18n/film-th';
import type { Anchor } from './capture';
import { BAR } from './timeline';

export type SceneId = 'showcase' | 'cold' | 'swarm' | 'logo' | 'problems' | 'connect' | 'balancer' | 'package' | 'waiting' | 'adopt' | 'home' | 'impact' | 'team' | 'closing';
export type Ipo = 'input' | 'process' | 'output';
export type Transition = 'cut' | 'paw' | 'fade' | 'flyIn' | 'mapIn' | 'boxIn' | 'windows';
export type ChapterKey = 'cold' | 'swarm' | 'logo' | 'problems' | 'connect' | 'critical' | 'start' | 'scan' | 'post' | 'balancer' | 'assist' | 'nearby' | 'chat' | 'package' | 'donate' | 'dashboard' | 'insights' | 'i18n' | 'waiting' | 'adopt' | 'home' | 'impact' | 'team';

/** key ของคำบรรยายใน film-*.ts → shots.<key> (บางช็อตเลือก key ตามข้อเท็จจริงตอนอัด เช่น AI หรือกฎคำสำคัญ) */
export type CaptionKey =
  | 'critical' | 'demo' | 'login' | 'micro' | 'scanInput' | 'scanProcess' | 'scanResult' | 'post' | 'balancer'
  | 'assist' | 'nearbyFull' | 'nearbyWhy' | 'chat' | 'handoff' | 'package' | 'donate' | 'split' | 'dashboard' | 'profile'
  | 'insights' | 'i18n' | 'waiting1' | 'waiting2' | 'adopt' | 'home1' | 'home2';

export interface CaptionCue { at: number; to: number; key: CaptionKey }
export interface ZoomCue { from: number; to: number; cue: string; scale: number }
export interface CardCue { from: number; to: number; key: CaptionKey; cue: string }
export interface SoundCaption { at: number; to: number; key: 'shutter' | 'music' | 'purr' | 'rain' | 'meow' }
export type VoKey = keyof FilmMessages['vo'];
export interface VoCue { at: number; key: VoKey }

export type ExplainKind = 'micro' | 'scan' | 'compare' | 'post' | 'assist' | 'nearby' | 'chat' | 'handoff' | 'donate' | 'globe' | 'run';
/** prop อธิบายขั้นตอนที่โผล่ข้างโทรศัพท์ (เวลาภายในช็อต) */
export interface ExplainCue { from: number; to: number; kind: ExplainKind }

export interface ShotDef {
  id: string;
  bars: number;
  chapter: ChapterKey;
  scene?: SceneId;
  capture?: string;
  anchors?: Anchor[];
  captions?: CaptionCue[];
  ipo?: [number, Ipo][];
  zooms?: ZoomCue[];
  cards?: CardCue[];
  sounds?: SoundCaption[];
  transitionIn?: Transition;
  /** บทพากย์ (เวลาภายในช็อต) */
  vo?: VoCue[];
  explain?: ExplainCue[];
  /** ตัวแปรของฉาก (เช่น ช็อตปัญหาแบบรวมการ์ดเดียวในเวอร์ชันสั้น) */
  variant?: string;
}

export interface Shot extends ShotDef { start: number; dur: number; index: number }
export interface Cut { id: string; shots: Shot[]; duration: number }

const DEMO: ShotDef[] = [
  { id: 'S01', bars: 5, chapter: 'cold', scene: 'cold', sounds: [{ at: 10.3, to: 11.6, key: 'shutter' }] },
  { id: 'S02', bars: 2, vo: [{ at: 0.6, key: 'swarm' }], chapter: 'swarm', scene: 'swarm', sounds: [{ at: 0, to: 1.6, key: 'music' }] },
  { id: 'S03', bars: 2, vo: [{ at: 0.05, key: 'problems' }], chapter: 'problems', scene: 'problems' },
  { id: 'S04', bars: 2, vo: [{ at: 2.2, key: 'logo' }], chapter: 'logo', scene: 'logo' },
  { id: 'S05', bars: 2, vo: [{ at: 0.35, key: 'connect' }], chapter: 'connect', scene: 'connect' },
  {
    id: 'S06', bars: 2, vo: [{ at: 0.6, key: 'critical' }], chapter: 'critical', capture: 'C0', transitionIn: 'paw',
    anchors: [{ at: 0, mark: 'start' }, { at: 0.5, mark: 'notice' }, { at: 4.1, mark: 'close' }, { at: 5.333, mark: 'end' }],
    captions: [{ at: 0.4, to: 5.2, key: 'critical' }], ipo: [[0, 'output']], zooms: [{ from: 1.2, to: 3.6, cue: 'case', scale: 1.3 }],
  },
  {
    id: 'S07', bars: 4, vo: [{ at: 0.4, key: 'demo' }, { at: 5.0, key: 'micro' }], explain: [{ from: 5.2, to: 10.3, kind: 'micro' }], chapter: 'start', capture: 'C1',
    anchors: [{ at: 0, mark: 'start' }, { at: 0.5, mark: 'run-focus' }, { at: 2.4, mark: 'start-run' }, { at: 3.4, mark: 'dashboard' }, { at: 5.2, mark: 'micro-ack' }, { at: 6.0, mark: 'micro-50' }, { at: 8.0, mark: 'micro-done-50' }, { at: 8.4, mark: 'micro-100' }, { at: 10.1, mark: 'micro-done-100' }, { at: 10.667, mark: 'end' }],
    captions: [{ at: 0.2, to: 5.0, key: 'demo' }, { at: 5.2, to: 10.5, key: 'micro' }],
    ipo: [[0, 'input'], [3.4, 'output'], [5.2, 'input'], [8.0, 'output']],
  },
  {
    id: 'S08', bars: 4, vo: [{ at: 0.8, key: 'scanInput' }], explain: [{ from: 2.6, to: 10.3, kind: 'scan' }], chapter: 'scan', capture: 'C2', transitionIn: 'flyIn',
    anchors: [{ at: 0, mark: 'start' }, { at: 1.4, mark: 'choose-photo' }, { at: 2.4, mark: 'photo' }, { at: 4.2, mark: 'markings-focus' }, { at: 7.6, mark: 'collar-no' }, { at: 9.7, mark: 'case-nomatch' }, { at: 10.667, mark: 'scan' }],
    captions: [{ at: 0.6, to: 10.5, key: 'scanInput' }], ipo: [[0, 'input']],
    zooms: [{ from: 4.4, to: 7.4, cue: 'markings', scale: 1.35 }],
  },
  {
    id: 'S09', bars: 2, vo: [{ at: 0.3, key: 'scanResult' }], explain: [{ from: 0.2, to: 5.1, kind: 'compare' }], chapter: 'scan', capture: 'C2',
    anchors: [{ at: 0, mark: 'scan' }, { at: 2.9, mark: 'result' }, { at: 5.333, mark: 'post', offset: -0.1 }],
    captions: [{ at: 0.1, to: 2.8, key: 'scanProcess' }, { at: 2.9, to: 5.25, key: 'scanResult' }],
    ipo: [[0, 'process'], [2.9, 'output']], zooms: [{ from: 3.1, to: 5.2, cue: 'notfound', scale: 1.3 }],
  },
  {
    id: 'S10', bars: 2, vo: [{ at: 0.3, key: 'post' }], explain: [{ from: 2.0, to: 5.1, kind: 'post' }], chapter: 'post', capture: 'C2',
    anchors: [{ at: 0, mark: 'post', offset: -0.1 }, { at: 0.9, mark: 'form' }, { at: 1.4, mark: 'name-focus' }, { at: 3.3, mark: 'preview' }, { at: 4.1, mark: 'submit' }, { at: 4.6, mark: 'done' }, { at: 5.333, mark: 'done', offset: 0.73 }],
    captions: [{ at: 0.1, to: 5.25, key: 'post' }], ipo: [[0, 'input'], [4.6, 'output']],
  },
  { id: 'S11', bars: 2, vo: [{ at: 0.25, key: 'balancer' }], chapter: 'balancer', scene: 'balancer', captions: [{ at: 0.1, to: 5.2, key: 'balancer' }] },
  {
    id: 'S12', bars: 3, vo: [{ at: 0.4, key: 'assist' }], explain: [{ from: 4.9, to: 7.8, kind: 'assist' }], chapter: 'assist', capture: 'C3', transitionIn: 'mapIn',
    anchors: [{ at: 0, mark: 'start' }, { at: 0.5, mark: 'assist-focus' }, { at: 4.9, mark: 'assist-submit' }, { at: 5.7, mark: 'chips' }, { at: 8.0, mark: 'apply' }],
    captions: [{ at: 0.3, to: 7.9, key: 'assist' }], ipo: [[0, 'input'], [4.9, 'process'], [5.7, 'output']],
    zooms: [{ from: 5.8, to: 7.9, cue: 'chips-box', scale: 1.25 }],
  },
  {
    id: 'S13', bars: 5, vo: [{ at: 1.0, key: 'nearby' }], explain: [{ from: 3.9, to: 6.5, kind: 'nearby' }], chapter: 'nearby', capture: 'C3',
    anchors: [{ at: 0, mark: 'apply' }, { at: 2.0, mark: 'results' }, { at: 3.2, mark: 'full-pin' }, { at: 3.9, mark: 'popup' }, { at: 6.7, mark: 'why' }, { at: 7.3, mark: 'why-open' }, { at: 12.2, mark: 'chat' }, { at: 13.333, mark: 'chat-open' }],
    captions: [{ at: 0.2, to: 6.6, key: 'nearbyFull' }, { at: 6.8, to: 13.2, key: 'nearbyWhy' }],
    ipo: [[0, 'process'], [3.9, 'output'], [6.7, 'process'], [12.2, 'output']],
    zooms: [{ from: 4.2, to: 6.6, cue: 'rec-1', scale: 1.3 }], cards: [{ from: 7.6, to: 12.0, key: 'nearbyWhy', cue: 'why-panel' }],
  },
  {
    id: 'S14', bars: 6, vo: [{ at: 0.6, key: 'chat' }], explain: [{ from: 0.9, to: 10.8, kind: 'chat' }, { from: 13.9, to: 15.8, kind: 'handoff' }], chapter: 'chat', capture: 'C5',
    anchors: [{ at: 0, mark: 'start' }, { at: 0.9, mark: 'quick' }, { at: 2.0, mark: 'read' }, { at: 4.2, mark: 'reply-1' }, { at: 5.0, mark: 'chat-type-focus' }, { at: 8.2, mark: 'chat-send' }, { at: 10.0, mark: 'reply-2' }, { at: 11.1, mark: 'handoff' }, { at: 11.9, mark: 'sheet' }, { at: 13.4, mark: 'handoff-confirm' }, { at: 13.9, mark: 'celebrate' }, { at: 16.0, mark: 'end' }],
    captions: [{ at: 0.2, to: 11.0, key: 'chat' }, { at: 13.9, to: 15.9, key: 'handoff' }],
    ipo: [[0, 'input'], [0.9, 'process'], [4.2, 'output'], [11.1, 'input'], [13.9, 'output']],
    zooms: [{ from: 2.0, to: 4.0, cue: 'read-status', scale: 1.35 }],
  },
  { id: 'S15', bars: 1, vo: [{ at: 0.3, key: 'package' }], chapter: 'package', scene: 'package', captions: [{ at: 0.1, to: 2.6, key: 'package' }] },
  {
    id: 'S16', bars: 5, vo: [{ at: 0.6, key: 'donate' }], explain: [{ from: 7.4, to: 13.0, kind: 'donate' }], chapter: 'donate', capture: 'C6', transitionIn: 'boxIn',
    anchors: [{ at: 0, mark: 'start' }, { at: 1.4, mark: 'target-1' }, { at: 2.6, mark: 'pick-target' }, { at: 3.4, mark: 'package' }, { at: 4.0, mark: 'next' }, { at: 5.0, mark: 'ack' }, { at: 5.5, mark: 'confirm' }, { at: 6.5, mark: 'qr' }, { at: 7.4, mark: 'paid' }, { at: 8.0, mark: 'order' }, { at: 8.8, mark: 'split' }, { at: 9.9, mark: 'transfer' }, { at: 11.0, mark: 'fast' }, { at: 12.2, mark: 'arrived' }, { at: 13.333, mark: 'end' }],
    captions: [{ at: 0.3, to: 7.9, key: 'donate' }, { at: 8.0, to: 13.2, key: 'split' }],
    ipo: [[0, 'input'], [7.4, 'process'], [12.2, 'output']],
    zooms: [{ from: 8.9, to: 10.8, cue: 'money-flow', scale: 1.2 }],
  },
  {
    id: 'S17', bars: 2, vo: [{ at: 0.3, key: 'dashboard' }], chapter: 'dashboard', capture: 'C7',
    anchors: [{ at: 0, mark: 'start' }, { at: 2.6, mark: 'profile', offset: -0.2 }, { at: 2.8, mark: 'profile' }, { at: 5.333, mark: 'end' }],
    captions: [{ at: 0.1, to: 2.6, key: 'dashboard' }, { at: 2.8, to: 5.25, key: 'profile' }], ipo: [[0, 'output']],
  },
  {
    id: 'S18', bars: 2, vo: [{ at: 0.3, key: 'insights' }], explain: [{ from: 0.7, to: 5.0, kind: 'run' }], chapter: 'insights', capture: 'C8',
    anchors: [{ at: 0, mark: 'start' }, { at: 0.9, mark: 'run' }, { at: 1.7, mark: 'kpis' }, { at: 5.333, mark: 'end' }],
    captions: [{ at: 0.2, to: 5.25, key: 'insights' }], ipo: [[0, 'input'], [0.9, 'process'], [1.7, 'output']],
  },
  {
    id: 'S19', bars: 1, vo: [{ at: 0.2, key: 'i18n' }], explain: [{ from: 0.3, to: 2.55, kind: 'globe' }], chapter: 'i18n', capture: 'C9',
    anchors: [{ at: 0, mark: 'menu', offset: -0.3 }, { at: 0.6, mark: 'lang' }, { at: 1.1, mark: 'switched' }, { at: 2.667, mark: 'end' }],
    captions: [{ at: 0.1, to: 2.6, key: 'i18n' }], ipo: [[0, 'output']],
  },
  { id: 'S20', bars: 1, vo: [{ at: 0.2, key: 'waiting' }], chapter: 'waiting', scene: 'waiting', transitionIn: 'paw', captions: [{ at: 0.1, to: 1.3, key: 'waiting1' }, { at: 1.35, to: 2.6, key: 'waiting2' }] },
  { id: 'S21', bars: 1, vo: [{ at: 0.4, key: 'adopt' }], chapter: 'adopt', scene: 'adopt', captions: [{ at: 0.1, to: 2.6, key: 'adopt' }] },
  { id: 'S22', bars: 4, vo: [{ at: 7.8, key: 'home' }], chapter: 'home', scene: 'home', captions: [{ at: 3.0, to: 7.6, key: 'home1' }, { at: 8.1, to: 10.6, key: 'home2' }], sounds: [{ at: 0, to: 3.0, key: 'rain' }, { at: 3.0, to: 7.4, key: 'purr' }, { at: 7.5, to: 8.4, key: 'meow' }] },
  { id: 'S23', bars: 2, vo: [{ at: 0.3, key: 'impact' }], chapter: 'impact', scene: 'impact', transitionIn: 'windows' },
  { id: 'S24', bars: 2, vo: [{ at: 1.0, key: 'team' }], chapter: 'team', scene: 'team', variant: 'withClosing' },
];

const SHORT: ShotDef[] = [
  { id: 'S01', bars: 5, chapter: 'cold', scene: 'cold', sounds: [{ at: 10.3, to: 11.6, key: 'shutter' }] },
  { id: 'S02', bars: 1, vo: [{ at: 0.1, key: 'problemsShort' }], chapter: 'problems', scene: 'problems', variant: 'single', sounds: [{ at: 0, to: 1.6, key: 'music' }] },
  { id: 'S03', bars: 2, vo: [{ at: 2.2, key: 'logo' }], chapter: 'logo', scene: 'logo' },
  { id: 'S04', bars: 1, chapter: 'connect', scene: 'connect', variant: 'short' },
  {
    id: 'S05', bars: 1, vo: [{ at: 0.2, key: 'critical' }], chapter: 'critical', capture: 'C0', transitionIn: 'paw',
    anchors: [{ at: 0, mark: 'notice', offset: -0.2 }, { at: 1.7, mark: 'close' }, { at: 2.667, mark: 'home', offset: 0.6 }],
    captions: [{ at: 0.2, to: 2.6, key: 'critical' }], ipo: [[0, 'output']],
  },
  {
    id: 'S06', bars: 1, vo: [{ at: 0.2, key: 'demo' }], chapter: 'start', capture: 'C1',
    anchors: [{ at: 0, mark: 'run-focus' }, { at: 1.3, mark: 'start-run' }, { at: 1.8, mark: 'dashboard' }, { at: 2.667, mark: 'dashboard', offset: 0.9 }],
    captions: [{ at: 0.1, to: 2.6, key: 'demo' }], ipo: [[0, 'input'], [1.8, 'output']],
  },
  {
    id: 'S07', bars: 3, vo: [{ at: 0.5, key: 'scanInput' }], chapter: 'scan', capture: 'C2', transitionIn: 'flyIn',
    anchors: [{ at: 0, mark: 'choose-photo' }, { at: 0.8, mark: 'photo' }, { at: 2.0, mark: 'markings-focus' }, { at: 4.4, mark: 'collar-no' }, { at: 7.0, mark: 'case-nomatch' }, { at: 8.0, mark: 'scan' }],
    captions: [{ at: 0.4, to: 7.9, key: 'scanInput' }], ipo: [[0, 'input']],
  },
  {
    id: 'S08', bars: 2, vo: [{ at: 0.3, key: 'scanResult' }], chapter: 'scan', capture: 'C2',
    anchors: [{ at: 0, mark: 'scan' }, { at: 2.6, mark: 'result' }, { at: 5.333, mark: 'post', offset: -0.1 }],
    captions: [{ at: 0.1, to: 2.5, key: 'scanProcess' }, { at: 2.6, to: 5.25, key: 'scanResult' }], ipo: [[0, 'process'], [2.6, 'output']],
  },
  {
    id: 'S09', bars: 2, vo: [{ at: 0.3, key: 'post' }], chapter: 'post', capture: 'C2',
    anchors: [{ at: 0, mark: 'post', offset: -0.1 }, { at: 0.8, mark: 'form' }, { at: 1.2, mark: 'name-focus' }, { at: 3.1, mark: 'preview' }, { at: 3.9, mark: 'submit' }, { at: 4.4, mark: 'done' }, { at: 5.333, mark: 'done', offset: 0.93 }],
    captions: [{ at: 0.1, to: 5.25, key: 'post' }], ipo: [[0, 'input'], [4.4, 'output']],
  },
  {
    id: 'S10', bars: 2, vo: [{ at: 0.2, key: 'assist' }], chapter: 'assist', capture: 'C3',
    anchors: [{ at: 0, mark: 'assist-focus' }, { at: 3.6, mark: 'assist-submit' }, { at: 4.2, mark: 'chips' }, { at: 5.333, mark: 'apply' }],
    captions: [{ at: 0.2, to: 5.25, key: 'assist' }], ipo: [[0, 'input'], [3.6, 'process'], [4.2, 'output']],
  },
  {
    id: 'S11', bars: 5, vo: [{ at: 1.0, key: 'nearby' }], chapter: 'nearby', capture: 'C3',
    anchors: [{ at: 0, mark: 'apply' }, { at: 2.0, mark: 'results' }, { at: 3.2, mark: 'full-pin' }, { at: 3.9, mark: 'popup' }, { at: 6.7, mark: 'why' }, { at: 7.3, mark: 'why-open' }, { at: 12.2, mark: 'chat' }, { at: 13.333, mark: 'chat-open' }],
    captions: [{ at: 0.2, to: 6.6, key: 'nearbyFull' }, { at: 6.8, to: 13.2, key: 'nearbyWhy' }],
    ipo: [[0, 'process'], [3.9, 'output'], [6.7, 'process'], [12.2, 'output']],
    zooms: [{ from: 4.2, to: 6.6, cue: 'rec-1', scale: 1.3 }],
  },
  {
    id: 'S12', bars: 5, vo: [{ at: 0.4, key: 'chat' }], chapter: 'chat', capture: 'C5',
    anchors: [{ at: 0, mark: 'quick', offset: -0.4 }, { at: 1.0, mark: 'read' }, { at: 3.2, mark: 'reply-1' }, { at: 5.6, mark: 'reply-2', offset: -0.2 }, { at: 6.0, mark: 'reply-2' }, { at: 7.0, mark: 'handoff' }, { at: 7.8, mark: 'sheet' }, { at: 9.4, mark: 'handoff-confirm' }, { at: 9.9, mark: 'celebrate' }, { at: 13.333, mark: 'end' }],
    captions: [{ at: 0.2, to: 7.0, key: 'chat' }, { at: 9.9, to: 13.2, key: 'handoff' }],
    ipo: [[0, 'process'], [3.2, 'output'], [7.0, 'input'], [9.9, 'output']],
  },
  {
    id: 'S13', bars: 4, vo: [{ at: 0.3, key: 'donate' }], chapter: 'donate', capture: 'C6',
    anchors: [{ at: 0, mark: 'target-1' }, { at: 1.0, mark: 'pick-target' }, { at: 1.8, mark: 'package' }, { at: 2.4, mark: 'next' }, { at: 3.4, mark: 'confirm' }, { at: 4.4, mark: 'paid' }, { at: 5.0, mark: 'order' }, { at: 5.8, mark: 'split' }, { at: 7.0, mark: 'transfer' }, { at: 8.2, mark: 'fast' }, { at: 9.4, mark: 'arrived' }, { at: 10.667, mark: 'end' }],
    captions: [{ at: 0.2, to: 4.9, key: 'donate' }, { at: 5.0, to: 10.5, key: 'split' }],
    ipo: [[0, 'input'], [4.4, 'process'], [9.4, 'output']],
  },
  {
    id: 'S14', bars: 1, vo: [{ at: 0.2, key: 'dashboard' }], chapter: 'dashboard', capture: 'C7',
    anchors: [{ at: 0, mark: 'start', offset: 1.4 }, { at: 2.667, mark: 'profile', offset: -0.2 }],
    captions: [{ at: 0.1, to: 2.6, key: 'dashboard' }], ipo: [[0, 'output']],
  },
  {
    id: 'S15', bars: 1, vo: [{ at: 0.2, key: 'insights' }], chapter: 'insights', capture: 'C8',
    anchors: [{ at: 0, mark: 'run', offset: -0.3 }, { at: 0.6, mark: 'kpis' }, { at: 2.667, mark: 'kpis', offset: 2.0 }],
    captions: [{ at: 0.1, to: 2.6, key: 'insights' }], ipo: [[0, 'process'], [0.6, 'output']],
  },
  {
    id: 'S16', bars: 1, vo: [{ at: 0.2, key: 'i18n' }], chapter: 'i18n', capture: 'C9',
    anchors: [{ at: 0, mark: 'menu', offset: -0.3 }, { at: 0.6, mark: 'lang' }, { at: 1.1, mark: 'switched' }, { at: 2.667, mark: 'end' }],
    captions: [{ at: 0.1, to: 2.6, key: 'i18n' }], ipo: [[0, 'output']],
  },
  { id: 'S17', bars: 1, vo: [{ at: 0.4, key: 'waiting' }], chapter: 'adopt', scene: 'adopt', transitionIn: 'paw', captions: [{ at: 0.1, to: 2.6, key: 'adopt' }] },
  { id: 'S18', bars: 4, vo: [{ at: 7.8, key: 'home' }], chapter: 'home', scene: 'home', captions: [{ at: 3.0, to: 7.6, key: 'home1' }, { at: 8.1, to: 10.6, key: 'home2' }], sounds: [{ at: 0, to: 3.0, key: 'rain' }, { at: 3.0, to: 7.4, key: 'purr' }, { at: 7.5, to: 8.4, key: 'meow' }] },
  { id: 'S19', bars: 1, vo: [{ at: 0.2, key: 'impact' }], chapter: 'impact', scene: 'impact', transitionIn: 'windows', variant: 'short' },
  { id: 'S20', bars: 2, vo: [{ at: 1.0, key: 'team' }], chapter: 'team', scene: 'team', variant: 'withClosing' },
];

function build(id: string, defs: ShotDef[]): Cut {
  let start = 0;
  const shots = defs.map((d, index) => {
    const dur = d.bars * BAR;
    const s: Shot = { ...d, start, dur, index };
    start += dur;
    return s;
  });
  return { id, shots, duration: start };
}

/** แผ่นรวม prop สำหรับตรวจงาน (ไม่ใช่วิดีโอส่ง) */
const PROPS: ShotDef[] = [{ id: 'P01', bars: 3, chapter: 'logo', scene: 'showcase' }];

export const CUTS: Record<string, Cut> = {
  demo: build('demo', DEMO),
  'demo-short': build('demo-short', SHORT),
  props: build('props', PROPS),
};

export function getCut(id: string | null | undefined): Cut {
  return CUTS[id ?? 'demo'] ?? CUTS.demo;
}

export function shotAt(cut: Cut, t: number): Shot {
  for (const s of cut.shots) if (t < s.start + s.dur) return s;
  return cut.shots[cut.shots.length - 1];
}

/** ช็อตที่ใช้ capture ใดบ้าง */
export function capturesOf(cut: Cut): string[] {
  return [...new Set(cut.shots.map((s) => s.capture).filter(Boolean) as string[])];
}

export function scenesOf(cut: Cut): SceneId[] {
  return [...new Set(cut.shots.map((s) => s.scene).filter(Boolean) as SceneId[])];
}

/** สัดส่วนภาพใช้งานจริง */
export function realUsageRatio(cut: Cut): number {
  const real = cut.shots.filter((s) => s.capture).reduce((n, s) => n + s.dur, 0);
  return real / cut.duration;
}

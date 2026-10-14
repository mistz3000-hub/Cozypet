import type { SceneId } from '../cuts';
import type { SceneModule } from './types';
import { cold } from './cold';
import { showcase } from './showcase';
import { logo } from './logo';
import { problems } from './problems';
import { swarm } from './swarm';
import { connect } from './connect';
import { balancer } from './balancer';
import { pkg } from './package';
import { waiting } from './waiting';
import { adopt } from './adopt';
import { home } from './home';
import { impact } from './impact';
import { team } from './team';

/** ทะเบียนฉาก (เติมทีละฉาก) */
export const SCENES: Record<SceneId, SceneModule> = {
  showcase,
  cold,
  swarm,
  logo,
  problems,
  connect,
  balancer,
  package: pkg,
  waiting,
  adopt,
  home,
  impact,
  team,
  closing: {},
};

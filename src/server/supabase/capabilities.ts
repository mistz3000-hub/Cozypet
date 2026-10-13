import 'server-only';
import { supabaseEnv } from './config';
/** Public provider metadata; the key never leaves the server. */
export async function googleEnabled():Promise<boolean> {
  const env=supabaseEnv();if(!env)return false;
  try { const r=await fetch(`${env.url}/auth/v1/settings`,{headers:{apikey:env.key},next:{revalidate:30},signal:AbortSignal.timeout(3000)});if(!r.ok)return false;const d=await r.json();return d.external?.google===true; }catch{return false;}
}

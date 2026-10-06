import 'server-only';
import { NextResponse } from 'next/server';
import { clientKey, takeToken } from '@/server/ai/rate-limit';

export type AuthErrorCode = 'invalid' | 'rate' | 'unavailable' | 'disabled' | 'bad_input' | 'weak' | 'unauthorized';

export function authError(code: AuthErrorCode, status = 400) {
  return NextResponse.json({ ok: false, error: code }, { status });
}

/** จำกัด 5 ครั้ง/นาทีต่อ IP สำหรับเข้าสู่ระบบ/สมัคร */
export function authRateOk(req: Request): boolean {
  return takeToken('auth', clientKey(req.headers)).ok;
}

/** แปลง error ของ Supabase เป็นรหัสกลาง (ไม่บอกว่าอีเมลมีอยู่หรือไม่ · ไม่ log ข้อมูลผู้ใช้) */
export function mapAuthError(e: { status?: number; code?: string; message?: string } | null | undefined): AuthErrorCode {
  if (!e) return 'unavailable';
  if (e.status === 429 || e.code === 'over_request_rate_limit' || e.code === 'over_email_send_rate_limit') return 'rate';
  if (e.code === 'weak_password') return 'weak';
  if (e.status === 400 || e.status === 422 || e.code === 'invalid_credentials' || e.code === 'user_already_exists' || e.code === 'email_exists') return 'invalid';
  return 'unavailable';
}

export async function readJson<T>(req: Request): Promise<T | null> {
  try {
    return (await req.json()) as T;
  } catch {
    return null;
  }
}

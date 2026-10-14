import { beforeEach, describe, expect, it, vi } from 'vitest';
import { GET as startGoogle } from '@/app/api/auth/google/route';
import { GET as finishOAuth } from '@/app/auth/callback/route';
import { PUBLIC_SITE_URL } from '@/lib/public-site';
import { getSupabase } from '@/server/supabase/server';
import { authRateOk } from '@/server/supabase/route';

vi.mock('@/server/supabase/server', () => ({ getSupabase: vi.fn() }));
vi.mock('@/server/supabase/route', () => ({ authRateOk: vi.fn(() => true) }));

const start = vi.fn();
const exchange = vi.fn();
const destination = (response: Response) => new URL(response.headers.get('location')!);

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(authRateOk).mockReturnValue(true);
  vi.mocked(getSupabase).mockResolvedValue({ auth: { signInWithOAuth: start, exchangeCodeForSession: exchange } } as unknown as NonNullable<Awaited<ReturnType<typeof getSupabase>>>);
  start.mockResolvedValue({ data: { url: 'https://auth.example/authorize' }, error: null });
  exchange.mockResolvedValue({ error: null });
});

describe('public OAuth routing', () => {
  it.each(['http://localhost:3000', 'http://127.0.0.1:3000', 'http://[::1]:3000', 'https://preview.vercel.app'])('starts PKCE on the public site when requested at %s', async (origin) => {
    const response = await startGoogle(new Request(`${origin}/api/auth/google?next=%2Fprofile`));
    const target = destination(response);
    expect(target.origin).toBe(PUBLIC_SITE_URL);
    expect(target.pathname).toBe('/api/auth/google');
    expect(target.searchParams.get('next')).toBe('/profile');
    expect(getSupabase).not.toHaveBeenCalled();
  });

  it('requests the public callback and rejects a hidden external next URL', async () => {
    await startGoogle(new Request(`${PUBLIC_SITE_URL}/api/auth/google?next=${encodeURIComponent('/\n/localhost:3000')}`));
    const options = start.mock.calls[0][0].options;
    const target = new URL(options.redirectTo);
    expect(target.origin).toBe(PUBLIC_SITE_URL);
    expect(target.pathname).toBe('/auth/callback');
    expect(target.searchParams.get('next')).toBe('/');
  });

  it.each(['disabled', 'rate', 'provider'])('keeps start failures on the public login page: %s', async (reason) => {
    if (reason === 'disabled') vi.mocked(getSupabase).mockResolvedValue(null);
    if (reason === 'rate') vi.mocked(authRateOk).mockReturnValue(false);
    if (reason === 'provider') start.mockResolvedValue({ data: { url: null }, error: {} });
    const target = destination(await startGoogle(new Request(`${PUBLIC_SITE_URL}/api/auth/google`)));
    expect(target.origin).toBe(PUBLIC_SITE_URL);
    expect(target.pathname).toBe('/login');
  });

  it('forwards a callback from another origin before exchanging the one-time code', async () => {
    const target = destination(await finishOAuth(new Request('http://localhost:3000/auth/callback?code=synthetic&next=%2Fprofile')));
    expect(target.origin).toBe(PUBLIC_SITE_URL);
    expect(target.pathname).toBe('/auth/callback');
    expect(target.searchParams.get('code')).toBe('synthetic');
    expect(exchange).not.toHaveBeenCalled();
  });

  it('returns to the requested internal page after a successful exchange', async () => {
    const target = destination(await finishOAuth(new Request(`${PUBLIC_SITE_URL}/auth/callback?code=synthetic&next=%2Fprofile`)));
    expect(target.origin).toBe(PUBLIC_SITE_URL);
    expect(target.pathname).toBe('/profile');
    expect(exchange).toHaveBeenCalledOnce();
  });

  it.each(['missing', 'expired', 'unavailable'])('keeps failed callbacks on the public login page: %s', async (reason) => {
    if (reason === 'expired') exchange.mockResolvedValue({ error: {} });
    if (reason === 'unavailable') exchange.mockRejectedValue(new Error('unavailable'));
    const code = reason === 'missing' ? '' : '?code=synthetic';
    const target = destination(await finishOAuth(new Request(`${PUBLIC_SITE_URL}/auth/callback${code}`)));
    expect(target.origin).toBe(PUBLIC_SITE_URL);
    expect(target.pathname).toBe('/login');
    expect(target.searchParams.get('error')).toBe('oauth');
  });
});

import type { Metadata, Viewport } from 'next';
import { cookies } from 'next/headers';
import { Mitr, Noto_Sans_Thai } from 'next/font/google';
import './globals.css';
import { getMessages, isLocale, LOCALE_COOKIE } from '@/i18n';
import type { Locale } from '@/lib/types';
import { AppProviders } from '@/components/providers/AppProviders';
import { Header } from '@/components/shell/Header';
import { Footer } from '@/components/shell/Footer';
import { TabBar } from '@/components/shell/TabBar';
import { authEnabled, passwordResetEnabled } from '@/server/supabase/config';
import { getCurrentUser } from '@/server/supabase/auth';
import { googleEnabled } from '@/server/supabase/capabilities';
import { SkipLink } from '@/components/shell/SkipLink';

const mitr = Mitr({ weight: ['500', '600'], subsets: ['thai', 'latin'], variable: '--font-mitr', display: 'swap' });
const noto = Noto_Sans_Thai({ weight: ['400', '500', '600', '700'], subsets: ['thai', 'latin'], variable: '--font-noto-thai', display: 'swap' });

async function currentLocale(): Promise<Locale> {
  const v = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(v) ? v : 'th';
}

export async function generateMetadata(): Promise<Metadata> {
  const m = getMessages(await currentLocale());
  return {
    title: { default: m.meta.title, template: '%s · Cozypet' },
    description: m.meta.description,
    icons: { icon: '/icon.svg' },
  };
}

export const viewport: Viewport = {
  themeColor: '#FFFDF8',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await currentLocale();
  const [user,google] = await Promise.all([getCurrentUser(),googleEnabled()]);
  const auth = { enabled: authEnabled(), user, resetEnabled: passwordResetEnabled(),googleEnabled:google };
  return (
    <html lang={locale} className={`${mitr.variable} ${noto.variable}`}>
      <body>
        <AppProviders locale={locale} auth={auth}>
          <SkipLink />
          <Header />
          <main id="main" className="cp-main" tabIndex={-1}>
            {children}
          </main>
          <Footer />
          <TabBar />
        </AppProviders>
      </body>
    </html>
  );
}

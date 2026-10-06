'use client';

import { m } from '@/lib/motion';
import { DISTANCE, T } from '@/lib/motion-tokens';

/** transition ของหน้า: enter-only 250ms (MOTION.md 3 ข้อ 1) — ไม่มี exit เพื่อไม่ให้การกดเมนูช้าลง */
export default function Template({ children }: { children: React.ReactNode }) {
  return (
    <m.div initial={{ opacity: 0, y: DISTANCE.page }} animate={{ opacity: 1, y: 0 }} transition={T.page}>
      {children}
    </m.div>
  );
}

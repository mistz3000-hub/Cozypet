import { defineConfig, globalIgnores } from 'eslint/config';
import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';

export default defineConfig([
  ...nextVitals,
  ...nextTs,
  {
    rules: {
      // ห้ามโหลด Motion แบบเต็ม ใช้ LazyMotion + m ผ่าน src/lib/motion.ts (MOTION.md, AC-81)
      'no-restricted-imports': ['error', {
        paths: [
          { name: 'motion/react', message: 'ใช้ m และ hook จาก @/lib/motion (LazyMotion) แทน' },
          { name: 'framer-motion', message: 'ใช้ @/lib/motion แทน' },
          { name: 'motion', message: 'ใช้ @/lib/motion แทน' },
        ],
      }],
    },
  },
  {
    files: ['src/lib/motion.tsx', 'src/lib/motion-features.ts', 'src/lib/motion-features-max.ts'],
    rules: { 'no-restricted-imports': 'off' },
  },
  globalIgnores(['.next/**', 'out/**', 'build/**', 'next-env.d.ts', 'public/_generated/**', 'node_modules/**']),
]);

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ไฟล์กติกาของ AI ต้องติดไปกับ deployment ของ route ที่อ่านด้วย fs (PROMPT.md 12.2)
  outputFileTracingIncludes: {
    '/api/chat': ['./GEMINI_ROLEPLAY.md'],
    '/api/assist': ['./GEMINI_ROLEPLAY.md'],
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(film|print)(.*)',
        headers: [{ key: 'X-Robots-Tag', value: 'noindex' }],
      },
    ];
  },
};

export default nextConfig;

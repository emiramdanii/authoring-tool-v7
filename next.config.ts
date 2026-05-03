import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  turbopack: {
    root: '..',
  },
  allowedDevOrigins: [
    'preview-chat-fe7366f1-5582-49d5-a29d-349525f4c43d.space-z.ai',
    '.space-z.ai',
    '.space.chatglm.site',
  ],
};

export default nextConfig;

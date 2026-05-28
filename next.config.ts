import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  allowedDevOrigins: [
    "preview-chat-d7f22c0f-937a-4bb6-9504-ee537a2e116b.space-z.ai",
    ".space-z.ai",
    "localhost:3000",
  ],
};

export default nextConfig;

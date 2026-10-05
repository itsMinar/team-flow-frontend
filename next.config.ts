import type { NextConfig } from "next";

const apiOrigin = new URL(
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8080",
).origin;
const developmentScriptPolicy =
  process.env.NODE_ENV === "development" ? " 'unsafe-eval'" : "";

const nextConfig: NextConfig = {
  reactCompiler: true,
  agentRules: false,
  allowedDevOrigins: ["127.0.0.1"],
  images: {
    qualities: [75, 85],
    remotePatterns: [{ protocol: "https", hostname: "images.unsplash.com" }],
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              `script-src 'self' 'unsafe-inline'${developmentScriptPolicy}`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: blob: https://images.unsplash.com",
              "font-src 'self' data:",
              `connect-src 'self' ${apiOrigin}`,
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
            ].join("; "),
          },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
        ],
      },
    ];
  },
};

export default nextConfig;

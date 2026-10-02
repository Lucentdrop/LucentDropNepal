import type { NextConfig } from "next";
const config: NextConfig = {
  env: {
    NEXT_PUBLIC_API_PROVIDER:
      process.env.API_PROVIDER === "external" ? "external" : "mock",
  },
  images: { unoptimized: true },
  ...(process.env.STATIC_EXPORT === "1" ? { output: "export" as const } : {}),
};
export default config;

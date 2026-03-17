import type { NextConfig } from "next";

const isStaticExport = !!process.env.STATIC_EXPORT;

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : undefined,
  basePath: isStaticExport ? "/generative-nonsense" : undefined,
};

export default nextConfig;

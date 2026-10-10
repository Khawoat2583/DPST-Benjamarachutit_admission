// import type { NextConfig } from "next";
// const nextConfig: NextConfig = {
//   /* config options here */
//   allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
// };
// export default nextConfig;

import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  allowedDevOrigins: ["*.ngrok-free.app", "*.ngrok.io"],
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
};
export default nextConfig;

import type { NextConfig } from "next";
import dns from "dns";
dns.setServers(['1.1.1.1', '8.8.8.8']);

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

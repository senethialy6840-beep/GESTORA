import type { NextConfig } from "next";

if (process.env.NEXTAUTH_URL === "") {
  delete process.env.NEXTAUTH_URL;
}

const nextConfig: NextConfig = {
  /* config options here */
};

export default nextConfig;

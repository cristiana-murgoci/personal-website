import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    // serve the standalone lecture-notes book (public/notes/index.html) at a clean /notes URL
    return [{ source: "/notes", destination: "/notes/index.html" }];
  },
};

export default nextConfig;

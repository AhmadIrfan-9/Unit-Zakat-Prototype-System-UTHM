import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix: Turbopack detected two lockfiles (root + my-production-app).
  // Explicitly set the workspace root to THIS app's directory to silence the warning.
  turbopack: {
    root: __dirname,
  },

  // Recommended for Auth.js v5: prevents the auth secret from being bundled
  // into the client-side JavaScript by marking it as server-only.
  serverExternalPackages: ["@node-rs/argon2", "bcryptjs"],
};

export default nextConfig;

import path from "node:path";
import { fileURLToPath } from "node:url";
const root = path.dirname(fileURLToPath(import.meta.url));
// GitHub Pages serves a project site from /<repo-name>, so the deploy workflow sets NEXT_PUBLIC_BASE_PATH.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",          // fully static site: free to host on GitHub Pages
  trailingSlash: true,
  basePath,
  images: { unoptimized: true },
  reactStrictMode: true,
  webpack(config) { config.resolve.alias["@"] = root; return config; },
};
export default nextConfig;

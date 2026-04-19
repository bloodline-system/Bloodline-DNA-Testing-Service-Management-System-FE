import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const apiTarget = env.VITE_API_URL || "http://localhost:8080";

  return {
    plugins: [react(), tailwindcss()],
    // Tailwind v4 uses a native binding (@tailwindcss/oxide-*) on Node.
    // Vite's dependency optimizer (rolldown) can mistakenly try to prebundle
    // that native .node file and crash on Windows.
    // Exclude it from optimizeDeps so Node can load it normally at runtime.
    optimizeDeps: {
      exclude: [
        "@tailwindcss/oxide",
        "@tailwindcss/oxide-win32-x64-msvc",
        "@tailwindcss/oxide-win32-arm64-msvc",
      ],
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      proxy: {
        "/api": {
          target: apiTarget,
          changeOrigin: true,
          secure: false,
          configure: (proxy: any) => {
            proxy.on("proxyReq", (proxyReq: any) => {
              proxyReq.removeHeader("origin");
            });
          },
        },
      },
    },
  };
});

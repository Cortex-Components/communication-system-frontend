import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  return {
    define: {
      "process.env.NODE_ENV": JSON.stringify(mode),
    },
    server: {
      host: "::",
      port: parseInt(env.VITE_PORT || "8081"),
      hmr: {
        overlay: false,
      },
      watch: {
        // Ignore .env changes so the dashboard server can write to .env without triggering a full page reload.
        ignored: ["**/.env", "**/.env.*"],
      },
      proxy: {
        "/api/config": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
        "/api/build": {
          target: "http://localhost:3001",
          changeOrigin: true,
          secure: false,
        },
        "/api": {
          target: "http://142.93.167.9:8010",
          changeOrigin: true,
          secure: false,
        },
        "/admin": {
          target: "http://142.93.167.9:8010",
          changeOrigin: true,
          secure: false,
        },
      },
    },

    plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/main.tsx"),
        name: "CortexChatWidget",
        fileName: (format) => `widget.${format}.js`,
        formats: ["iife"],
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

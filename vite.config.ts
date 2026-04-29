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
    build: {
      lib: {
        entry: path.resolve(__dirname, "src/main.tsx"),
        name: "CortexChatWidget",
        fileName: (format) => `cortex-chat-widget.${format}.js`,
        formats: ["es", "umd"],
      },
      rollupOptions: {
        output: {
          inlineDynamicImports: true,
        },
      },
    },
    server: {
      host: "::",
      port: parseInt(env.VITE_PORT || "8081"),
      hmr: {
        overlay: false,
      },
      watch: {
        ignored: ["**/.env", "**/.env.*"],
      },
      proxy: {
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
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});

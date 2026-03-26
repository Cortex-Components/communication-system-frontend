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
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET || "http://142.93.167.9:8010",
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
        fileName: (format) => `cortex-chat-widget.${format}.js`,
        formats: ["es", "umd"],
      },
      rollupOptions: {
        // We usually don't externalize React/ReactDOM for a standalone Widget to avoid version conflicts on host pages.
        // But if you want a smaller file and the parent page has React, we can externalize them.
        output: {
          manualChunks: undefined,
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

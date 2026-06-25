import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log("process.cwd() inside config:", process.cwd());
  console.log("mode inside config:", mode);
  console.log("VITE_PORT in env:", env.VITE_PORT);
  console.log("All VITE_ keys loaded:", Object.keys(env).filter(k => k.startsWith("VITE_")));
  console.log("VITE_COLOR_PRIMARY loaded in config:", env.VITE_COLOR_PRIMARY);
  console.log("VITE_COLOR_SECONDARY loaded in config:", env.VITE_COLOR_SECONDARY);
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
        ignored: ["**/.env", "**/.env.*"],
      },
      proxy: {
        "/api": {
          target: env.VITE_PROXY_TARGET || "https://communication-system-back-bzazb5fffgdbcrhw.northeurope-01.azurewebsites.net",
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

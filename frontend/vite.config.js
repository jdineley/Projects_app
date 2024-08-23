import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { sentryVitePlugin } from "@sentry/vite-plugin";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    sentryVitePlugin({
      authToken: process.env.SENTRY_AUTH_TOKEN,
      org: "james-dineley",
      project: "projects-frontend",
      options: {
        telemetry: "false",
      },
    }),
    // , sentryVitePlugin({
    //   org: "james-dineley",
    //   project: "projects-frontend"
    // })
  ],
  build: {
    chunkSizeWarningLimit: 1600,
    sourcemap: true, // Source map generation must be turned on
  },
});

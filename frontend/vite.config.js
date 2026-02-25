import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",       // << relative path ka fix
  plugins: [react()],
  server: {
    host: "0.0.0.0",
    port: 10000
  }
});






import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",        // relative path assets ke liye
  plugins: [react()],
  build: {
    outDir: "dist"   // ensure dist folder create ho
  },
  server: {
    host: "0.0.0.0",
    port: 10000
  }
});
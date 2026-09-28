import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";

// Rutas relativas: el mismo build sirve en GitHub Pages (/pliego/) y dentro del APK (file:///android_asset/).
export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": fileURLToPath(new URL("./src", import.meta.url)) } },
  build: { outDir: "../pliego", emptyOutDir: false, assetsDir: "assets" },
});

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
// Assuming these Replit plugins might not be needed/available locally, comment them out or remove if they cause issues
// import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// import cartographer from "@replit/vite-plugin-cartographer";
// import devBanner from "@replit/vite-plugin-dev-banner";
import path from 'path';
import { fileURLToPath } from 'url'; // <-- Added import

// --- Added lines to define __dirname ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// --- End added lines ---

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // runtimeErrorOverlay(), // Commented out Replit plugin
    // // Only include Replit plugins if needed and installed locally
    // ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== undefined
    //   ? [cartographer(), devBanner()]
    //   : [],
  ],
  resolve: {
    alias: {
      // --- Corrected paths using __dirname ---
      "@": path.resolve(__dirname, "client", "src"),
      "@shared": path.resolve(__dirname, "shared"),
      "@assets": path.resolve(__dirname, "attached_assets"),
      // --- End corrected paths ---
    },
  },
  // --- Corrected root path ---
  root: path.resolve(__dirname, "client"),
  // --- End corrected root path ---
  build: {
    // --- Corrected outDir path ---
    outDir: path.resolve(__dirname, "dist/public"),
    // --- End corrected outDir path ---
    emptyOutDir: true,
  },
  server: {
    // --- Added proxy for API calls during development ---
    proxy: {
      '/api': {
        target: 'http://localhost:5000', // Assuming your backend runs on port 5000
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, ''), // Uncomment if your backend doesn't expect /api prefix
      }
    },
    // --- End added proxy ---
    fs: {
      strict: true,
      deny: ["**/.*"], // Keep this for security
    },
  },
});
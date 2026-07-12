import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
    rolldownOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (
              id.includes("react") ||
              id.includes("react-dom") ||
              id.includes("react-router-dom")
            ) {
              return "react-vendor";
            }

            if (id.includes("lucide-react")) {
              return "icons";
            }

            if (
              id.includes("axios") ||
              id.includes("date-fns") ||
              id.includes("clsx") ||
              id.includes("tailwind-merge")
            ) {
              return "utils";
            }

            return "vendor";
          }
        },
      },
    },
  },
});
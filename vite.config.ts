import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/nominatim': {
        target: 'https://nominatim.openstreetmap.org',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/nominatim/, ''),
        headers: {
          Referer: 'http://localhost:5173',
        },
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("react-dom") || id.includes("react/") || id.includes("scheduler")) return "vendor-react"; // scheduler must travel with react-dom
          if (id.includes("leaflet") || id.includes("react-leaflet")) return "vendor-maps";
          if (id.includes("jspdf")) return "vendor-pdf";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-redux") || id.includes("@reduxjs/toolkit")) return "vendor-redux";
          if (id.includes("recharts") || id.includes("d3")) return "vendor-charts";
          if (id.includes("i18next") || id.includes("react-i18next")) return "vendor-i18n";
          if (id.includes("socket.io-client")) return "vendor-socket";
          if (id.includes("axios")) return "vendor-axios";
          if (id.includes("lucide-react")) return "vendor-icons";
          return "vendor";
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/main.tsx',
        'src/App.tsx',
        'src/i18n.ts',
        'src/**/*.d.ts',
        'src/locales/**',
        'src/assets/**',
      ],
    },
  },
});

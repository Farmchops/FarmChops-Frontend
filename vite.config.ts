import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  // theme: {
  //   extend: {
  //     fontFamily: {
  //       nunito: ['"Nunito Sans"', 'sans-serif'],
  //       jakarta: ['"Plus Jakarta Sans"', 'sans-serif'],
  //       dm: ['"DM Sans"', 'sans-serif'],
  //     },
  //   },
  // },
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://api.farmchops.com',
        changeOrigin: true,
        secure: false,
      }
    }
  }
})

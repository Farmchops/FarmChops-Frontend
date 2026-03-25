import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react-swc'
import tailwindcss from '@tailwindcss/vite'
import path from "path";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');
  return {
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
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            'recharts': ['recharts'],
          },
        },
      },
    },
    server: {
      proxy: {
        '/api': {
          target: env.VITE_API_BASE_URL ? env.VITE_API_BASE_URL.replace(/\/api$/, '') : '',
          changeOrigin: true,
          secure: false,
        }
      }
    }
  }
})

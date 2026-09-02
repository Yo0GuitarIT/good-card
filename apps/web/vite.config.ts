import { defineConfig } from 'vite'
import react, { reactCompilerPreset } from '@vitejs/plugin-react'
import babel from '@rolldown/plugin-babel'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] })
  ],
  server: {
    proxy: {
      // 開發時把 /api 轉給本機 API，讓前端與 API 維持同源，cookie 才會帶得過去。
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: false,
      },
    },
  },
})

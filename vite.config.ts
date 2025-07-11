import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/feishu-api': {
        target: 'https://ae-openapi.feishu.cn',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/feishu-api/, ''),
      },
      '/case_be': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/case_be/, ''),
      }
    },
  },
  base: './',
  // base: '/test_case/',
})

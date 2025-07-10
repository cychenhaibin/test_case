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
        target: 'http://47.120.6.54:8080',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/case_be/, ''),
      }
    },
  },
  base: '/test_case/',
})

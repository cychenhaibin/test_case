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
    },
  },
  base: '/test_case/',
})

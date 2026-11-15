import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',   // /api로 시작하는 요청을 백엔드(Express) 서버로 대리 전송
        changeOrigin: true,                // 출처 불일치(CORS) 오류 해결
      },
    },
  },
})

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  server: {
    host: '0.0.0.0',
    port: 5174, // 强制匹配 Nginx 配置的 5174
    allowedHosts: true // 允许所有 Host 访问（由 Nginx 过滤）
  },
  preview: {
    host: '0.0.0.0',
    port: 5174,
    allowedHosts: true
  }
})

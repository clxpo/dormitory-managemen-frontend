import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { internalIpV4 } from 'internal-ip'

export default defineConfig(async () => {
  // หา IP อัตโนมัติ (await)
  const ip = (await internalIpV4()) || 'localhost'

  return {
    plugins: [vue()],
    server: {
      host: true,
      port: 5173,
      hmr: {
        host: ip,
        port: 5173
      },
      proxy: {
        '/api': {
          target: 'http://localhost:3000',
          changeOrigin: true
        }
      }
    }
  }
})

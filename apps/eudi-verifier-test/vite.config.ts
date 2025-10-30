import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Pridávame 'server' sekciu na konfiguráciu proxy
  server: {
    proxy: {
      // Akýkoľvek request, ktorý začína na '/api'
      '/api': {
        // Presmeruj ho na náš backend server
        target: 'http://localhost:3000',
        // Nevyhnutné pre správne fungovanie (mení 'Origin' hlavičku)
        changeOrigin: true,
      },
    },
  },
})
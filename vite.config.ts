import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Expone en la red local para probar en celulares (iPhone / Android)
    port: 5173,
  },
})

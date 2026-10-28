import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'
import path from 'node:path'

// Asegurar compatibilidad de nombres de archivo sin acentos para BAÑO 2.png
const banoSrc = path.resolve(__dirname, 'public/HACIENDA F22/BAÑO 2.png');
const banoDest = path.resolve(__dirname, 'public/HACIENDA F22/BANO 2.png');
if (fs.existsSync(banoSrc) && !fs.existsSync(banoDest)) {
  try {
    fs.copyFileSync(banoSrc, banoDest);
  } catch {
    // Ignore error if permission is restricted
  }
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    host: true, // Expone en la red local para probar en celulares (iPhone / Android)
    port: 5173,
  },
})

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    fs: { allow: [fileURLToPath(new URL('.', import.meta.url)), fileURLToPath(new URL('../server/src/content', import.meta.url))] },
  },
})

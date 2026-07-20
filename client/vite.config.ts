import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  base: '/iris-tidy-organiser/',
  plugins: [react(), tailwindcss()],
  server: {
    host: true,
  },
})

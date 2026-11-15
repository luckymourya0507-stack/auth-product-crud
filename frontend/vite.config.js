import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// In development the browser talks to Vite (5173) and Vite forwards /api/* to the backend (5000).
// That makes everything "same-origin", so the httpOnly refresh cookie works without CORS tricks.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:5000',
    },
  },
})

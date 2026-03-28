import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          ui: ['lucide-react', 'framer-motion', 'recharts', 'tailwind-merge', 'clsx'],
          pdf: ['jspdf'],
          chart: ['recharts'],
        },
      },
    },
  },
})

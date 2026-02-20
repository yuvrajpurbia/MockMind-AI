import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2020',
    rollupOptions: {
      output: {
        manualChunks: {
          'three-vendor': ['three', '@react-three/fiber', '@react-three/drei'],
          'animation-vendor': ['framer-motion', '@react-spring/web'],
          'router-vendor': ['react-router-dom', 'axios'],
        },
      },
    },
    chunkSizeWarningLimit: 1200,
  },
})

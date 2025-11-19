// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.js'],
    exclude: [
      '**/node_modules/**', 
      '**/dist/**', 
      '**/test/**', // <-- 🎯 Ignore files in the e2e directory
      '**/.{idea,git,cache,output,temp}/**',
    ],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
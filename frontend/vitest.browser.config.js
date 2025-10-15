import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from "path";
export default defineConfig({
  plugins: [react()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  test: {
    browser: {
      enabled: true,
      provider: 'playwright',
      // https://vitest.dev/guide/browser/playwright
      instances: [
        { browser: "chromium" },
      ],
      headless: false,
    },
  },
  

})

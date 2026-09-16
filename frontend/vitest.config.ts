import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/warranty-item/runtime/**/*.test.ts'],
  },
})

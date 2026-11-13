import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node', // jsdom startas manuellt i testerna så att index.html kan laddas som den är
    include: ['tests/**/*.test.js'],
  },
});

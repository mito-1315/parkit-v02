<<<<<<< HEAD
import { defineConfig } from 'vitest/config';
=======
/// <reference types="vitest" />
import { defineConfig } from 'vite';
>>>>>>> 5cdfde27934796fd0dec8c9a91607626ed85d05d
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/tests/setup.ts',
  },
});

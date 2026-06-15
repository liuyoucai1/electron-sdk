import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';

export default defineConfig({
  plugins: [vue()],
  server: {
    host: '127.0.0.1',
    port: 5173,
    strictPort: true
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) {
            return undefined;
          }

          if (id.includes('element-plus')) {
            return 'vendor-element';
          }

          if (id.includes('echarts') || id.includes('zrender')) {
            return 'vendor-echarts';
          }

          if (id.includes('vue') || id.includes('pinia')) {
            return 'vendor-vue';
          }

          return 'vendor';
        }
      }
    }
  }
});

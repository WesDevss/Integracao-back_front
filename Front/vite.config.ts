import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  root: '.',
  publicDir: 'public',
  plugins: [tailwindcss(), tsconfigPaths()],
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      // Pode ser necessário configurar a substituição de variáveis aqui se a detecção automática não estiver funcionando
      // Por enquanto, vamos manter simples e confiar que o emptyOutDir ajude
    },
  },
  server: {
    port: 5173,
    open: true,
  },
  define: {
    __BACKEND_BASE_URL__: process.env.NODE_ENV === 'production'
      ? JSON.stringify('/api')
      : JSON.stringify('http://localhost:8000')
  }
})



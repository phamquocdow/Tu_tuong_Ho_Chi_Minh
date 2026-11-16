import { defineConfig } from 'vite';

// Cấu hình Vite: game chỉ có 1 trang, deploy ở gốc tên miền Vercel
export default defineConfig({
  base: '/',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0, // giữ file font riêng, không nhúng base64
  },
});

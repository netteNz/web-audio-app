import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from 'tailwindcss';

export default defineConfig({
  base: "/web-audio-app/", // 👈 This is the key part for GitHub Pages
  plugins: [
    react(),
    tailwindcss(),
  ],
});

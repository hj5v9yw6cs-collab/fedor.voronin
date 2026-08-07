import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from the custom domain fedorvoronin.ru (see public/CNAME),
// so it lives at the root, not under a repo-name path.
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})

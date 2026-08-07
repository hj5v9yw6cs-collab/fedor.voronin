import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Served from https://<owner>.github.io/fedor.voronin/ via GitHub Pages,
// so asset URLs need that repo-name prefix. Switch this to '/' if a
// custom domain (a CNAME file in public/) is set up later.
export default defineConfig({
  base: '/fedor.voronin/',
  plugins: [
    react(),
    tailwindcss(),
  ],
})

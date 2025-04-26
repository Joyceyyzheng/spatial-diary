import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
// import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // This makes it accessible to all devices on your network
    port: 5173,       // Default port, or you can change this
    hmr: {
      host: 'commitment-began-dangerous-england.trycloudflare.com',
      overlay: true,  
      clientPort: 5173  
    }
  }
})

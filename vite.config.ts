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
      host: '2de2-2600-4041-5991-a600-34eb-3220-37f2-ebf6.ngrok-free.app',
      overlay: true,  
      clientPort: 5173  
    }
  }
})

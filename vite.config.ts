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
      host: '8d61-2600-4041-5991-a600-9c4b-9412-9cf-ff5e.ngrok-free.app',
      overlay: true,  
      clientPort: 5173  
    }
  }
})

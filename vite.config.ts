import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import viteEnvCompatible from "vite-plugin-env-compatible"
// https://vite.dev/config/
export default defineConfig({
  envPrefix : "REACT_APP_",
  plugins: [react() , viteEnvCompatible()],
  build : {
     chunkSizeWarningLimit : 1500,
  }
})

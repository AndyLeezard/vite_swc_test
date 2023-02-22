import { defineConfig } from "vite"
import react from "@vitejs/plugin-react-swc"
/* import { viteCommonjs, esbuildCommonjs } from "@originjs/vite-plugin-commonjs" */

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [/* viteCommonjs(), */ react()],
  server: {
    port: 3000,
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [/linked-dep/, /node_modules/],
    },
  },
  optimizeDeps: {
    include: ['linked-dep'],
    /* esbuildOptions: {
      plugins: [esbuildCommonjs(["ws"])],
    }, */
  },
})

import react from '@vitejs/plugin-react'
import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  css: {
    // semantic-ui-css 2.5 ships one invalid selector ("[data-tooltip]:after .header");
    // let Lightning CSS drop that rule instead of failing the build.
    lightningcss: { errorRecovery: true },
  },
  resolve: {
    alias: {
      // Semantic UI React 2.x relies on ReactDOM.findDOMNode (removed in React 19).
      // See src/compat/react-component-ref.js
      '@fluentui/react-component-ref': fileURLToPath(
        new URL('./src/compat/react-component-ref.js', import.meta.url),
      ),
    },
  },
})

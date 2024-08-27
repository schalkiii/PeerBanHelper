import { fileURLToPath, URL } from 'node:url'

import { vitePluginForArco } from '@arco-plugins/vite-vue'
import vue from '@vitejs/plugin-vue'
import { exec as execCallBack } from 'node:child_process'
import { promisify } from 'node:util'
import { defineConfig } from 'vite'
import { analyzer } from 'vite-bundle-analyzer'
import { nodePolyfills } from 'vite-plugin-node-polyfills'
import VueDevTools from 'vite-plugin-vue-devtools'

const exec = promisify(execCallBack)

const isAnalyze = process.env.ANALYZE === 'true'

// https://vitejs.dev/config/
export default defineConfig({
  base: '',
  plugins: [
    vue(),
    // viteMockServe({}),
    VueDevTools(),
    vitePluginForArco({
      style: 'css'
    }),
    nodePolyfills({ include: ['path'] }),
    ...(isAnalyze ? [analyzer()] : [])
  ],
  define: {
    __APP_VERSION__: process.env.npm_package_version,
    __APP_HASH__:
      (await exec('git rev-parse HEAD').catch(console.log))?.stdout.toString() ??
      process.env.GIT_HASH
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          libs: ['pinia', 'vue-request', 'vue-i18n', 'vue-router', 'vue', '@vueuse/core', 'lodash'],
          arcoDesign: ['@arco-design/web-vue'],
          echarts: ['echarts', 'vue-echarts'],
          uuid: ['uuid']
        }
      }
    }
  },
  server: {
    proxy: {
      '/api': {
        target: process.env.PBH_ENDPOINT || 'http://127.0.0.1:9898',
        changeOrigin: true
      }
    }
  }
})

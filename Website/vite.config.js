import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue2'
import fs from 'fs'
import path from 'path'

const appBasePath = './Scripts/App/'
const jsEntries = {}

if (fs.existsSync(appBasePath)) {
  fs.readdirSync(appBasePath).forEach(function (name) {
    const indexFile = appBasePath + name + '/main.js'
    if (fs.existsSync(indexFile)) {
      jsEntries[name] = path.resolve(__dirname, indexFile)
    }
  })
}

const entryNames = Object.keys(jsEntries)

const assetName = (info) => {
  const name = (info.names && info.names[0]) || info.name || ''
  if (name.endsWith('.css')) {
    return entryNames.indexOf(name.slice(0, -4)) >= 0 ? '[name].css' : '[name].[hash].css'
  }
  if (/\.(png|jpe?g|gif|svg|webp|ico)$/i.test(name)) return 'images/[name].[hash][extname]'
  if (/\.(woff2?|ttf|eot|otf)$/i.test(name)) return 'fonts/[name].[hash][extname]'
  return 'assets/[name].[hash][extname]'
}

export default defineConfig({
  base: './',
  publicDir: false,
  plugins: [vue()],
  resolve: {
    alias: [
      { find: /^vue$/, replacement: 'vue/dist/vue.esm.js' }
    ]
  },
  server: {
    port: 4062,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:4062'
  },
  build: {
    outDir: path.resolve(__dirname, 'Scripts', 'Bundle'),
    emptyOutDir: true,
    sourcemap: true,
    chunkSizeWarningLimit: 8000,
    rollupOptions: {
      input: jsEntries,
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].[hash].js',
        assetFileNames: assetName
      }
    }
  }
})

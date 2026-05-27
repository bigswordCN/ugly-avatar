const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: true,
  publicPath: process.env.TAURI_BUILD === 'true'
  ? './'
  : process.env.NODE_ENV === 'production'
  ? '/ugly-avatar/'
  : '/'
})

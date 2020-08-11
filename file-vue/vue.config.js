// eslint-disable-next-line no-undef
// const TerserPlugin = require('terser-webpack-plugin')
// eslint-disable-next-line no-undef
module.exports = {
  publicPath: './',
  outputDir: '../file/vue',
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/itooi': {
        target: 'https://v1.itooi.cn/',
        changeOrigin: true,
        ws: true,
        pathRewrite: {
          '^/itooi': ''
        }
      }
    }
  },
  configureWebpack: {
    // optimization: {
    //   minimizer: [
    //     new TerserPlugin({
    //       terserOptions: {
    //         ecma: undefined,
    //         warnings: false,
    //         parse: {},
    //         compress: {
    //           drop_console: true,
    //           drop_debugger: false,
    //           pure_funcs: ['console.log'] // 移除console
    //         }
    //       }
    //     })
    //   ]
    // }
  }

}

'use strict'
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const path = require('path')
const baseWebpackConfig = require('./webpack.base.conf')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const FriendlyErrorsPlugin = require('friendly-errors-webpack-plugin')
const portfinder = require('portfinder')

const HOST = process.env.HOST
const PORT = process.env.PORT && Number(process.env.PORT)

const devWebpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.happyStyleLoaders({ sourceMap: config.dev.cssSourceMap, usePostCSS: true })
  },
  // cheap-module-eval-source-map is faster for development
  devtool: config.dev.devtool,

  // these devServer options should be customized in /config/index.js
  devServer: {
    // @todo add before middleware
    // https://webpack.js.org/configuration/dev-server/#devserver-before
    before: function (app){
      app.get('*', function (req, res, next) {
        // hidden html suffix
        // Inspired https://github.com/kapouer/express-urlrewrite
        if (!/(^(\/$|\/(webpack-dev-server|sockjs|__webpack_dev_server__|assets|static|api))|\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|js|json|css|html|ico|pdf)(\?.*)?$)/.test(req.path)) {
          var opath = req.path
          var npath = opath == '/' ? '/' : opath + '.html'
          res.redirect(req.url.replace(opath, npath))
          return false;
        }
        next();
      });
    },
    clientLogLevel: 'warning',
    historyApiFallback: {
      rewrites: [
        { from: /^\/(?!static).*/, to: path.posix.join(config.dev.assetsPublicPath, 'index.html') },
      ],
    },
    hot: true,
    // contentBase: false, // since we use CopyWebpackPlugin.
    compress: true,
    host: HOST || config.dev.host,
    port: PORT || config.dev.port,
    open: config.dev.autoOpenBrowser,
    openPage: 'login',
    overlay: config.dev.errorOverlay
      ? { warnings: false, errors: true }
      : false,
    contentBase: [path.resolve(__dirname, '../public'), path.resolve(__dirname, '..')],
    publicPath: config.dev.assetsPublicPath,
    proxy: config.dev.proxyTable,
    quiet: true, // necessary for FriendlyErrorsPlugin
    watchOptions: {
      poll: config.dev.poll,
    }
  },
  plugins: [
    ...utils.happyStylePlugins({
      sourceMap: config.dev.cssSourceMap,
      usePostCSS: true
    }),
    new webpack.DefinePlugin({
      'process.env': require('../config/dev.env'),
       VERSION: JSON.stringify(Date.now())
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NamedModulesPlugin(), // HMR shows correct file names in console on update.
    new webpack.NoEmitOnErrorsPlugin(),
    // https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      inject: true,
      template: './src/layout/base.tpl',
      templateChunks: false,
      apiServer: config.dev.apiServer,
      favicon: './src/favicon.png',
      hash: process.env.NODE_ENV === 'production',
      appMountId: 'app',
      googleAnalytics: {
        trackingId: 'UA-XXXX-XX',
        pageViewOnLoad: true
      }
    })
  ]
})

module.exports = new Promise((resolve, reject) => {
  portfinder.basePort = process.env.PORT || config.dev.port
  portfinder.getPort((err, port) => {
    if (err) {
      reject(err)
    } else {
      // publish the new Port, necessary for e2e tests
      process.env.PORT = port
      // add port to devServer config
      devWebpackConfig.devServer.port = port

      // Add FriendlyErrorsPlugin
      devWebpackConfig.plugins.push(new FriendlyErrorsPlugin({
        compilationSuccessInfo: {
          messages: [`Your application is running here: http://${devWebpackConfig.devServer.host}:${port}`],
        },
        onErrors: config.dev.notifyOnErrors
        ? utils.createNotifierCallback()
        : undefined
      }))

      resolve(devWebpackConfig)
    }
  })
})

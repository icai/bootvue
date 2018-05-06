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

      // var logger = require('morgan');
      // var cookieParser = require('cookie-parser');
      // var bodyParser = require('body-parser');
      // var twig = require('twig');
      // var twigConfig = require('../config/twig');
      // twig.extend(function (Twig) {
      //   twigConfig(Twig);
      // })
      // // app.set('view cache', false);
      // // view engine setup
      // app.set('views', path.join(__dirname, '../views'));
      // app.set('view engine', 'html');
      // twig.cache(false);
      // // use .html suffix as twig engine template file suffix
      // app.engine('html', twig.renderFile);
      // app.locals._layoutFile = 'layout.html';
      // // uncomment after placing your favicon in /public
      // //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
      // app.use(logger('dev'));
      // app.use(bodyParser.json());
      // app.use(bodyParser.urlencoded({
      //   extended: false
      // }));
      // app.use(cookieParser());
      // // app.use(express.static(path.join(__dirname, '../public')));

      // var staticReg = {
      //   script: /<script[^>]*?src=(["'])([^\1]*?)\1[^>]*?><\/script>/g,
      //   link: /<link[^>]*?href=(["'])([^\1]*?)\1[^>]*?\/?>/g
      // }
      // app.get('*', function(req, res, next) {
      //   try {
      //     var path = req.path.slice(1).replace(/\.html^/, '');
      //     // console.info(req.url, req.path, path);
      //     // var startTime = new Date().getTime();
      //     var time = new Date().getTime();
      //     res.render(path, {
      //       version: time
      //     }, function (err, html) {
      //       for (var i in staticReg) {
      //         html = html.replace(staticReg[i], function (all, $1, $2) {
      //           if (!/^(http(s)?\:)?\/\//.test($2)) {
      //             var split = all.indexOf($2) + $2.length;
      //             return all.substring(0, split) + '?v=' + time + all.substring(split);
      //           } else {
      //             return all;
      //           }
      //         })
      //       }
      //       res.send(html);
      //     });
      //   } catch (e) {
      //     // hidden html suffix
      //     // Inspired https://github.com/kapouer/express-urlrewrite
      //     if (!/(^(\/$|\/(webpack-dev-server|sockjs|__webpack_dev_server__|assets|static|api))|\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf|mp4|webm|ogg|mp3|wav|flac|aac|js|json|css|html|ico|pdf)(\?.*)?$)/.test(req.path)) {
      //         var opath = req.path
      //         var npath = opath == '/' ? '/' : opath + '.html'
      //         res.redirect(req.url.replace(opath, npath))
      //         return false;
      //     }
      //     next();
      //   }
      // });
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
      template: './layout/base.tpl',
      templateChunks: false,
      apiServer: '//119.147.171.113:28080',
      favicon: './src/assets/img/favicon.ico',
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

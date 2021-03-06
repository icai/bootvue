'use strict'
const path = require('path')
const utils = require('./utils')
const webpack = require('webpack')
const config = require('../config')
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.base.conf')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const OptimizeCSSPlugin = require('optimize-css-assets-webpack-plugin')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const FileManagerPlugin = require('filemanager-webpack-plugin')
const layoutConf = require('../config/layout.conf')
const MultipageWebpackPlugin = require('./webpack.multipage.plugin')

const env = process.env.NODE_ENV === 'testing'
  ? require('../config/test.env')
  : require('../config/prod.env')


let releaseName = (process.env.npm_config_pro ? 'pro' : 'test') + `-${utils.getDate(12)}`

const webpackConfig = merge(baseWebpackConfig, {
  module: {
    rules: utils.happyStyleLoaders({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    })
  },
  devtool: config.build.productionSourceMap ? config.build.devtool : false,
  output: {
    path: config.build.assetsRoot,
    filename: utils.assetsPath('js/[name].[chunkhash].js'),
    chunkFilename: utils.assetsPath('js/[id].[chunkhash].js')
  },
  plugins: [
    ...utils.happyStylePlugins({
      sourceMap: config.build.productionSourceMap,
      extract: true,
      usePostCSS: true
    }),

    // http://vuejs.github.io/vue-loader/en/workflow/production.html
    new webpack.DefinePlugin({
      'process.env': env,
      VERSION: JSON.stringify(Date.now())
    }),
    new UglifyJsPlugin({
      uglifyOptions: {
        compress: {
          warnings: false
        }
      },
      sourceMap: config.build.productionSourceMap,
      cache: true,
      parallel: true
      // Enable parallelization.
      // Default number of concurrent runs: os.cpus().length - 1
    }),
    // extract css into its own file
    new ExtractTextPlugin({
      filename: utils.assetsPath('css/[name].[contenthash].css'),
      // Setting the following option to `false` will not extract CSS from codesplit chunks.
      // Their CSS will instead be inserted dynamically with style-loader when the codesplit chunk has been loaded by webpack.
      // It's currently set to `true` because we are seeing that sourcemaps are included in the codesplit bundle as well when it's `false`,
      // increasing file size: https://github.com/vuejs-templates/webpack/issues/1110
      allChunks: true,
    }),
    // Compress extracted CSS. We are using this plugin so that possible
    // duplicated CSS from different components can be deduped.
    new OptimizeCSSPlugin({
      cssProcessorOptions: config.build.productionSourceMap
        ? { safe: true, map: { inline: false } }
        : { safe: true }
    }),
    {{#if multipage}}
    new MultipageWebpackPlugin({
      htmlTemplatePath: function (entryKey) {
        return layoutConf[entryKey] || layoutConf.base
      },
      templateFilename: '[name].html',
      templatePath: './',
      htmlWebpackPluginOptions: {
        minify: {
          // removeComments: true,
          // collapseInlineTagWhitespace: true,
          // decodeEntities: true,
          // conservativeCollapse: true,
          // removeScriptTypeAttributes: true,
          collapseWhitespace: true,
          // removeAttributeQuotes: true,
          minifyCSS: true,
          minifyJS: true
        },
        inject: true,
        templateChunks: false,
        apiServer: process.env.npm_config_pro ?
          config.build.proApiServer : config.build.testApiServer,
        favicon: './favicon.png',
        hash: process.env.NODE_ENV === 'production',
        appMountId: 'app',
        googleAnalytics: {
          trackingId: 'UA-XXXX-XX',
          pageViewOnLoad: true
        }
      }
    }),
    {{else}}
    // generate dist index.html with correct asset hash for caching.
    // you can customize output by editing /index.html
    // see https://github.com/ampedandwired/html-webpack-plugin
    new HtmlWebpackPlugin({
      filename: process.env.NODE_ENV === 'testing'
        ? 'index.html'
        : config.build.index,
      template: './src/layout/base.tpl',
      inject: true,
      favicon: './favicon.png',
      apiServer: process.env.npm_config_pro ?
        config.build.proApiServer : config.build.testApiServer,
      hash: process.env.NODE_ENV === 'production',
      appMountId: 'app',
      googleAnalytics: {
        trackingId: 'UA-XXXX-XX',
        pageViewOnLoad: true
      },
      minify: {
        removeComments: true,
        collapseWhitespace: true,
        removeAttributeQuotes: true
        // more options:
        // https://github.com/kangax/html-minifier#options-quick-reference
      },
      // necessary to consistently work with multiple chunks via CommonsChunkPlugin
      chunksSortMode: 'dependency'
    }),

    {{/if}}
    // keep module.id stable when vendor modules does not change
    new webpack.HashedModuleIdsPlugin(),
    // enable scope hoisting
    new webpack.optimize.ModuleConcatenationPlugin(),
    {{#unless multipage}}
    // split vendor js into its own file
    // https://medium.com/webpack/webpack-bits-getting-the-most-out-of-the-commonschunkplugin-ab389e5f318
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks(module) {
        // any required modules inside node_modules are extracted to vendor
        return (
          module.resource &&
          /\.js$/.test(module.resource) &&
          module.resource.indexOf(
            path.join(__dirname, '../node_modules')
          ) === 0
        )
      }
    }),
    // extract webpack runtime and module manifest to its own file in order to
    // prevent vendor hash from being updated whenever app bundle is updated
    new webpack.optimize.CommonsChunkPlugin({
      name: 'manifest',
      minChunks: Infinity
    }),
    // This instance extracts shared chunks from code splitted chunks and bundles them
    // in a separate chunk, similar to the vendor chunk
    // see: https://webpack.js.org/plugins/commons-chunk-plugin/#extra-async-commons-chunk
    new webpack.optimize.CommonsChunkPlugin({
      name: 'app',
      async: 'vendor-async',
      children: true,
      minChunks: 3
    }),
    // // split echarts into its own file
    // new webpack.optimize.CommonsChunkPlugin({
    //   async: 'echarts',
    //   minChunks(module) {
    //     var context = module.context;
    //     return context && (context.indexOf('echarts') >= 0 || context.indexOf('zrender') >= 0);
    //   }
    // }),
    {{/unless}}
    new FileManagerPlugin({
      onStart: {
        mkdir: [
          './releases/'
        ],
      },
      onEnd: {
        copy: [
          { source: './static/**/*', destination: './dist/static' }
          // { source: '/path/**/*.{html,js}', destination: '/path/to' },
          // { source: '/path/{file1,file2}.js', destination: '/path/to' },
          // { source: '/path/file-[hash].js', destination: '/path/to' }
        ],
        // move: [
        //   { source: '/path/from', destination: '/path/to' },
        //   { source: '/path/fromfile.txt', destination: '/path/tofile.txt' }
        // ],
        // delete: [
        //   '/path/to/file.txt',
        //   '/path/to/directory/'
        // ],
        // mkdir: [
        //   '/path/to/directory/',
        //   '/another/directory/'
        // ],
        archive: [
          { source: './dist', destination: `./releases/dist-${releaseName}.zip` }
          // { source: '/path/**/*.js', destination: '/path/to.zip' },
          // { source: '/path/fromfile.txt', destination: '/path/to.zip' },
          // { source: '/path/fromfile.txt', destination: '/path/to.zip', format: 'tar' },
          // {
          //   source: '/path/fromfile.txt',
          //   destination: '/path/to.tar.gz',
          //   format: 'tar',
          //   options: {
          //     gzip: true,
          //     gzipOptions: {
          //       level: 1
          //     }
          //   }
          // }
        ]
      }
    })

    // https://github.com/webpack-contrib/copy-webpack-plugin
    //
    // copy custom static assets
    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../static'),
    //     to: config.build.assetsSubDirectory,
    //     ignore: ['.*']
    //   }
    // ]),

    // new CopyWebpackPlugin([
    //   {
    //     from: path.resolve(__dirname, '../Web.config'),
    //     to: config.build.assetsRoot,
    //   }
    // ])

  ]
})

if (config.build.productionGzip) {
  const CompressionWebpackPlugin = require('compression-webpack-plugin')

  webpackConfig.plugins.push(
    new CompressionWebpackPlugin({
      asset: '[path].gz[query]',
      algorithm: 'gzip',
      test: new RegExp(
        '\\.(' +
        config.build.productionGzipExtensions.join('|') +
        ')$'
      ),
      threshold: 10240,
      minRatio: 0.8
    })
  )
}

if (config.build.bundleAnalyzerReport) {
  const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin
  webpackConfig.plugins.push(new BundleAnalyzerPlugin())
}

module.exports = webpackConfig

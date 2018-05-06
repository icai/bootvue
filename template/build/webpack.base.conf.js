'use strict'
const path = require('path')
const utils = require('./utils')
const config = require('../config')

const dllConfig = require('../config/dll.conf')
const glob = require('glob')
const vueLoaderConfig = require('./vue-loader.conf')
const webpack = require('webpack')
const CommonsChunkPlugin = require('webpack/lib/optimize/CommonsChunkPlugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const AutoDllPlugin = require('autodll-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')

const isProduction = process.env.NODE_ENV === 'production'
const sourceMapEnabled = isProduction
  ? config.build.productionSourceMap
  : config.dev.cssSourceMap

// const HtmlWebpackInlineSourcePlugin = require('html-webpack-inline-source-plugin')

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

{{#lint}}
const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})
{{#happypack}}
const createHappyPackLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'happypack/loader?id=eslint',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')]
})
{{/happypack}}
{{/lint}}



const globEntries = (globPath) => {
  const entries = {}
  glob.sync(globPath, {root: path.resolve(__dirname, '../')}).forEach(path => {
    const chunk = path.split('./src/pages/')[1].split(/\/app\.js/)[0]
    entries[chunk] = path
  })
  return entries
}


module.exports = {
  context: path.resolve(__dirname, '../'),
  {{#if multipage}}
  entry: !isProduction ? {
    app: './src/main.js'
  } : globEntries('./src/pages/**/app.@(js)'),
  {{else}}
  entry: {
    app: './src/main.js'
  },
  {{/if}}
  output: {
    path: config.build.assetsRoot,
    filename: 'assets/js/[name].js',
    publicPath: process.env.NODE_ENV === 'production'
      ? config.build.assetsPublicPath
      : config.dev.assetsPublicPath
  },
  resolve: {
    extensions: ['.js', '.jsx', '.vue', '.json'],
    alias: {
      {{#if_eq build "standalone"}}
      'vue$': 'vue/dist/vue.esm.js',
      {{/if_eq}}
      '@': resolve('src'),
      src: resolve('src')
    }
  },
  module: {
    rules: [
      {{#lint}}
	  {{#if happypack}}
      ...(config.dev.useEslint ? [createHappyPackLintingRule()] : []),
	  {{else}}
	  ...(config.dev.useEslint ? [createLintingRule()] : []),
	  {{/if}}
      {{/lint}}
	  {{#if happypack}}      {
        test: /\.vue$/,
        loader: 'happypack/loader?id=vue'
      },
      {
        test: /\.(js|jsx)$/,
        loader: 'happypack/loader?id=js',
        exclude: /(node_modules|packages)/,
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')],
      },
	  {{else}}
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
	  {{/if}}
	  {{#svgsprite}}
      {
        test: /\.svg$/,
        loader: 'svg-sprite-loader',
        include: [resolve('src/icons')],
        options: {
          symbolId: 'icon-[name]'
        }
      },
	  {{/svgsprite}}
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        {{#svgsprite}}exclude: [resolve('src/icons')],{{/svgsprite}}
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      }
	  {{#htmlloader}}
      // see https://github.com/jantimon/html-webpack-plugin/blob/master/docs/template-option.md
      ,{
        test: /\.html$/,
        use: [{
          loader: 'html-loader',
          options: {
            root: resolve('src'),
            attrs: ['img:src', 'link:href']
          }
        }]
      }
	 {{/htmlloader}}
    ]
  },
  node: {
    // prevent webpack from injecting useless setImmediate polyfill because Vue
    // source contains it (although only uses it if it's native).
    setImmediate: false,
    // prevent webpack from injecting mocks to Node native modules
    // that does not make sense for the client
    dgram: 'empty',
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
    child_process: 'empty'
  }
}

module.exports.plugins = [
{{#happypack}}
  utils.createHappyPlugin('eslint', [{
    loader: 'eslint-loader',
    // here you can place eslint-loader options:
    options: {
      formatter: require('eslint-friendly-formatter'),
      emitWarning: true || !config.dev.showEslintErrorsInOverlay
    }
  }]),
  utils.createHappyPlugin('js', [
    {
      loader: 'babel-loader',
      options: {
        cacheDirectory: true
      }
    }
  ]),
  utils.createHappyPlugin('vue', [
    {
      loader: 'vue-loader',
      options: {
        loaders: {
          ...utils.happyVueStyleLoaders({ extract: isProduction}),
          js: {
            loader: 'babel-loader',
            options: {
              cacheDirectory: true
            }
          }
        },
        cssSourceMap: sourceMapEnabled,
        cacheBusting: config.dev.cacheBusting,
        transformToRequire: {
          video: ['src', 'poster'],
          source: 'src',
          img: 'src',
          image: 'xlink:href'
        }
      }
    }
  ]),
{{/happypack}}
{{#usedll}}
  new AutoDllPlugin({
    inject: true, // will inject the DLL bundles to index.html
    filename: '[name].[hash:5].js',
    path: './dll',
    entry: dllConfig,
    plugins:[
      new webpack.ProvidePlugin({
        $: 'jquery',
        jQuery: 'jquery'
      }),
      new UglifyJsPlugin({
        uglifyOptions: {
          compress: isProduction ? {
            warnings: false
          } : false
        },
        sourceMap: config.build.productionSourceMap,
        cache: true,
        parallel: true
        // Enable parallelization.
        // Default number of concurrent runs: os.cpus().length - 1
      })
    ]
  }),
{{/usedll}}
{{#jquery}}
  new webpack.ProvidePlugin({
    $: 'jquery',
    jQuery: 'jquery'
  })
{{/jquery}}
];




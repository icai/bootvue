'use strict'
const path = require('path')
const os = require('os')
const HappyPack = require('happypack')
const config = require('../config')
const ExtractTextPlugin = require('extract-text-webpack-plugin')
const packageConfig = require('../package.json')


exports.getDate = function (date, cutlen = 8) {
  if (!(date instanceof Date)) {
    cutlen = date;
    date = new Date();
  }
  var arr = [date.getMonth() + 1, date.getDate(), date.getHours(), date.getMinutes(), date.getMilliseconds()];
  for (var i = 0, len = arr.length; i < len; i++) {
    var sl = ("" + arr[i]).length;
    if (i == len - 1) {
      if (sl < 3) {
        arr[i] = "0".repeat(3 - sl) + arr[i];
      }
    } else {
      if (sl == 1) {
        arr[i] = "0" + arr[i];
      }
    }
  }
  return ('' + date.getFullYear() + arr.join('')).slice(0, cutlen);
}

exports.assetsPath = function (_path) {
  const assetsSubDirectory = process.env.NODE_ENV === 'production'
    ? config.build.assetsSubDirectory
    : config.dev.assetsSubDirectory

  return path.posix.join(assetsSubDirectory, _path)
}

exports.cssLoaders = function (options) {
  options = options || {}

  const cssLoader = {
    loader: 'css-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  const postcssLoader = {
    loader: 'postcss-loader',
    options: {
      sourceMap: options.sourceMap
    }
  }

  // generate loader string to be used with extract text plugin
  function generateLoaders (loader, loaderOptions) {
    const loaders = options.usePostCSS ? [cssLoader, postcssLoader] : [cssLoader]

    if (loader) {
      loaders.push({
        loader: loader + '-loader',
        options: Object.assign({}, loaderOptions, {
          sourceMap: options.sourceMap
        })
      })
    }

    // Extract CSS when that option is specified
    // (which is the case during production build)
    if (options.extract) {
      return ExtractTextPlugin.extract({
        use: loaders,
        fallback: 'vue-style-loader'
      })
    } else {
      return ['vue-style-loader'].concat(loaders)
    }
  }

  // https://vue-loader.vuejs.org/en/configurations/extract-css.html
  return {
    css: generateLoaders(),
    postcss: generateLoaders(),
    less: generateLoaders('less'),
    sass: generateLoaders('sass', { indentedSyntax: true }),
    scss: generateLoaders('sass'),
    stylus: generateLoaders('stylus'),
    styl: generateLoaders('stylus')
  }
}

// Generate loaders for standalone style files (outside of .vue)
exports.styleLoaders = function (options) {
  const output = []
  const loaders = exports.cssLoaders(options)

  for (const extension in loaders) {
    const loader = loaders[extension]
    output.push({
      test: new RegExp('\\.' + extension + '$'),
      use: loader
    })
  }

  return output
}

exports.createNotifierCallback = () => {
  const notifier = require('node-notifier')

  return (severity, errors) => {
    if (severity !== 'error') return

    const error = errors[0]
    const filename = error.file && error.file.split('!').pop()

    notifier.notify({
      title: packageConfig.name,
      message: severity + ': ' + error.name,
      subtitle: filename || '',
      icon: path.join(__dirname, 'logo.png')
    })
  }
}


const matchOperatorsRe = /[|\\{}()[\]^$+*?.]/g

exports.escapeStringRegexp =  (str) => {
  if (typeof str !== 'string') {
    throw new TypeError('Expected a string');
  }
  return str.replace(matchOperatorsRe, '\\$&');
};

// HappyPack plugins
const happyThreadPool = HappyPack.ThreadPool({ size: os.cpus().length })

const createHappyPlugin = (id, loaders) => new HappyPack({
  id,
  loaders,
  threadPool: happyThreadPool,
  verbose: false
})

const styleLanguageList = (options)=>{
  let r = [
    {
      language: 'css',
      suffix: 'css',
      happypackID: 'css',
      loaders: []
    },
    {
      language: 'scss',
      suffix: 'scss',
      happypackID: 'scss',
      loaders: ['sass']
    },
    {
      language: 'sass',
      suffix: 'sass',
      happypackID: 'scss',
      loaders: ['sass']
    }, {
      language: 'less',
      suffix: 'less',
      happypackID: 'less',
      loaders: ['less']
    }
    // ,
    // {
    //   language: 'stylus',
    //   suffix: 'styl',
    //   happypackID: 'stylus',
    //   loaders: ['css', 'stylus']
    // }
  ]
  if (options.usePostCSS) {
    r = r.map(item=> {
      item.loaders = ['css', 'postcss'].concat(item.loaders)
      return item;
    })
  } else {
    r = r.map(item => {
      item.loaders = ['css'].concat(item.loaders)
      return item;
    })
  }
  return r;
}



const getStyleQuery = (options)=>{
  return {
    style: {},
    postcss: { sourceMap: options.sourceMap },
    css: { sourceMap: options.sourceMap },
    less: {},
    stylus: {},
    sass: {},
    scss: {}
  }
}

const happyStyleLoaders = (options)=>{
  let styleQuery = getStyleQuery(options)
  let r = styleLanguageList(options).map(v => {
    if (options.extract) {
      return {
        test: new RegExp(`\\.${v.suffix}$`),
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: v.loaders.map(v => ({
            loader: `${v}-loader`,
            options: styleQuery[v]
          }))
        })
      }
    } else {
      return {
        test: new RegExp(`\\.${v.suffix}$`),
        use: [`happypack/loader?id=${v.happypackID}`]
      }
    }
  })
  return r;
}

// vue style loaders
const happyVueStyleLoaders = (options)=>{
  let styleQuery = getStyleQuery(options)
  let r = styleLanguageList(options).reduce((prev, cur) => {
    if (options.extract) {
      prev[cur.language] = ExtractTextPlugin.extract({
        fallback: 'vue-style-loader',
        use: cur.loaders.map(v => ({
          loader: `${v}-loader`,
          options: styleQuery[v]
        }))
      })
    } else {
      prev[cur.language] = ['vue-style', ...cur.loaders].map(v => `${v}-loader`)
    }
    return prev
  }, {})
  return r;

}



const happyStylePlugins = (options)=> {
  let styleQuery = getStyleQuery(options)
  let r = styleLanguageList(options).map(v => createHappyPlugin(v.language, ['vue-style', ...v.loaders].map(v => ({
    path: `${v}-loader`,
    query: styleQuery[v]
  }))))
  return r;

}

exports.createHappyPlugin = createHappyPlugin;
exports.happyVueStyleLoaders = happyVueStyleLoaders;
exports.happyStyleLoaders = happyStyleLoaders;
exports.happyStylePlugins = happyStylePlugins;


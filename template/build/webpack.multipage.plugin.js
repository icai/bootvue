// based https://github.com/mutualofomaha/multipage-webpack-plugin
// https://github.com/mutualofomaha/multipage-webpack-plugin/blob/master/src/plugin.js
const glob = require('glob')
const webpack = require("webpack");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const SingleEntryPlugin = require('webpack/lib/SingleEntryPlugin');
// const TemplatedPathPlugin = require("webpack/lib/TemplatedPathPlugin");
const path = require("path");
const watch = require('glob-watcher');
const TEMPLATED_PATH_REGEXP_NAME = /\[name\]/gi;

function setPluginOptions (pluginOptions) {
  const {
    sharedChunkName,
    vendorChunkName,
    inlineChunkName,
    bootstrapFilename,
    templateFilename,
    templatePath,
    htmlTemplatePath,
    globEntry,
    htmlWebpackPluginOptions
  } = pluginOptions

  return {
    globEntry: globEntry || '',
    sharedChunkName: sharedChunkName || 'shared',
    vendorChunkName: vendorChunkName || 'vendor',
    inlineChunkName: inlineChunkName || 'manifest',
    bootstrapFilename: bootstrapFilename || 'manifest.chunk.js',
    templateFilename: templateFilename || 'index.html',
    templatePath: templatePath || 'templates/[name]',
    htmlTemplatePath: htmlTemplatePath || undefined,
    htmlWebpackPluginOptions: htmlWebpackPluginOptions || {}
  };
}

class MultipageWebpackPlugin {
  constructor (pluginOptions = {}) {
    Object.assign(this, setPluginOptions(pluginOptions))
  }

  getFullTemplatePath (entryKey) {
    let [appliedTemplatedPath, appliedTemplatedFilename] = [this.templatePath,this.templateFilename]
      .map(pathStr => pathStr.replace(TEMPLATED_PATH_REGEXP_NAME, `${entryKey}`));

    return path.join(appliedTemplatedPath, appliedTemplatedFilename);
  }

  globEntries (globPath) {
    const entries = {}
    glob.sync(globPath, {root: path.resolve(__dirname, '../')}).forEach(path => {
      const chunk = path.split('./src/pages/')[1].split(/\/app\.js/)[0]
      entries[chunk] = path
    })
    return entries
  }

  apply (compiler) {
    let {options: webpackConfigOptions} = compiler;

    let entrys = this.globEntries('./src/pages/**/app.@(js)') //webpackConfigOptions.entry
    let entriesToCreateTemplatesFor = Object
      .keys(entrys)
      .filter(entry => !~['lib', 'vendor'].indexOf(entry));

    entriesToCreateTemplatesFor.forEach((entryKey) => {
      let htmlWebpackPluginOptions = {
        filename: this.getFullTemplatePath(entryKey),
        chunksSortMode: 'dependency',
        // build need manifest chunk
        chunks: ['manifest', 'app', entryKey, this.sharedChunkName]
      };
      if (typeof this.htmlTemplatePath !== "undefined") {
        if(typeof this.htmlTemplatePath === 'string') {
          htmlWebpackPluginOptions.template = this.htmlTemplatePath.replace(TEMPLATED_PATH_REGEXP_NAME, `${entryKey}`);
        } else if (typeof this.htmlTemplatePath === 'function') {
          htmlWebpackPluginOptions.template = this.htmlTemplatePath.call(null, entryKey);
        }
      }
      let htmlConfig = Object.assign({}, this.htmlWebpackPluginOptions, htmlWebpackPluginOptions)
      compiler.apply(
        new HtmlWebpackPlugin(htmlConfig)
      );
    });


    compiler.apply(
      new webpack.optimize.CommonsChunkPlugin({
        name: "shared",
        minChunks: entriesToCreateTemplatesFor.length || 3,
        chunks: entrys
      }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: "lib",
      //   minChunks: Infinity,
      //   chunks: ["lib"]
      // }),
      // new webpack.optimize.CommonsChunkPlugin({
      //   name: "vendor",
      //   minChunks: Infinity,
      //   chunks: ["vendor"]
      // }),
      new webpack.optimize.CommonsChunkPlugin({
        name: "manifest",
        // filename: this.bootstrapFilename,
        minChunks: Infinity
      })
    );
  }
}
module.exports = MultipageWebpackPlugin;

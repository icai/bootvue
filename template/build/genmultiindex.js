const file = require('./file')
const glob = require('glob')
const path = require('path')


const globEntries = (globPath) => {
  const entries = {}
  glob.sync(globPath, { root: path.resolve(__dirname, '../') }).forEach(path => {
    const chunk = path.split('./src/pages/')[1].split(/\/app\.vue/)[0]
    entries[chunk] = path
  })
  return entries
}

const routes = globEntries('./src/pages/**/app.@(vue)');
for (const key in routes) {
  if (routes.hasOwnProperty(key)) {
    let template = `
    // dynamic generate by  build/genmultiindex.js
    // no need to modify
    import Page from 'src/base/page'
    import App from './app.vue'
    let pageview = Page(App)
    pageview.$on('pageviewCreate', ()=>{
      pageview.$mount('#app');
      pageview.$emit('pageviewCreated');
    })
    `
    file.writeFileSync(path.resolve(__dirname, '../', routes[key].replace('app.vue', 'app.js')), template);
  }
}
console.info('multi page index done')




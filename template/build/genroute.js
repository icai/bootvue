const file = require('./file')
const glob = require('glob')
const path = require('path')


const globEntries = (globPath) => {
  const entries = {}
  glob.sync(globPath, { root: path.resolve(__dirname, '../') }).forEach(path => {
    const chunk = path.split('./src/pages/')[1].split(/\/app\.vue/)[0]
    // if (!/^(setting|order|stock\/|stockin)/.test(chunk)){ //
    // }
    entries[chunk] = path
  })
  return entries
}


// const routes = { 'home/cang': '../src/pages/home/cang/app.vue',
//   'home/center': '../src/pages/home/center/app.vue',
//   'home/sharestore': '../src/pages/home/sharestore/app.vue',
//   index: '../src/pages/index/app.vue',
//   login: '../src/pages/login/app.vue',
// }

const routes = globEntries('./src/pages/**/app.@(vue)');

let template = `
// this file dynamic generate
// by build/genroute.js

const routes = {
`
for (const key in routes) {
  if (routes.hasOwnProperty(key)) {
    template +=
    `
      '${key}': ()=> {
        return import(
          /* webpackChunkName: "${key}" */
          '${routes[key].replace('./', '')}'
        )
      },
    `
  }
}

template +=
`
  }
export default routes
`
file.writeFileSync(path.resolve(__dirname, '../', 'src/router/main.js'),template);
console.info('done')




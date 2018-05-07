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

// const routes = {
//   index: '../src/pages/index/app.vue',
// }

module.exports = ()=>{
  const routes = globEntries('./src/pages/**/app.@(vue)');

  let template = `
// this file dynamic generate
// by bin/genroute.js

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
  file.writeFileSync(path.resolve(__dirname, '../', 'src/routers/main.js'), template);
  console.info('routes generate done')

}

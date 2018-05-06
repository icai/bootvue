{{#if multipage}}
import Page from 'src/base/page'
import routes from 'src/router/main.js'

const getRoute = (pathname, routes) => {
  let p = pathname.replace(/\.html$/, '');
  if (p == '/') {
    return routes['index']
  } else {
    return routes[p.replace(/^\//, '')]
  }
}
const main = () => {
  const pathname = window.location.pathname
  let realroute = getRoute(pathname, routes)
  if (realroute) {
    realroute().then(page => {
      let pageview = Page(page.default ? page.default : page)
      pageview.$on('pageviewCreate', () => {
        pageview.$mount('#app');
        pageview.$emit('pageviewCreated');
      })
    })
  }
}
main()
{{else}}
{{#if_eq build "standalone"}}
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
{{/if_eq}}
import Vue from 'vue'
import App from './app'
{{#router}}
import router from './router'
{{/router}}

Vue.config.productionTip = false

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  {{#router}}
  router,
  {{/router}}
  {{#if_eq build "runtime"}}
  render: h => h(App)
  {{/if_eq}}
  {{#if_eq build "standalone"}}
  template: '<App/>',
  components: { App }
  {{/if_eq}}
})

{{/if}}





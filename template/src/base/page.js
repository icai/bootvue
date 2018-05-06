import Vue from 'vue'

let BaseViewMixins = [{

  beforeCreate() {
    setTimeout(() => {
      this.$emit('pageviewCreate');
    }, 0);
  },
  created: function () {
    if (this.initView) {
      let oldInitView = this.initView;
      // override methods
      this.initView = () => {
        this.$on('pageviewCreated', () => {
          oldInitView.call(this);
        })
      }
    }
  }
}];

function broadcast(componentName, eventName, params) {
  this.$children.forEach(child => {
    const name = child.$options.name;

    if (name === componentName) {
      child.$emit.apply(child, [eventName].concat(params));
    } else {
      broadcast.apply(child, [componentName, eventName].concat([params]));
    }
  });
}

const Page = function (options) {

  // mixins
  var VuePlugin = {};
  // VuePlugin.install = function (Vue, options) {
  //   var vueFilters = {
  //     lineBreak: function (val) {
  //       return val.replace(/(\/r\/n){1,}/g, '<br>')
  //     }
  //   };
  //   _.each(vueFilters, function (key, value) {
  //     Vue.filter(key, function (arg) {
  //       return value.apply(null, arguments);
  //     })
  //   });
  // }

  // Vue.use(VuePlugin);

  var CustomVue = Vue.extend({
    mixins: [...BaseViewMixins, {
      methods: {
        $broadcast(componentName, eventName, params) {
          broadcast.call(this, componentName, eventName, params);
        }
      }
    }]
    // store: store
  });
  return new CustomVue(options);
};

export default Page;

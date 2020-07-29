import Vue from 'vue'
import Router from 'vue-router'
import config from 'static/js/config.js'
Vue.use(Router)
export default new Router({
  mode: 'history',
  routes: [{
      path: config.root,
      redirect: {
        name: 'okchain'
      },
    },
   {
      path: config.root + '/okchain',
      name: 'okchain',
      component: resolve => require(['@/components/okchain'], resolve)
    },
  ]
})

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import vueResource from 'vue-resource'
import i18n from 'static/js/i18n'
import webUtil from 'static/js/util'
import globalData from 'static/js/config.js'
import webCoin from 'static/js/coinUnit.js'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'static/css/index.css'
import clipboard from 'vue-clipboard2'
import { Alert, Confirm, Toast, Loading } from "wc-messagebox";
import "wc-messagebox/style.css";
import webLogin from 'static/js/login.js'
import axios from "axios"

Vue.config.productionTip = false
Vue.use(clipboard)
Vue.use(vueResource)

/*注册到vue原型上*/
Vue.prototype.globalData = globalData;
Vue.prototype.axios = axios;
Vue.prototype.webUtil = webUtil;
Vue.prototype.webCoin = webCoin;
Vue.prototype.webLogin = webLogin;

var _hmt = _hmt || [];
(function() {
  var hm = document.createElement("script");
  hm.src = "https://hm.baidu.com/hm.js?7fef4ab83184663a4dee3238bed896da";
  var s = document.getElementsByTagName("script")[0];
  s.parentNode.insertBefore(hm, s);
})();


/* eslint-disable no-new */
var vue1 = new Vue({
  el: '#app',
  i18n,
  router,
  components: { App },
  template: '<App/>'
})

Vue.use(Alert, {
  title: vue1.$t('prompt'),
  btnText: 'OK'
});
Vue.use(Confirm, {
  title: vue1.$t('Confirm'),
});
Vue.use(Toast, {
  location: 'bottom',
  toastStyle: {
    height: '60px',
    width: '160px',
    fontSize: '16px'
  },
});
Vue.use(Loading);

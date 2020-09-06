import Vue from 'vue'
import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import axios from 'axios'
import VueAxios from 'vue-axios'
import App from './App.vue'
import router from './router/index.js'
import webUtil from './util.js'
import './js/store'

Vue.config.productionTip = false

Vue.prototype.webUtil = webUtil;

// load element UI
Vue.use(ElementUI);
Vue.use(VueAxios, axios)

new Vue({
  router,
  render: h => h(App),
}).$mount('#app')

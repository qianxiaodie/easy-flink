import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import mixin from './mixin.ts'
import moment from 'moment'
import './scss/index.scss'

import 'moment/locale/zh-cn'
moment.locale('zh-cn')

import Antdui, { message, confirm } from 'ant-design-vue';

Vue.use(Antdui);

import 'ant-design-vue/dist/antd.css';

Vue.prototype.$message = message;
Vue.prototype.$confirm = confirm;

Vue.mixin(mixin)
Vue.prototype.$moment = moment

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App),
}).$mount('#app')

import Vue from 'vue'
import overview from './views/overview/index.vue'
import store from './store'
import moment from 'moment'
import '@/utils/request'

import 'moment/locale/zh-cn'

import mixin from './mixin'
Vue.mixin(mixin)

moment.locale('zh-cn')

Vue.config.productionTip = false

new Vue({
  store,
  render: h => h(overview)
}).$mount('#app')

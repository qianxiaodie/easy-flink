import Vue from 'vue'
import elk from './views/operation/elk.vue'
import moment from 'moment'
import '@/utils/request'

import 'moment/locale/zh-cn'

import mixin from './mixin'
Vue.mixin(mixin)

moment.locale('zh-cn')

Vue.config.productionTip = false

new Vue({
  render: h => h(elk)
}).$mount('#app')

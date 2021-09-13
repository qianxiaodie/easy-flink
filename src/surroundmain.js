import Vue from 'vue';
import surround from './views/operation/components/detail/surrounding.vue';
import moment from 'moment';
import '@/utils/request';

import 'moment/locale/zh-cn';

import mixin from './mixin';
Vue.mixin(mixin);

moment.locale('zh-cn');

Vue.config.productionTip = false;

new Vue({
  render: h => h(surround)
}).$mount('#app');

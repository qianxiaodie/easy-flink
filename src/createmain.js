import Vue from 'vue';
import createproject from './views/develop/components/git-project';
import moment from 'moment';
import '@/utils/request';
import store from './store';

import 'moment/locale/zh-cn';

Vue.mixin(mixin);

moment.locale('zh-cn');

Vue.config.productionTip = false;

new Vue({
  store,
  render: h => h(createproject)
}).$mount('#app');

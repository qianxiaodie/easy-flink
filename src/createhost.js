import Vue from 'vue';

import createproject from './views/develop/components/git-project';
import moment from 'moment';
import '@/utils/request';
import 'moment/locale/zh-cn';
import store from './store';

import vueBridge from '@/utils/vueBridge';

import createContextMenu from '@components/context-menu';

import { DatePicker, Switch, LocaleProvider, Popover } from 'ndc-antd';
import 'ndc-antd/style.js';
import Antd, { message } from 'ant-design-vue';

import 'ant-design-vue/dist/antd.css';
import '../sloth-ndc-ui/packages/theme-chalk/src/index.scss';
import {
  Button,
  Radio,
  Checkbox,
  Form,
  FormItem,
  Modal,
  Select,
  Dropdown,
  MessageBox,
  Tabs,
  TabPanel,
  Tree,
  Tooltip,
  VirtualList,
  File,
  Table,
  TableFilter,
  TableOrder,
  TableEmpty,
  TableLink,
  Pagination,
  Loading,
  Clipboard
} from '../sloth-ndc-ui/packages/index.js';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
Vue.use(ElementUI);

Vue.use(Antd);
// new Vue({
//   render: h => h(createproject)
// }).$mount('#HTAI_CREACTE_PROJECT_CONTAINER_REALTIME');

Vue.use(Button);
Vue.use(Radio);
Vue.use(Checkbox);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Modal);
Vue.use(Select);
Vue.use(Dropdown);
Vue.use(Tabs);
Vue.use(TabPanel);
Vue.use(Tree);
Vue.use(Tooltip);
Vue.use(VirtualList);
Vue.use(File);
Vue.use(Table);
Vue.use(TableFilter);
Vue.use(TableOrder);
Vue.use(TableEmpty);
Vue.use(TableLink);
Vue.use(Pagination);
Vue.use(Loading);
Vue.use(Clipboard);

Vue.use(DatePicker);
Vue.use(Switch);
Vue.use(LocaleProvider);
Vue.use(Popover);

Vue.prototype.$ndcmessage = message;
Vue.prototype.$ndcconfirm = MessageBox.confirm;
Vue.prototype.$contextmenu = createContextMenu;

moment.locale('zh-cn');

Vue.config.productionTip = false;

const vueLifecycles = vueBridge({
  Vue,
  appOptions: {
    store,
    render: h => h(createproject),
    el: '#HTAI_CREACTE_PROJECT_CONTAINER_REALTIME'
  }
});

const lifeCycles = {
  bootstrap: vueLifecycles.bootstrap,
  mount: vueLifecycles.mount,
  unmount: vueLifecycles.unmount
};

const app = {
  lifeCycles,
  setHost: host => {
    if (host.subscribe && host.getState) {
      store.commit("SYNC_HOST", host.getState());
      host.subscribe(() => {
        console.log('SYNC_HOST', host.getState());
        store.commit("SYNC_HOST", host.getState());
      });
    }
  }
};

window.sloth_create = app;

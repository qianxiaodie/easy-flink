import Vue from 'vue'

import overview from './views/overview/index.vue';
import store from './store';
import moment from 'moment';
import '@/utils/request';
import 'moment/locale/zh-cn';

import vueBridge from '@/utils/vueBridge';

import './components/index';
import './utils/validator';
import './utils/directive';
import './utils/editor';
import './utils/date';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

import createContextMenu from '@components/context-menu'

import { DatePicker, Switch, LocaleProvider, Popover, Spin } from 'ndc-antd'
import 'ndc-antd/style.js'

// import mixin from './mixin';
// Vue.mixin(mixin);
import Antd from 'ant-design-vue';

import 'ant-design-vue/dist/antd.css';



import '../sloth-ndc-ui/packages/theme-chalk/src/index.scss'
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
} from '../sloth-ndc-ui/packages/index.js'
import { message } from 'ant-design-vue'
Vue.use(Antd);
Vue.use(ElementUI)

Vue.use(Button)
Vue.use(Radio)
Vue.use(Checkbox)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Modal)
Vue.use(Select)
Vue.use(Dropdown)
Vue.use(Tabs)
Vue.use(TabPanel)
Vue.use(Tree)
Vue.use(Tooltip)
Vue.use(VirtualList)
Vue.use(File)
Vue.use(Table)
Vue.use(TableFilter)
Vue.use(TableOrder)
Vue.use(TableEmpty)
Vue.use(TableLink)
Vue.use(Pagination)
Vue.use(Loading)
Vue.use(Clipboard)

Vue.use(DatePicker)
Vue.use(Switch)
Vue.use(LocaleProvider)
Vue.use(Popover)
Vue.use(Spin)

Vue.prototype.$ndcmessage = message
Vue.prototype.$ndcconfirm = MessageBox.confirm
Vue.prototype.$contextmenu = createContextMenu

moment.locale('zh-cn')

Vue.config.productionTip = false


const vueLifecycles = vueBridge({
  Vue,
  appOptions: {
    store,
    render: h => h(overview)
  }
})

const lifeCycles = {
  bootstrap: vueLifecycles.bootstrap,
  mount: vueLifecycles.mount,
  unmount: vueLifecycles.unmount
}

const app = {
  lifeCycles,
  setHost: () => {} // 兼容目前bixbox注册函数
}

window.sloth_opera = app

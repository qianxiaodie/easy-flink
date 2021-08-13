import Vue from 'vue';
import Vuex from 'vuex';
// import { sensors } from '@lego/bigbox-utils';
import logConfig from '../config/log';

// const { createSensorsLoggerVue } = sensors;

// sensors.mergeConfig({
//   ...logConfig,
// });
Vue.use(Vuex);

const files = require.context('./', false, /\.ts$/);
const modules: any = {};

files.keys().forEach(key => {
  const fileName = key.replace(/(\.\/|\.ts)/g, '');
  if (fileName !== 'index') {
    modules[fileName] = files(key).default;
  }
});


export default new Vuex.Store({
  state:{
    host:{},
  },
  mutations:{
    SYNC_HOST: (state, payload: any) => {
      console.log('SYNC_HOST mutations', payload)
      state.host = payload
    },
  },
  modules
});
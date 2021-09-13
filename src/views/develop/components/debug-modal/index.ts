import Vue from 'vue';
import MDebugModal from './debug.vue';

const DebugModalInstance = Vue.extend(MDebugModal);

const createDebugModal = (): MDebugModal => {
  const debugModalInstance: any = new DebugModalInstance();

  debugModalInstance.vm = debugModalInstance.$mount();
  document.body.appendChild(debugModalInstance.vm.$el);

  return debugModalInstance.vm;
};

export default createDebugModal;

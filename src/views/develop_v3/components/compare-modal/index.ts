import Vue from 'vue';
import MCompareModal from './compare.vue';

const CompareModalConstructor = Vue.extend(MCompareModal);

const createCompareModal = (): MCompareModal => {
  const compareModalInstance: any = new CompareModalConstructor();

  compareModalInstance.vm = compareModalInstance.$mount();
  document.body.appendChild(compareModalInstance.vm.$el);

  return compareModalInstance.vm;
};

export default createCompareModal;

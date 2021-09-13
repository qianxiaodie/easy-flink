import Vue from 'vue';
import ModalMixin from '../modal/mixin';
import { NEW_MODAL_TYPE } from './constant';
import store from '@/store';

const getModalComp = async (type: number): Promise<any> => {
  switch (type) {
    case NEW_MODAL_TYPE.datasource:
      return import('./data-source.vue');
    case NEW_MODAL_TYPE.metadata:
      return import('./metadata.vue');
    case NEW_MODAL_TYPE.database:
      return import('./database.vue');
    default:
      return null;
  }
};

const createNewModalInstance = async (type: number): Promise<ModalMixin | null> => {
  const modalComp = await getModalComp(type);
  if (!modalComp) {
    return null;
  }

  const ModalConstructor: any = Vue.extend(modalComp.default);
  const modalInstance = new ModalConstructor({
    store
  });
  modalInstance.vm = modalInstance.$mount();
  document.body.appendChild(modalInstance.vm.$el);

  return modalInstance.vm;
};

export default createNewModalInstance;

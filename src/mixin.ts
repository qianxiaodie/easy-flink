import { Component, Vue } from 'vue-property-decorator';

import { request, handleException } from '@utils/request';
// import createModalInstance from './views/components/modal';
// import createNewModalInstance from './views/components/new-modal';

console.log('minxsminxs',request)

@Component
export default class GlobalMixin extends Vue {
  $request(key: string, data: any): Promise<any> {
    return request(key, data);
  }

  $handleException(e: Error, content?: string): void {
    return handleException(e, content);
  }

  // $createModalInstance(type: number) {
  //   return createModalInstance(type);
  // }

  // $createNewModalInstance(type: number) {
  //   return createNewModalInstance(type);
  // }
};

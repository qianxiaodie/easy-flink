import Vue, { VNode } from 'vue';

declare module 'vue/types/vue' {
  interface Vue {
    errors: any;
    $message: any;
    $confirm: any;
    $request(key: string, data?: any): Promise<any>;
    $handleException(e: Error, content?: string): void;
    $contextmenu(menuItems: IMenuItem[], callback: (item: IMenuItem, event: Event) => void): any;
    $createModalInstance(type: number): any;
    $createNewModalInstance(type: number): any;
    $route:any;
    $router: VueRouter
  }
}

declare global {
  namespace JSX {
    // tslint:disable no-empty-interface
    interface Element extends VNode {}
    // tslint:disable no-empty-interface
    interface ElementClass extends Vue {}
    interface IntrinsicElements {
      [elem: string]: any;
    }
  }
}

declare module '*.vue' {
  import Vue from 'vue';
  export default Vue;
}


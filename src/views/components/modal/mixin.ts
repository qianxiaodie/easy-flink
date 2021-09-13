import { Component, Vue } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';
import { cloneDeep } from 'lodash';

@Component
export default class ModalMixin extends Vue {
  @State('userId', MODULE_NAMESPACE.global)
  public userId!: string;

  public modalData: any = {};
  public visible: boolean = false;
  public confirm?: any;
  private errorElm?: any;
  private afterClose?: any;
  private loading: boolean = false;

  public mounted() {
    const modalElm = this.$el.getElementsByClassName('ndc-modal-main')[0];
    const errElm = document.createElement('div');
    errElm.className = 'm-modal-error';
    modalElm.appendChild(errElm);
    this.errorElm = errElm;
  }

  public show(data: any, callback?: any) {
    this.loading = false;
    this.showModal(data, callback);
  }

  public showModal(data: any, callback?: any) {
    this.modalData = data;
    this.confirm = callback;
    this.afterClose = data.afterClose;
    this.visible = true;

    this.$nextTick(() => {
      const dom = this.$el.getElementsByClassName('ndc-modal-content')[0];
      dom && (dom.scrollTop = 0);
      this.setError('');
      setTimeout(() => this.errors.clear(), 0);
    });
  }

  public hide() {
    this.$el && this.$el.parentNode && this.$el.parentNode.removeChild(this.$el);
    this.$destroy();
  }

  public setError(msg: string) {
    if (this.errorElm) {
      this.errorElm.textContent = msg;
      this.errorElm.title = msg;
    }
  }

  public async onConfirm(args?: any, validate: boolean = true) {
    this.setError('');

    const func = () => {
      if (this.confirm) {
        return this.confirm(cloneDeep(args || this.modalData));
      }
      return true;
    };

    if (!validate) {
      return func();
    }

    const valid = await this.$validator.validateAll();
    if (valid) {
      return func();
    }
    const dom = this.$el.getElementsByClassName('u-validator')[0];
    dom && dom.scrollIntoView();
    return false;
  }

  public onHide(args?: any) {
    this.visible = false;
    this.afterClose && this.afterClose(args);
  }

  public showLoading() {
    this.loading = true;
  }

  public hideLoading() {
    this.loading = false;
  }

  public removeValidatorError(field: string) {
    this.errors.remove(field);
  }

  public addValidatorError(field: string, msg: string) {
    this.removeValidatorError(field);
    this.errors.add({
      field,
      msg
    });
  }

  public clearValidateError() {
    this.$validator.pause();
    this.$nextTick(() => {
      this.errors.clear();
      this.$validator.fields.items.forEach(field => field.reset());
      this.$validator.fields.items.forEach(field => this.errors.remove(field));
      this.$validator.resume();
    });
  }

  public isPrd() {
    const arr = ["env", "sit", "prd"]
    // return false
    if (arr.indexOf((window as any).prduct_env) !== -1) {
      return true
    } else {
      return false
    }
  }

};

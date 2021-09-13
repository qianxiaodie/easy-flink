<template>
  <ndc-modal class="m-docking-modal" :title="modalData.isEdit ? '编辑对接人' : '添加对接人'" :visible="visible" @hide="onHide" :on-confirm="onModalConfirm">
    <ndc-form>
      <ndc-form-item label="产品名" required>
        <u-validator name="product" :validate="errors">
          <ndc-select
            name="product"
            placeholder="请选择产品"
            value-key="product"
            label-key="product"
            :options="productList"
            :searchable="true"
            v-model="modalData.product"
            :disabled="modalData.isEdit"
            v-validate="{
              required: '产品名'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="对接人" required>
        <u-validator name="contact" :validate="errors">
          <u-multi-select
            name="contact"
            value-key="email"
            label-key="name"
            :options="users"
            placeholder="请输入对接人"
            v-model="modalData.contact"
            v-validate="{
              required: '对接人'
            }"
          ></u-multi-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="报警接收方式">
        <u-validator name="receiveType" :validate="errors">
          <ndc-checkbox v-for="type in alarmTypes" :key="type.id" class="g-mr-24" :value="receiveType.includes(type.receiveType)" :label="type.receiveDesc" @change="onChangeType(arguments[0], type.receiveType)"></ndc-checkbox>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { IProduct, IUser } from '@utils/types';

@Component
export default class MDockingModal extends Mixins(ModalMixin) {
  private productList: IProduct[] = [];
  private users: IUser[] = [];
  private receiveType: string[] = [];
  private alarmTypes: any[] = [];

  public async show(data: any, callback?: any) {
    try {
      const contact = Array.isArray(data.contact) ? data.contact : (data.contact || '').split(',');
      const productRequest = this.$request('getProductList', { userId: this.userId });
      const userRequest = this.$request('getAlarmUsers');
      const alarmTypesRequest = this.$request('getAlarmTypes');
      this.productList = await productRequest;
      this.users = await userRequest;
      this.alarmTypes = await alarmTypesRequest;
      const value: IUser[] = [];
      this.users.forEach(u => {
        if (contact.includes(u.email)) {
          value.push(u);
        }
      });
      data.contact = value;
      const receiveTypes = this.alarmTypes.map(t => t.receiveType);
      this.receiveType = data.receiveType ? (data.receiveType || '').split(',') : receiveTypes;
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private onModalConfirm() {
    const valid = this.validate();
    if (!valid) {
      return false;
    }
    return this.onConfirm(Object.assign({}, this.modalData, {
      receiveType: (this.receiveType || []).join(',')
    }));
  }

  private validate(): boolean {
    if (this.receiveType.length) {
      this.removeValidatorError('receiveType');
      return true;
    }
    this.addValidatorError('receiveType', '请至少选择一项报警接收方式');
    return false;
  }

  private onChangeType(val: boolean, type: string) {
    const index = this.receiveType.findIndex(t => t === type);
    if (index === -1 && val) {
      this.receiveType.push(type);
    }
    if (index !== -1 && !val) {
      this.receiveType.splice(index, 1);
    }
  }
}
</script>

<style lang="scss">
.m-docking-modal {
  .u-validator {
    display: flex;
    align-items: center;
  }
}
</style>

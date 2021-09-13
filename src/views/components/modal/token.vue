<template>
  <ndc-modal class="m-token-modal" :title="modalData.isView ? '查看Token' : '添加Token'" :visible="visible" :cancel-button="modalData.isView ? '' : '取消'" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="产品名" required>
        <u-validator name="product" :validate="errors">
          <ndc-select
            name="product"
            placeholder="请选择产品"
            value-key="product"
            label-key="product"
            :searchable="true"
            :disabled="disabled"
            :options="productList"
            v-model="modalData.product"
            v-validate="{
              required: '产品名'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="申请人" required>
        <u-validator name="applier" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="applier"
            autocomplete="off"
            :disabled="disabled"
            v-model="modalData.applier"
            placeholder="请输入申请人"
            v-validate="{
              required: '申请人'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="申请描述" required>
        <u-validator name="description" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="description"
            autocomplete="off"
            :disabled="disabled"
            v-model="modalData.description"
            placeholder="请输入申请描述"
            v-validate="{
              required: '申请描述'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="生成结果" v-if="modalData.isView">
        <textarea
          class="ndc-textarea"
          name="secret"
          :disabled="disabled"
          v-model="modalData.secret"
          v-validate="{
            required: '生成结果'
          }"
        />
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { IProduct } from '@utils/types';

@Component
export default class MTokenModal extends Mixins(ModalMixin) {
  private productList: IProduct[] = [];

  private get disabled() {
    return !!this.modalData.isView;
  }

  public async show(data: any, callback?: any) {
    try {
      this.productList = await this.$request('getProductList', { userId: this.userId });
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }
}
</script>

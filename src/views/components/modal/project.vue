<template>
  <ndc-modal title="产品选择" :visible='visible' @hide="onHide" :width="480" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="产品名称" required>
        <u-validator name="product" :validate="errors">
          <ndc-select
            style="background: #fff;"
            name="product"
            value-key="key"
            label-key="title"
            placeholder="请选择产品"
            :searchable="true"
            :options="modalData.productList"
            v-model="modalData.product"
            v-validate="{
              required: '产品名称'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';

@Component
export default class MRenameModal extends Mixins(ModalMixin) {

}
</script>

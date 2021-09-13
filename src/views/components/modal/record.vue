<template>
  <ndc-modal class="m-record-modal" title="操作详情" :visible="visible" cancel-button="" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="方法名称">
        <input
          type="text"
          class="ndc-input"
          disabled
          :value="modalData.method"
        />
      </ndc-form-item>
      <ndc-form-item label="方法描述">
        <input
          type="text"
          class="ndc-input"
          disabled
          :value="modalData.methodDesc"
        />
      </ndc-form-item>
      <ndc-form-item label="操作人">
        <input
          type="text"
          class="ndc-input"
          disabled
          :value="modalData.operator"
        />
      </ndc-form-item>
      <ndc-form-item label="产品名称">
        <input
          type="text"
          class="ndc-input"
          disabled
          :value="modalData.product"
        />
      </ndc-form-item>
      <ndc-form-item label="调用时间">
        <input
          type="text"
          class="ndc-input"
          disabled
          :value="modalData.opTime"
        />
      </ndc-form-item>
      <ndc-form-item label="方法参数">
        <textarea
          class="ndc-textarea"
          disabled
          :value="modalData.opContent"
        />
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';

@Component
export default class MRecordModal extends Mixins(ModalMixin) {}
</script>

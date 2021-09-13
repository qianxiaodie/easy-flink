<template>
  <ndc-modal class="m-status-modal" title="修改任务状态" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="任务状态" required>
        <u-validator name="status" :validate="errors">
          <ndc-select
            style="background: #fff;"
            name="status"
            placeholder="请选择任务状态"
            :options="modalData.statusOptions"
            v-model="modalData.status"
            v-validate="{
              required: '任务状态'
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
export default class MStatusModal extends Mixins(ModalMixin) {}
</script>

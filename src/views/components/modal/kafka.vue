<template>
  <ndc-modal :title="modalData.isEdit ? '编辑 Kafka 集群' : '新建 Kafka 集群'" :visible='visible' @hide="onHide" :width="480" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="集群名称" required>
        <u-validator name="bootstrapName" :validate="errors">
          <input type="text" class="ndc-input"
            name="bootstrapName"
            v-model="modalData.bootstrapName"
            autocomplete="off"
            placeholder="请输入集群名称"
            v-validate="{
              required: '集群名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群地址" required>
        <u-validator name="bootstrapServers" :validate="errors">
          <input type="text" class="ndc-input"
            name="bootstrapServers"
            v-model="modalData.bootstrapServers"
            autocomplete="off"
            placeholder="请输入集群地址"
            v-validate="{
              required: '集群地址'
            }"
          />
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';

@Component
export default class MKafkaModal extends Mixins(ModalMixin) {}
</script>

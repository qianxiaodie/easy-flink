<template>
  <ndc-modal class="m-database-modal" title="新建 DB" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="数据库名" required>
        <u-validator name="db" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="db"
            autocomplete="off"
            v-model="modalData.db"
            placeholder="请输入数据库名"
            v-validate="{
              required: '数据库名'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="描述">
        <textarea
          class="ndc-textarea"
          v-model="modalData.desc"
        />
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from '../modal/mixin';

@Component
export default class MDatabaseModal extends Mixins(ModalMixin) {}
</script>

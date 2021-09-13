<template>
  <ndc-modal class="m-tag-modal" :title="modalData.isEdit ? '修改标签' : '新建标签'" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="标签名称" required>
        <u-validator name="tagName" :validate="errors">
          <input
            class="ndc-input m-modal-input"
            name="tagName"
            v-maxlength="32"
            placeholder="请输入标签名称，最大长度32个字符"
            v-model="modalData.name"
            autocomplete="off"
            v-validate="{
              required: '标签名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <!-- <ndc-form-item label="备注">
        <textarea placeholder="请输入备注" class="ndc-textarea" v-model="modalData.description"></textarea>
      </ndc-form-item> -->
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';

@Component
export default class MTagModal extends Mixins(ModalMixin) {}
</script>

<template>
  <ndc-modal class="m-user-modal" title="添加用户" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="用户名" required>
        <u-validator name="userList" :validate="errors">
          <textarea
            class="ndc-textarea"
            name="userList"
            placeholder="请输入用户名，回车分隔"
            v-model="modalData.userList"
            v-validate="{
              required: '用户名'
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
export default class MUserModal extends Mixins(ModalMixin) {
  public show(data: any, callback?: any) {
    try {
      data.isEdit && (data.userList = (data.userList || []).join('\n'));
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }
}
</script>

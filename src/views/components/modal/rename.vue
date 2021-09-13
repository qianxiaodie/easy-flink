<template>
  <ndc-modal title="重命名文件夹" :visible='visible' @hide="onHide" :width="480" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="文件夹名称" required>
        <u-validator name="name" :validate="errors">
          <input type="text" class="ndc-input"
            name="name"
            v-maxlength="64"
            v-model="modalData.name"
            autocomplete="off"
            placeholder="1-64个字符，可输入中文、字母、数字、”-“和”_“"
            v-validate="{
              required: '文件夹名称',
              nameValidator: true
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
export default class MRenameModal extends Mixins(ModalMixin) {}
</script>

<style lang="less" scoped>
/deep/ .ndc-modal-main {
    width: 480px;
    height: 256px;
    background: #ffffff;
    border-radius: 4px;
    .ndc-modal-header {
      height: 40px;
      background: #eeeeee;
      border-radius: 4px 4px 0px 0px;
      padding: unset;
      .content {
        span {
          margin-left: 20px;
          font-size: 16px;
          line-height: 16px;
          font-family: MicrosoftYaHei;
          color: #152038;
        }
        .ndc-icon-close {
          &::before {
            font-size: 8px;
            margin-right: 17px;
          }
        }
      }
    }
    .ndc-modal-content {
      .ndc-form-item {
        /deep/ .label {
          width: 76px;
          height: 32px;
          line-height: 32px;
          padding-right: 5px;
          &::after {
            left: -12px;
          }
        }
      }
    }
  .ndc-modal-footer {
    padding: 8px 40px 20px;
    .ndc-button {
      width: 60px;
      height: 32px;
      padding: unset;
      font-size: 14px;
      min-width: 60px;
      border-radius: 3px;
    }
    .ndc-button.ndc-button-primary {
      background: #3b68b7;
    }
  }
  }
</style>

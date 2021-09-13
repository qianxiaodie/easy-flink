<template>
  <ndc-modal class="m-folder-modal" :visible="visible" title="新建文件夹" @hide="onModalHide" :width="480" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="文件夹名称" required>
        <u-validator name="folderName" :validate="errors">
          <input type="text" class="ndc-input"
            name="folderName"
            v-maxlength="64"
            v-model="modalData.folderName"
            autocomplete="off"
            placeholder="1-64个字符，可输入中文、字母、数字、”-“和”_“"
            v-validate="{
              required: '文件夹名称',
              nameValidator: true
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="保存位置" required>
        <u-validator name="position" :validate="errors">
          <u-tree-select
            name="position"
            placeholder="请选择保存位置"
            track-key="id"
            label-key="folderName"
            :data="positionData"
            :showModalFlag="showModalFlag"
            v-model="modalData.position"
            v-validate="{
              required: '保存位置'
            }"
          ></u-tree-select>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';

import { IFolder, ITreeOption } from '@utils/types';
import { folderListToTree } from '@/utils';

@Component
export default class MFolderModal extends Mixins(ModalMixin) {
  private positionData: ITreeOption[] = [];
  private showModalFlag:boolean = false
  public show(data: any, callback?: any) {
    this.positionData = [];
    this.showModal(data, callback);
    this.getDirectoryList().then(() => {
      this.showModalFlag = true;
    });
  }

  private async getDirectoryList() {
    try {
      const list: IFolder[] = await this.$request('getDirectoryList', { dirType: this.modalData.type });
      list.forEach((value, index) => {
        if (value.id === -1) {
          list.splice(index, 1);
        }
      });
      this.positionData = folderListToTree(list, true);
    } catch (e) {
      this.setError(e.message);
    }
  }

  private onModalHide() {
    this.onHide();
    this.showModalFlag = false;
  }
}
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
        /deep/ .el-radio-group{
          .el-radio{
            .el-radio__input{
              .el-radio__inner{
                border-color: #3b68b7;
                background: #ffffff;
              }
            }
            .is-checked{
              .el-radio__inner::after{
                background-color: #ffffff;
              }
            }
            .is-disabled{
              .el-radio__inner{
                border-width: 2px;
                border-color: #C0C4CC;
                background: #ffffff;
              }
            }
          }
          .is-checked{
            .is-checked{
              .el-radio__inner{
                border-color: #3b68b7;
                background: #3b68b7;
              }
            }
            .el-radio__label{
              color: #3b68b7;
            }
          }
        }
        padding: 6px 0;
        /deep/ .label {
          width: 76px;
          height: 32px;
          line-height: 32px;
          padding-right: 5px;
          &::after {
            left: -12px;
          }
        }
        .content {
          .ndc-input {
            padding: 0 12px;
            width: 320px;
            height: 32px;
            line-height: 32px;
            font-family: PingFangSC-Regular, PingFang SC;
            font-weight: 400;
            color: #222222;
          }
          .copy-kernelInput {
            background-color: #f6f6f7;
          }
          .u-select,
          .ndc-select {
            width: 320px;
            height: 32px;
            padding: 0 25px 0 12px;
            line-height: 32px;
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

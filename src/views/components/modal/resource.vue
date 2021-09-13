<template>
  <ndc-modal title="添加资源文件" class="m-resource-modal" :visible="visible" :width="480" @hide="onModalHide"
             :on-confirm="onModalConfirm">
    <ndc-form>
      <ndc-form-item v-for="(item, index) in fileList" :key="index" label="文件名称" required>
        <u-validator :name="'file_' + index" :validate="errors">
          <u-tree-select
            :name="'file_' + index"
            style="width: 415px;"
            placeholder="请选择资源文件"
            label-key="folderName"
            track-key="id"
            :data="resourceList"
            :showModalFlag="showModalFlag"
            :value="item.id"
            :folder-disabled="true"
            :addResource="true"
            @change="onChange(arguments[0], index, resourceList)"
            @before-show="onBeforeShow(item)"
            v-validate="{
              required: '资源文件'
            }"
          ></u-tree-select>
          <i class="ndc-icon-close" @click="remove(index)"/>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item :label="fileList.length ? '' : '文件名称'" :required="!fileList.length">
        <span class="g-text-link" style="line-height: 16px;" @click="add">+ 添加资源文件</span>
      </ndc-form-item>
      <!--      <ndc-form-item>-->
      <!--        <ndc-checkbox style="height: 36px;" v-model="mammutKyb" label="关联默认猛犸认证文件"></ndc-checkbox>-->
      <!--      </ndc-form-item>-->
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { IFolder, ITreeOption, ISimpleFile } from '@utils/types';
import { folderListToTree, jarfolderListToTree } from '@/utils';
import { cloneDeep } from 'lodash';
import ModalMixin from './mixin';
// import key from "ndc-antd/vc-table/demo/key";

  @Component
export default class MResourceModal extends Mixins(ModalMixin) {
    private fileList: ISimpleFile[] = []
    private fileListTemp: ISimpleFile[] = []
    private originalResourceList: ITreeOption[] = []
    private resourceList: ITreeOption[] = []
    private mammutKyb: boolean = true
    private showModalFlag:boolean = false
    private resourceListTemp: ITreeOption[] = []
    public show(data: any, callback?: any) {
      console.log(data,'resource-show')
      this.fileList = data.fileList;
      // this.fileListTemp = data.fileList;
      this.mammutKyb = data.mammutKyb !== false;
      this.showModal(data, callback);
      this.errors.clear();
      this.getResourceList(data);
    }

    private async getResourceList (data) {
      try {
        const list: IFolder[] = await this.$request('getResourceList');
        data.jobType === 'SQL' ? this.originalResourceList = jarfolderListToTree(list) : this.originalResourceList = folderListToTree(list);
        // this.originalResourceList = folderListToTree(list);
        this.resourceList = cloneDeep(this.originalResourceList);
      } catch (e) {
        this.setError(e.message);
      }
    }
    private async onModalConfirm() {
      let fileList = [...this.fileList, ...this.fileListTemp];
      for (let i = 0; i < fileList.length; i++) {
        for (let j = i + 1; j < fileList.length; j++) {
          if (fileList[i].name === fileList[j].name) {
            this.$ndcmessage.error('文件名重复，请去掉重复的文件');
            return;
          }
        }
      }
      return this.onConfirm({
        fileList: [...this.fileList, ...this.fileListTemp],
        mammutKyb: this.mammutKyb
      });
    }

    // 去掉root目录并将 root中的元素放到根目录中
    private removeRoot() {
      let rootChildren: ITreeOption[] = [];
      (this.resourceList[0].children as ITreeOption[]).forEach((val, index) => {
        if (val.id === -1) {
          rootChildren = val.children as ITreeOption[];
          (this.resourceList[0].children as ITreeOption[]).splice(index, 1);
        }
      });
      rootChildren.forEach(val => {
        (this.resourceList[0].children as ITreeOption[]).push(val);
      });
    }

    private removeRootL(list) {
      let rootChildren: ITreeOption[] = [];
      list.forEach((val, index) => {
        if (val.id === -1) {
          rootChildren = val.files as ITreeOption[];
          list.splice(index, 1);
        }
      });
      rootChildren.forEach(val => {
        list.push(val);
      });
    }

    private remove(index: number) {
      this.fileList.splice(index, 1);
      this.resourceList = cloneDeep(this.originalResourceList);
    }

    private add() {
      this.fileList.push({});
    }

    private onChange(val: number, index: number, item: ITreeOption[]) {
      this.getFileName(val, item[0].children as ITreeOption[]);
      this.fileList.splice(index, 1, {
        name: this.fileName as string,
        id: val
      });
      this.fileName = '';
      this.showModalFlag = false;
    }

    // 获取当前选中的fileName
    private fileName: String = ''
    private getFileName(id: number, resourceList: ITreeOption[]) {
      if (resourceList && resourceList.length > 0) {
        resourceList.forEach(element => {
          // idfolder 文件夹id和文件id相同的问题
          if (element.fileName && element.id === id && !element.isFolder) {
            this.fileName = element.fileName;
            return this.fileName;
          } else {
            this.reverseChildren(id, element);
          }
        });
      }
      return this.fileName;
    }

    private reverseChildren(id: number, children: any) {
      if (!this.fileName && children) {
        if (children.id === id && !children.isFolder) {
          return this.fileName = children.fileName;
        } else {
          if (children.children && children.children.length > 0) {
            children.children.forEach(element => {
              this.reverseChildren(id, element);
            });
          }
        }
      } else {
        return null;
      }
    }

    private async onBeforeShow(file: ISimpleFile) {
      const func = (nodes: ITreeOption[]): ITreeOption[] => {
        const result: ITreeOption[] = [];
        for (let i = 0, len = nodes.length; i < len; i++) {
          const node = nodes[i];
          if (node.isFolder) {
            const child = func(node.children || []);
            node.children = child;
            result.push(node);
            continue;
          }
          if (node.key && ((file.id && node.key === file.id.toString()) || !this.fileList.some(file => !!(file.id && node.key === file.id.toString())))) {
            result.push(node);
          }
        }
        return result;
      };
      let temp = cloneDeep(this.originalResourceList);
      this.resourceList = func(temp);
      this.removeRoot();
      this.showModalFlag = true;
    }

    private onModalHide() {
      this.onHide();
      this.showModalFlag = false;
    }
}
</script>

<style lang="scss" scoped>
  .m-resource-modal {
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
    .u-validator {
      display: flex;
      align-items: center;

      .ndc-icon-close {
        margin-left: 8px;
        font-size: 16px;
        font-weight: 600;
        color: #90a8a6;
        cursor: pointer;
      }
    }
  }
  /deep/ .ndc-modal-main .ndc-modal-content .ndc-form-item{
    padding: 12px 0;
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
  /deep/ .u-validator {
    position: relative;
    .u-tree-select{
      /deep/ .u-select {
        width: 295px;
      }
    }
    .error {
      position: absolute;
    }
  }
</style>

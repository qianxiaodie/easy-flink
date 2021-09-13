<template>
  <ndc-modal title="上传资源文件" class="m-file-modal" :visible="visible" :width="480" @hide="onModalHide" :on-confirm="onModalConfirm">
    <div v-show="this.modalData.jobType === 'SQL'" class="file-desc">支持上传的文件格式：.jar</div>
    <ndc-form>
      <ndc-form-item label="选择文件" required>
        <u-validator class="g-flex-ac" name="file" :validate="errors">
          <div class="g-text-nowrap" style="width: 0;flex: 1;" :title="getFileName()" v-if="modalData.files && modalData.files.length">{{ getFileName() }}</div>
          <ndc-file
            v-if="this.modalData.jobType === 'SQL'"
            auto-reset
            multiple
            :quoteFileList="this.modalData.quoteFileList"
            :extensions="['jar']"
            media-type=".jar"
            :button-text="modalData.files && modalData.files.length ? '重新选择' : '选择'"
            @change="onChangeFile"
            @error="onUploadFileError"
            @multipeFlag="handleMultipe"
          ></ndc-file>
          <ndc-file
            v-else
            auto-reset
            multiple
            :quoteFileList="this.modalData.quoteFileList"
            :button-text="modalData.files && modalData.files.length ? '重新选择' : '选择'"
            @change="onChangeFile"
            @error="onUploadFileError"
            @multipeFlag="handleMultipe"
          ></ndc-file>
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
            @change="selectPosition"
            v-validate="{
              required: '保存位置'
            }"
          ></u-tree-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="备注">
        <textarea class="ndc-textarea" placeholder="请输入备注" v-model="modalData.description" />
      </ndc-form-item>
      <div v-show="this.referFileFlag" class="referTip">
        <div v-if="this.referFile">
          {{`当前选择文件名与当前选择文件夹下的文件重名，并且被以下文件引用：
          ${this.referFile},
          是否确认覆盖？`}}
        </div>
        <div v-else>
          {{`当前选择文件名与当前选择文件夹下的文件重名，暂未被其他任务引用,
          是否确认覆盖？`}}
        </div>
      </div>
      <div v-show="this.multipeFlag && !this.referFileFlag" class="referTip">
        {{`当前选择文件名与当前文件的引用文件重名，
        若继续上传,则会替换当前文件的同名引用文件,是否确认继续?`}}
      </div>
    </ndc-form>
    <u-loading v-if="loading" loading-text="文件上传中，对话框可关" :closable="true" @close="onCloseLoading"></u-loading>
  </ndc-modal>
</template>
<!--['conf', 'xml', 'keytab', 'jar', 'properties']-->
<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { ITreeOption, IFolder, ISimpleFile, IMetadata } from '@utils/types';
import { folderListToTree } from '@/utils';
import Bus from "@/bus";
import { request } from "@utils/request";
const DEFAULT_DATA: any = {
  files: [],
  description: ''
};

@Component
export default class MFileModal extends Mixins(ModalMixin) {
  private positionData: ITreeOption[] = []
  private showModalFlag:boolean = false
  public show(data: any, callback?: any) {
    this.showModal(Object.assign({}, DEFAULT_DATA, data), callback);
    this.getDirectoryList().then(() => {
      this.showModalFlag = true;
    });
    this.getResourceList();
    setTimeout(() => {
      this.errors.clear();
    }, 100);
  }

  private resourceFileList:any = []
  private async getResourceList() {
    this.resourceFileList = await request('getResourceList');
    // console.log(this.resourceFileList);
  }
  private compareFile(id, name) {
    this.resourceFileList.forEach(item => {
      this.getFolder(item, id);
    });
    this.sameFolder.files.forEach(i => {
      if (i.fileName === name) {
        // 询问是否覆盖
        this.referFile = '';
        this.referResourceFile();
      }
    });
  }
  private stopCircleFlag:boolean = false
  private sameFolder:any = []
  private getFolder(data, selectId) {
    if (!this.stopCircleFlag) {
      if (selectId === data.id) {
        this.stopCircleFlag = true;
        this.sameFolder = data;
      }
      if (data.folders.length !== 0) {
        data.folders.forEach(item => {
          this.getFolder(item, selectId);
        });
      }
    }
  }

  private async getDirectoryList() {
    try {
      const list: IFolder[] = await this.$request('getDirectoryList', {
        dirType: 'FILE'
      });
      list.forEach((value, index) => {
        if (value.id === -1) {
          list.splice(index, 1);
        }
      });
      this.positionData = folderListToTree(list, true, true);
    } catch (e) {
      this.setError(e.message);
    }
  }
  private getFileName() {
    if (this.modalData.files.length) {
      const names = this.modalData.files.map(f => f.name);
      return names.join(',');
    }
    return '';
  }

  private onChangeFile(args: any) {
    this.errorFlag = false;
    this.referFileFlag = false;
    this.stopCircleFlag = false;
    this.removeValidatorError('file');
    const files: FileList = args.files;
    files.length && (this.modalData.files = Array.from(files));
    this.handleMultipe(args.changeMultipeFlag);
    if (this.modalData.position && this.getFileName() !== '') {
      this.compareFile(this.modalData.position, this.getFileName());
    }
  }

  private errorFlag:boolean = false
  private onUploadFileError(args: any) {
    console.log(this.modalData, 'this.modalData');
    this.errorFlag = true;
    let msg = '';
    if (args.type === 'NAME_Multiple') {
      msg = '文件名与已引用文件重复';
    } else if (args.type === 'NAME_WORDS') {
      msg = '文件名仅支持字母、数字、短横杠和下划线组合';
    } else if (args.type === 'EXT_ERROR') {
      msg = '上传文件格式不正确';
    } else if (args.type === 'SIZE_ERROR') {
      msg = '上传文件大小超出限制';
    } else {
      msg = '上传文件失败';
    }
    this.addValidatorError('file', msg);
  }
  private multipeFlag:boolean = false
  private handleMultipe(flag) {
    // 上传文件与已引用文件重名
    this.multipeFlag = flag;
  }
  private referFile:any = ''
  private referFileFlag:boolean = false
  private async referResourceFile() {
    let params = {
      space: localStorage.getItem('sloth_space'),
      product: localStorage.getItem('sloth_projectId'),
      parentId: this.modalData.position,
      fileName: this.getFileName()
    };
    try {
      this.referFile = await this.$request('referResourceFile', params);
      this.referFileFlag = true;
      Bus.$emit('emitreferFileFlag', this.referFileFlag);
    } catch (e) {
      this.referFileFlag = false;
      Bus.$emit('emitreferFileFlag', this.referFileFlag);
    }
  }
  private selectPosition() {
    this.referFileFlag = false;
    this.stopCircleFlag = false;
    if (this.modalData.position && this.getFileName() !== '') {
      this.compareFile(this.modalData.position, this.getFileName());
    }
  }
  private async onModalConfirm() {
    const valid = await this.validate();
    if (valid && !this.errorFlag) {
      return this.onConfirm(null, false);
    }
    return false;
  }

  private async validate() {
    let valid = true;

    if (!this.modalData.files.length) {
      valid = false;
      this.addValidatorError('file', '资源文件不能为空');
    }
    const v = await this.$validator.validateAll();
    return v && valid;
  }

  private onCloseLoading() {
    this.onHide(this.modalData.position);
  }

  private onModalHide() {
    this.onHide();
    this.multipeFlag = false;
    this.referFileFlag = false;
    this.showModalFlag = false;
    this.errorFlag = false;
  }
}
</script>

<style lang="scss" scoped>
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
  .file-desc {
    line-height: 20px;
    color: #687381;
    margin-bottom: 16px;
  }
  .referTip{
    color: #f04346;
  }
  /deep/.ndc-form{
    .ndc-form-item{
      .error{
        margin-left: 16px;
      }
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
}
</style>

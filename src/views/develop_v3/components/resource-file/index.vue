<template>
  <div class="m-resource-files">
    <ndc-form>
      <ndc-form-item>
        <span class="files-title">引用文件：</span>
        <div class="files-tag">
          <ndc-tooltip position="top"  v-for="(item, index) in job.fileList" :key="index" :content="item.name">
            <el-tag :closable="opCodesFlag" type="info" @close="removeFile(index)">{{
              item.name.length > 20 ? item.name.substring(0, 20) + "..." : item.name }}
            </el-tag>
          </ndc-tooltip>
        </div>
      </ndc-form-item>

      <ndc-form-item class="btn">
        <div class="confirm-btn">
          <ndc-button @click="upload" :disabled="!this.opCodesFlag">
            <m-file-nav @fileInfo="getFileInfo" :jobType="job.jobType" ref="uploadFile"></m-file-nav>
            上传
          </ndc-button>

          <ndc-button theme="primary" @click="quote" :disabled="!this.opCodesFlag">引用</ndc-button>
        </div>
      </ndc-form-item>
    </ndc-form>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator';
import { IFolder, ITreeOption, ISimpleFile, IJob } from '@/utils/types';
import { folderListToTree } from '@/utils';
import MFileNav from '../file-nav/index.vue';
import { cloneDeep } from 'lodash';
import ModalMixin from '../mixin';
import { MODAL_TYPE } from "@views/components/modal/constant";
import MNavHeader from "@views/develop/components/nav-header/index.vue";

  @Component({
    components: {
      MFileNav
    }
  })
export default class MResourceFile extends Mixins(ModalMixin) {
    // MResourceModal
    @Prop({
      default: {}
    })
    private job !: IJob;
    // sidebar 传值权限
    @Prop({
      default: false
    })
    private opCodesFlag!: boolean;
    private fileList: ISimpleFile[] = [];
    private originalResourceList: ITreeOption[] = [];
    private resourceList: ITreeOption[] = [];
    private mammutKyb: boolean = true;
    private resourceModalInstance: ModalMixin | null = null

    upload() {
      (this.$refs.uploadFile as any).upload(this.job.fileList);
    }
    private pushFlag:boolean = false
    getFileInfo(fileInfo : any[]) {
      // debugger
      this.pushFlag = false;
      this.job.fileList && this.job.fileList.forEach(item => {
        if (item.name === fileInfo[0].name ) {
          item.id = fileInfo[0].id;
          this.pushFlag = true;
        }
      });
      if (!this.pushFlag) {
        (this.job.fileList as ISimpleFile[]).push({ id: fileInfo[0].id, name: fileInfo[0].name });
      }
      this.saveFileList();
    }

    async saveFileList() {
      try {
        await this.$request('updateDependency', {
          jobId: this.job.jobId,
          fileList: (this.job.fileList as ISimpleFile[]).map(file => file.id),
          mammutKyb: this.job.mammutKyb
        });
        return true;
      } catch (e) {
        this.setError(e.message);
      }
    }

    created() {
      // console.log(this.job,'job----resourceFile')
    }

    // 删除文件
    removeFile(index) {
      this.$ndcconfirm({
        content: '删除文件',
        desc: '文件删除后将无法恢复，确认删除吗？',
        onConfirm: async () => {
          try {
            this.fileList = this.job.fileList as ISimpleFile[];
            this.fileList.splice(index, 1);
            await this.$request('updateDependency', {
              jobId: this.job && this.job.jobId,
              fileList: this.fileList.map(i => i.id),
              mammutKyb: this.job && this.job.mammutKyb
            });

            this.$ndcmessage.success('删除文件成功');
          } catch (e) {
            this.$handleException(e, '删除文件失败');
          }
        }
      });
    }

    // 传回修改之后的job 展示不需要
    handelJobChange() {
      this.$emit('jobChange', 'this.job');
    }

    quote() {
      if (!this.resourceModalInstance) {
        this.resourceModalInstance = this.$createModalInstance(MODAL_TYPE.linkResource);
      }
      this.resourceModalInstance &&
      this.resourceModalInstance.show(
        {
          fileList: cloneDeep(this.job.fileList || []),
          mammutKyb: this.job.mammutKyb,
          jobType: this.job.jobType
        },
        async (args: any) => {
          try {
            this.job.fileList = args.fileList;
            await this.$request('updateDependency', {
              jobId: this.job.jobId,
              fileList: args.fileList.map(file => file.id),
              mammutKyb: args.mammutKyb
            });
            this.job.mammutKyb = args.mammutKyb;
            return true;
          } catch (e) {
            this.resourceModalInstance && this.resourceModalInstance.setError(e.message);
          }
        }
      );
    }

  //
  // public async show(data: any, callback?: any) {
  //   this.fileList = data.fileList || [];
  //   this.mammutKyb = data.mammutKyb !== false;
  //   this.showModal(data, callback);
  //   this.errors.clear();
  //
  //   try {
  //     const list: IFolder[] = await this.$request('getResourceList');
  //     this.originalResourceList = folderListToTree(list);
  //     this.resourceList = cloneDeep(this.originalResourceList);
  //   } catch (e) {
  //     this.setError(e.message);
  //   }
  // }
  //
  // private async onModalConfirm() {
  //   return this.onConfirm({
  //     fileList: this.fileList,
  //     mammutKyb: this.mammutKyb
  //   });
  // }
  //
  // private remove(index: number) {
  //   this.fileList.splice(index, 1);
  // }
  //
  // private add() {
  //   this.fileList.push({});
  // }
  //
  // private onChange(val: number, index: number) {
  //   this.fileList.splice(index, 1, {
  //     id: val
  //   });
  // }
  //
  // private onBeforeShow(file: ISimpleFile) {
  //   const func = (nodes: ITreeOption[]): ITreeOption[] => {
  //     const result: ITreeOption[] = [];
  //     for (let i = 0, len = nodes.length; i < len; i++) {
  //       const node = nodes[i];
  //       if (node.isFolder) {
  //         const child = func(node.children || []);
  //         node.children = child;
  //         result.push(node);
  //         continue;
  //       }
  //       if (node.key && ((file.id && node.key === file.id.toString()) || !this.fileList.some(file => !!(file.id && node.key === file.id.toString())))) {
  //         result.push(node);
  //       }
  //     }
  //     return result;
  //   };
  //
  //   this.resourceList = func(cloneDeep(this.originalResourceList));
  // }
}
</script>

<style lang="scss" scoped>
  .m-resource-files {
    padding-right: 16px;

    .ndc-form {
      .ndc-form-item {
        padding: 0 0 20px 0;

        /deep/.label {
          width: 20px;
        }

        .content {
          align-items: unset;

          span {
            display: block;
            height: 32px;
            font-size: 14px;
            font-family: MicrosoftYaHei;
            color: #555555;
            line-height: 32px;
          }

          .files-title {
            min-width: 80px;
            span {
              display: block;
              width: 70px;
              font-size: 14px;
            }
            margin-bottom: 8px;
          }

          .files-tag {
            display: flex;
            flex-wrap: wrap;
            width: 466px;

            span {
              height: 28px;
              line-height: 28px;
              margin: 0 8px 8px 0;
            }
          }
        }
      }

      .m-file-nav {
        display: none;
      }

      .btn {
        .confirm-btn {
          position: absolute;
          right: 0;
          margin-top: 20px;
          .ndc-button {
            width: 52px;
            height: 28px;
            margin-right: 12px;
            padding: 0;
            line-height: 28px;
            min-width: 50px;

            &-primary {
              background-color: #3b68b7;
            }
          }
        }
      }

      .ndc-table {
        width: unset;
        margin: 30px 0 0 16px;

        thead {
          tr {
            height: 28px;
            line-height: 28px;

            th {
              padding: 0 0 0 24px;
              background-color: #eee;
            }

            th:first-child {
              width: 66px;
            }

            td {
              .g-text-link {
                color: #3b68b7;
              }
            }
          }
        }

        tbody {
          tr {
            height: 44px;
            background-color: #fafafa;
            border-bottom: 1px solid #dddddd;
          }
        }
      }
    }
  }
</style>

<!--<template>-->
<!--  <div class="m-resource-files">-->
<!--    <ndc-form>-->
<!--      <ndc-form-item>-->
<!--        <span class="files-title">引用文件：</span>-->
<!--        <div class="files-tag">-->
<!--          <el-tag closable v-for="(item, index) in fileNameList" :key="index" type="info" @close="removeFile(index)">{{ item }}</el-tag>-->
<!--        </div>-->
<!--      </ndc-form-item>-->

<!--      <ndc-form-item class="btn">-->
<!--        <div class="confirm-btn">-->
<!--          <ndc-button @click="upload"> <upload-file ref="uploadFile"></upload-file>上传 </ndc-button>-->

<!--          <ndc-button theme="primary" @click="quote">引用</ndc-button>-->
<!--        </div>-->
<!--      </ndc-form-item>-->
<!--    </ndc-form>-->
<!--    &lt;!&ndash; <close-modal @modalClose="getFile"></close-modal> &ndash;&gt;-->
<!--  </div>-->
<!--</template>-->

<!--<script lang="ts">-->
<!--import uploadFile from '../file-nav/index.vue';-->
<!--// import closeModal from '../../../components/modal/file.vue'-->
<!--import { MODAL_TYPE } from '../../../components/modal/constant';-->
<!--import { cloneDeep } from 'lodash';-->

<!--export default {-->
<!--  props: {-->
<!--    addResource: {-->
<!--      type: Function-->
<!--    },-->
<!--    resourceFlag: {-->
<!--      type: Boolean-->
<!--    },-->
<!--    job: {-->
<!--      // type: Array,-->
<!--      required: true-->
<!--    }-->
<!--  },-->
<!--  data() {-->
<!--    return {-->
<!--      flag: true,-->
<!--      // 文件名列表-->
<!--      fileNameList: [],-->
<!--      originalResourceList: [],-->
<!--      resourceList: [],-->
<!--      fileListArr: [],-->
<!--      // 剩余文件的id-->
<!--      filelistIdArr: []-->
<!--    };-->
<!--  },-->
<!--  components: {-->
<!--    uploadFile-->
<!--  },-->
<!--  watch: {-->
<!--    resourceFlag(n, v) {-->
<!--      // console.log(n, v, 99999);-->
<!--    },-->
<!--    job() {-->
<!--      this.fileListArr = this.job.fileList;-->
<!--      // console.log(this.fileListArr)-->

<!--      console.log(this.fileListArr, 'job88888');-->
<!--      this.fileListArr.map(item => {-->
<!--        this.fileNameList.push(item.name);-->
<!--      });-->
<!--    }-->
<!--  },-->
<!--  created() {},-->
<!--  mounted() {},-->
<!--  computed: {},-->
<!--  methods: {-->
<!--    getFileData() {-->
<!--      this.fileListArr = this.job.fileList;-->

<!--      // console.log(this.fileListArr, '999999999');-->
<!--      this.fileListArr.map(item => {-->
<!--        this.fileNameList.push(item.name);-->
<!--      });-->
<!--    },-->
<!--    upload() {-->
<!--      // console.log(this.job);-->
<!--      this.$refs.uploadFile.upload();-->
<!--    },-->
<!--    quote() {-->
<!--      console.log('引用资源文件');-->

<!--      if (!this.resourceModalInstance) {-->
<!--        this.resourceModalInstance = this.$createModalInstance(MODAL_TYPE.linkResource);-->
<!--      }-->
<!--      console.log(this.job.fileList, 'list');-->
<!--      this.resourceModalInstance &&-->
<!--        this.resourceModalInstance.show(-->
<!--          {-->
<!--            fileList: cloneDeep(this.job.fileList || []),-->
<!--            mammutKyb: this.job.mammutKyb-->
<!--          },-->
<!--          async (args: any) => {-->
<!--            // console.log(this.fileNameList, 'namelist');-->

<!--            // console.log('args', args);-->
<!--            // console.log(this.job.jobId, 'jobidddd');-->
<!--            debugger;-->
<!--            try {-->
<!--              await this.$request('updateDependency', {-->
<!--                jobId: this.job.jobId,-->
<!--                fileList: args.fileList.map(file => file.id),-->
<!--                mammutKyb: args.mammutKyb-->
<!--              });-->

<!--              this.$emit('flag', 22);-->

<!--              // console.log(args.fileList);-->
<!--              // console.log(args.mammutKyb);-->
<!--              // console.log(args.jobId, 'iddddd');-->
<!--              // console.log(this.job, 'jobbbb');-->

<!--              this.fileNameList = args.fileList.map(i => i.name);-->
<!--              this.job.mammutKyb = args.mammutKyb;-->
<!--              console.log(this.fileNameList, 'this.fileNameList123123');-->

<!--              return true;-->
<!--            } catch (e) {-->
<!--              this.resourceModalInstance && this.resourceModalInstance.setError(e.message);-->
<!--            }-->
<!--          }-->
<!--        );-->
<!--    },-->

<!--    // 删除文件-->
<!--    removeFile(index) {-->
<!--      console.log(this.job.mammutKyb, 'mammutKyb111111');-->

<!--      this.$ndcconfirm({-->
<!--        content: '删除文件',-->
<!--        desc: '文件删除后将无法恢复，确认删除吗？',-->
<!--        onConfirm: async () => {-->
<!--          try {-->
<!--            this.fileNameList.splice(index, 1);-->
<!--            this.fileListArr.splice(index, 1);-->
<!--            await this.$request('updateDependency', {-->
<!--              jobId: this.job.jobId,-->
<!--              fileList: this.fileListArr.map(i => i.id),-->
<!--              mammutKyb: this.job.mammutKyb-->
<!--            });-->
<!--            // console.log(this.fileNameList, '删除后的文件列表');-->

<!--            this.$ndcmessage.success('删除文件成功');-->
<!--          } catch (e) {-->
<!--            this.$handleException(e, '删除文件失败');-->
<!--          }-->
<!--        }-->
<!--      });-->
<!--      // console.log(this.job);-->
<!--    },-->
<!--    deleteFile() {-->
<!--      // this.$refs.removeFile.removeFile()-->
<!--      console.log('删除文件', this.$refs.removeFile[0].removeFile());-->
<!--    }-->
<!--  }-->
<!--};-->
<!--</script>-->

<!--<style lang="scss">-->
<!--.m-resource-files {-->
<!--  padding-right: 16px;-->
<!--  .ndc-form {-->
<!--    .ndc-form-item {-->
<!--      padding: 0 0 20px 0;-->
<!--      .label {-->
<!--        width: 5px;-->
<!--      }-->
<!--      .content {-->
<!--        align-items: unset;-->
<!--        span {-->
<!--          display: block;-->
<!--          height: 32px;-->
<!--          font-size: 14px;-->
<!--          font-family: MicrosoftYaHei;-->
<!--          color: #555555;-->
<!--          line-height: 32px;-->
<!--        }-->
<!--        .files-title {-->
<!--          span {-->
<!--            display: block;-->
<!--            width: 70px;-->
<!--            font-size: 14px;-->
<!--          }-->
<!--        }-->
<!--        .files-tag {-->
<!--          display: flex;-->
<!--          flex-wrap: wrap;-->
<!--          width: 466px;-->
<!--          span {-->
<!--            height: 28px;-->
<!--            line-height: 28px;-->
<!--            margin: 0 8px 8px 0;-->
<!--          }-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--    .m-file-nav {-->
<!--      display: none;-->
<!--    }-->
<!--    .btn {-->
<!--      .confirm-btn {-->
<!--        position: absolute;-->
<!--        right: 0;-->
<!--        .ndc-button {-->
<!--          width: 52px;-->
<!--          height: 28px;-->
<!--          margin-right: 12px;-->
<!--          padding: 0;-->
<!--          line-height: 28px;-->
<!--          min-width: 50px;-->
<!--          &-primary {-->
<!--            background-color: #3b68b7;-->
<!--          }-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--    .ndc-table {-->
<!--      width: unset;-->
<!--      margin: 30px 0 0 16px;-->
<!--      thead {-->
<!--        tr {-->
<!--          height: 28px;-->
<!--          line-height: 28px;-->
<!--          th {-->
<!--            padding: 0 0 0 24px;-->
<!--            background-color: #eee;-->
<!--          }-->
<!--          th:first-child {-->
<!--            width: 66px;-->
<!--          }-->
<!--          td {-->
<!--            .g-text-link {-->
<!--              color: #3b68b7;-->
<!--            }-->
<!--          }-->
<!--        }-->
<!--      }-->
<!--      tbody {-->
<!--        tr {-->
<!--          height: 44px;-->
<!--          background-color: #fafafa;-->
<!--          border-bottom: 1px solid #dddddd;-->
<!--        }-->
<!--      }-->
<!--    }-->
<!--  }-->
<!--}-->
<!--</style>-->

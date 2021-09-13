<template>
  <ndc-modal class="m-job-modal" :visible="visible" :title="modalData.isCopy ? '复制任务' : '新建任务'" :width="480" @hide="onModalHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="任务名称:" required>
        <u-validator name="jobName" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="jobName"
            v-model="modalData.jobName"
            autocomplete="off"
            placeholder="请输入任务名称"
            v-validate="{
              required: '任务名',
              strLengthValidator: true,
              nameValidator:true,
              diffWithOthers: { label: '任务名', arr: modalData.jobNames }
            }"
          />
        </u-validator>
      </ndc-form-item>
      <!--      选择新建文件夹类型-->
      <ndc-form-item label="任务类型" required>
        <el-radio-group v-model="radio" @change="radioChange" :disabled="rightClickFlag">
          <el-radio label="SQL"></el-radio>
          <el-radio label="JAR"></el-radio>
        </el-radio-group>
      </ndc-form-item>
      <ndc-form-item label="保存位置:" required>
        <u-validator name="position" :validate="errors">
          <u-tree-select
            name="position"
            track-key="id"
            label-key="folderName"
            placeholder="请选择保存位置"
            :data="positionData"
            :showModalFlag="showModalFlag"
            v-model="modalData.position"
            v-validate="{
              required: '保存位置'
            }"
          ></u-tree-select>
        </u-validator>
      </ndc-form-item>
      <!-- <ndc-form-item label="提交集群">
        <u-validator name="clusterId" :validate="errors">
          <ndc-select
            name="clusterId"
            value-key="id"
            label-key="clusterName"
            placeholder="请选择集群"
            :options="clusterList"
            v-model="modalData.clusterId"
            @change="onClusterChange"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>-->
      <ndc-form-item label="内核版本:" required v-show="!modalData.isCopy">
        <u-validator name="kernelId" :validate="errors">
          <ndc-select
            v-if="modalData.clusterType && modalData.clusterType.toLocaleUpperCase() === 'K8S'"
            name="kernelId"
            value-key="id"
            label-key="imageName"
            placeholder="请选择内核版本"
            :options="kernelList"
            v-model="modalData.imageId"
            v-validate="{
              required: '内核版本'
            }"
            @change="onKernelChange"
          ></ndc-select>
          <ndc-select
            v-else
            name="kernelId"
            value-key="id"
            label-key="kernelName"
            placeholder="请选择内核版本"
            :options="kernelList"
            v-model="modalData.kernelName"
            v-validate="{
              required: '内核版本'
            }"
            @change="onKernelChange"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>

      <!-- 新增 复制时的内核版本模块 -->
      <ndc-form-item label="内核版本:" required v-show="modalData.isCopy">
        <u-validator name="kernelId" :validate="errors">
          <input
            type="text"
            class="ndc-input copy-kernelInput"
            readonly
            name="kernelId"
            v-maxlength="50"
            v-model="modalData.kernelName"
            autocomplete="off"
            placeholder="modalData.kernelName"
            v-validate="{
              required: '内核版本'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <!-- <ndc-form-item label="提交队列">
        <u-validator name="queueId" :validate="errors">
          <ndc-select
            name="queueId"
            value-key="id"
            label-key="queueName"
            placeholder="请选择队列"
            :disabled="!modalData.clusterId"
            :options="queueList"
            v-model="modalData.queueId"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>-->
      <!-- <ndc-form-item label="任务描述">
        <textarea v-maxlength="120" class="ndc-textarea" placeholder="请输入任务描述，最大长度为120个字符" v-model="modalData.description" />
      </ndc-form-item>-->
    </ndc-form>
    <u-loading v-if="loading" :loading-text="modalData.isCopy ? '任务复制中，请稍候...' : '任务新建中，请稍候...'"></u-loading>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';

import { IFolder, ITreeOption, IQueue, IKernel, ICluster } from '@utils/types';
import { folderListToTree } from '@/utils';
import ModalMixin from './mixin';

@Component
export default class MJobModalV3 extends Mixins(ModalMixin) {
  private clusterList: ICluster[] = []
  private kernelList: IKernel[] = []
  private queueList: IQueue[] = []
  private positionData: ITreeOption[] = []
  private showModalFlag:boolean = false
  private radio = 'SQL'
  private rightClickFlag:boolean = false
  public async show(data: any, callback?: any) {
    this.rightClickFlag = data.isRightClick;
    // 弹框show前默认设置SQL，关闭钱设置会有个视觉bug
    this.rightClickFlag ? this.radio = data.type : this.radio = 'SQL';
    /* if (this.rightClickFlag) {
      this.radio = data.type;
    } */
    this.showModal(data, callback);
    this.getDirectoryList().then(() => {
      this.showModalFlag = true;
    });
    await this.getClusterList();
    this.onClusterChange();
    setTimeout(() => {
      this.errors.clear();
    }, 100);
  }

  private radioChange() {
    if (this.modalData.position) {
      this.modalData.position = '';
    }
    this.modalData.type = this.radio;
    this.modalData.jobType = this.radio;
    this.getDirectoryList();
    this.getKernelList();
  }

  private async getDirectoryList() {
    try {
      const list: IFolder[] = await this.$request('getDirectoryList', { dirType: this.modalData.type });
      // this.positionData = folderListToTree(list, true, false)
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

  private async getClusterList() {
    try {
      const clusterList: ICluster[] = await this.$request('getClusterList');
      const type = this.modalData.type || this.modalData.jobType;
      this.clusterList = (clusterList || []).filter(c => {
        if (type === 'SQL') {
          return !c.clusterType || c.clusterType.toLocaleUpperCase() !== 'K8S';
        }
        return true;
      });
    } catch (e) {
      this.setError(e.message);
    }
  }

  private async getKernelList(typeChanged: boolean = false) {
    try {
      const list = await this.$request('getKernelList');
      const type = this.modalData.type || this.modalData.jobType;
      this.kernelList = (list || []).filter(l => {
        //  1.12.2 为新上线版本
        if (l.kernelName === 'flink-1.12.2') {
          l.kernelName = 'flink-1.12.2(Beta)';
        }

        if ((l.clusterType || '').toLocaleUpperCase() === 'K8S') {
          return false;
        }
        if (type === 'SQL') {
          return ['SQL', 'ALL'].includes(l.taskType);
        }
        return ['JAR', 'ALL'].includes(l.taskType);
      });
      if (typeChanged) {
        const kernel = this.kernelList[0];
        kernel && (this.modalData.kernelId = kernel.id);
      }
      // 下拉菜单默认选择第一个版本
      const kernel = this.kernelList[0];
      if (!this.modalData.isCopy) {
        this.modalData.kernelName = kernel.id;
      }
    } catch (e) {
      this.setError(e.message);
    }
  }

  private async getK8sKernelList(typeChanged: boolean = false) {
    try {
      const list = await this.$request('getK8sKernelList');
      const type = this.modalData.type || this.modalData.jobType;
      this.kernelList = (list || []).filter(l => {
        if (type === 'SQL') {
          return ['SQL', 'ALL'].includes(l.taskType);
        }
        return ['JAR', 'ALL'].includes(l.taskType);
      });
      if (typeChanged) {
        const kernel = this.kernelList[0];
        if (kernel) {
          this.modalData.kernelId = kernel.kernelId;
          this.modalData.imageId = kernel.id;
        }
      }
    } catch (e) {
      this.setError(e.message);
    }
  }

  private async getQueueList() {
    try {
      this.queueList = await this.$request('getQueueList', {
        clusterId: this.modalData.clusterId
      });
      const index = this.queueList.findIndex(q => q.id === this.modalData.queueId);
      if (index === -1) {
        this.modalData.queueId = this.queueList.length ? this.queueList[0].id : null;
      }
    } catch (e) {
      this.setError(e.message);
    }
  }

  private onClusterChange() {
    try {
      const cluster = (this.clusterList || []).find(c => this.modalData.clusterId && c.id === this.modalData.clusterId);
      const type = (cluster && cluster.clusterType) || 'YARN';
      const promiseArr: any[] = [];
      let typeChanged = false;
      if (this.modalData.clusterType !== type) {
        this.modalData.clusterType = type;
        typeChanged = true;
      }
      if (type.toLocaleUpperCase() === 'YARN') {
        promiseArr.push(this.getKernelList(typeChanged));
      }
      if (type.toLocaleUpperCase() === 'K8S') {
        promiseArr.push(this.getK8sKernelList(typeChanged));
      }
      if (this.modalData.clusterId) {
        promiseArr.push(this.getQueueList());
      }
      return Promise.all(promiseArr);
    } catch (e) {
      this.setError(e.message);
    }
  }

  private onKernelChange() {
    // debugger
    if (this.modalData.clusterType && this.modalData.clusterType.toLocaleUpperCase() === 'K8S') {
      const kernel = (this.kernelList || []).find(k => k.id === this.modalData.imageId);
      kernel && (this.modalData.kernelId = kernel.kernelId);
    }
  }

  private onModalHide() {
    this.onHide();
    this.showModalFlag = false;
    // this.radio = 'SQL';
  }
}
</script>

<style lang="scss" scoped>
// 新增 修改弹框样式
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

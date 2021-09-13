<template>
  <ndc-modal class="m-flink-modal" :title="modalData.isEdit ? '编辑 FlinkConf 路径' : '添加 FlinkConf 路径'" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="集群" required>
        <u-validator name="clusterId" :validate="errors">
          <ndc-select
            name="clusterId"
            value-key="id"
            label-key="clusterName"
            placeholder="请选择集群"
            :options="clusterList"
            v-model="modalData.clusterId"
            v-validate="{
              required: '集群'
            }"
            @change="onClusterChange"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="内核版本" required>
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
            v-model="modalData.kernelId"
            v-validate="{
              required: '内核版本'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="flinkConf路径" required>
        <u-validator name="flinkConfPath" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="flinkConfPath"
            autocomplete="off"
            v-model="modalData.flinkConfPath"
            placeholder="请输入flinkConf路径"
            v-validate="{
              required: 'flinkConf路径'
            }"
          />
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { IKernel, ICluster } from '@utils/types';
import ModalMixin from './mixin';

@Component
export default class MImageModal extends Mixins(ModalMixin) {
  private clusterList: ICluster[] = [];
  private kernelList: IKernel[] = [];

  public async show(data: any, callback?: any) {
    try {
      this.showModal(data, callback);
      await this.getClusterList();
      this.onClusterChange();
      setTimeout(() => {
        this.errors.clear();
      }, 100);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getClusterList() {
    try {
      this.clusterList = await this.$request('getClusterList');
    } catch (e) {
      this.setError(e.message);
    }
  }

  private async getKernelList() {
    try {
      this.kernelList = await this.$request('getKernelList');
      const kernel = this.kernelList[0];
      if (kernel) {
        this.modalData.kernelId = kernel.id;
        this.modalData.imageId = 0;
      }
    } catch (e) {
      this.setError(e.message);
    }
  }

  private async getK8sKernelList() {
    try {
      this.kernelList = await this.$request('getK8sKernelList');
      const kernel = this.kernelList[0];
      if (kernel) {
        this.modalData.kernelId = kernel.kernelId;
        this.modalData.imageId = kernel.id;
      }
    } catch (e) {
      this.setError(e.message);
    }
  }

  private onClusterChange() {
    try {
      const cluster = (this.clusterList || []).find(c => this.modalData.clusterId && c.id === this.modalData.clusterId);
      const type = this.modalData.clusterType = (cluster && cluster.clusterType) || 'YARN';
      if (type.toLocaleUpperCase() === 'YARN') {
        return this.getKernelList();
      }
      return this.getK8sKernelList();
    } catch (e) {
      this.setError(e.message);
    }
  }

  private onKernelChange() {
    if (this.modalData.clusterType && this.modalData.clusterType.toLocaleUpperCase() === 'K8S') {
      const kernel = (this.kernelList || []).find(k => k.id === this.modalData.imageId);
      kernel && (this.modalData.kernelId = kernel.kernelId);
    }
  }
}
</script>

<template>
  <ndc-modal class="m-image-modal" :title="modalData.isEdit ? '编辑镜像' : '添加镜像'" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="镜像名称" required>
        <u-validator name="imageName" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="imageName"
            autocomplete="off"
            v-maxlength="64"
            v-model="modalData.imageName"
            placeholder="请输入镜像名称"
            v-validate="{
              required: '镜像名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="镜像地址" required>
        <u-validator name="image" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="image"
            autocomplete="off"
            v-maxlength="64"
            v-model="modalData.image"
            placeholder="请输入镜像地址"
            v-validate="{
              required: '镜像地址'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="关联内核" required>
        <u-validator name="kernelId" :validate="errors">
          <ndc-select
            name="kernelId"
            placeholder="请选择关联内核"
            value-key="id"
            label-key="kernelName"
            :options="kernelList"
            v-model="modalData.kernelId"
            v-validate="{
              required: '关联内核'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="flink内核地址" required>
        <u-validator name="flinkPath" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="flinkPath"
            autocomplete="off"
            v-model="modalData.flinkPath"
            placeholder="请输入flink内核地址"
            v-validate="{
              required: 'flink内核地址'
            }"
          />
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { IKernel } from '@utils/types';
import ModalMixin from './mixin';

@Component
export default class MImageModal extends Mixins(ModalMixin) {
  private kernelList:IKernel[] = [];

  public async show(data: any, callback?: any) {
    try {
      const list = await this.$request('getKernelList');
      this.kernelList = (list || []).filter(l => l.clusterType && l.clusterType.toLocaleUpperCase() === 'K8S');
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }
}
</script>

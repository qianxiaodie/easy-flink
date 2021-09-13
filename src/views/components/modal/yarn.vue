<template>
  <ndc-modal class="m-yarn-modal" :title="modalData.isEdit ? '编辑队列' : '添加队列'" :visible="visible" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="队列名" required>
        <u-validator name="queueName" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="queueName"
            autocomplete="off"
            v-maxlength="64"
            v-model="modalData.queueName"
            placeholder="请输入队列名"
            v-validate="{
              required: '队列名'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="产品名称" required>
        <u-validator name="product" :validate="errors">
          <ndc-select
            name="product"
            placeholder="请选择产品"
            value-key="product"
            label-key="product"
            :options="productList"
            v-model="modalData.product"
            v-validate="{
              required: '产品名称'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="队列描述" required>
        <u-validator name="description" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="description"
            autocomplete="off"
            v-model="modalData.description"
            placeholder="请输入队列描述"
            v-validate="{
              required: '队列描述'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群" required>
        <u-validator name="clusterId" :validate="errors">
          <ndc-select
            name="clusterId"
            placeholder="请选择集群"
            value-key="id"
            label-key="clusterName"
            :options="clusterList"
            v-model="modalData.clusterId"
            v-validate="{
              required: '集群'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { IProduct, ICluster } from '@utils/types';

@Component
export default class MYarnModal extends Mixins(ModalMixin) {
  private productList: IProduct[] = [];
  private clusterList: ICluster[] = [];

  public async show(data: any, callback?: any) {
    try {
      const productRequest = this.$request('getProductList', { userId: this.userId });
      const clusterRequest = this.$request('getClusterBriefList');
      this.productList = await productRequest;
      this.clusterList = await clusterRequest;
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }
}
</script>

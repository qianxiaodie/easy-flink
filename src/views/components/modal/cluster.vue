<template>
  <ndc-modal class="m-cluster-modal" :title="modalData.isEdit ? '编辑集群' : '添加集群'" :visible="visible" @hide="onHide" :on-confirm="onModalConfirm">
    <ndc-form :label-size="'6'">
      <!-- 集群配置 -->
      <ndc-form-item label="集群名" required>
        <u-validator name="clusterName" :validate="errors">
          <input type="text" class="ndc-input"
            name="clusterName"
            v-maxlength="64"
            v-model="modalData.clusterName"
            autocomplete="off"
            placeholder="请输入集群名"
            v-validate="{
              required: '集群名'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群类型" required>
        <u-validator name="clusterType" :validate="errors">
          <ndc-select
            name="clusterType"
            value-key="key"
            label-key="label"
            :options="typeOptions"
            v-model="modalData.clusterType"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群 rm url 前缀" required>
        <u-validator name="clusterUrlPref" :validate="errors">
          <input type="text" class="ndc-input"
            name="clusterUrlPref"
            v-model="modalData.clusterUrlPref"
            autocomplete="off"
            placeholder="请输入集群 rm url 前缀"
            v-validate="{
              required: '集群 rm url 前缀'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="带域名集群 rm url 前缀" required>
        <u-validator name="clusterUrlPrefWithDomain" :validate="errors">
          <input type="text" class="ndc-input"
            name="clusterUrlPrefWithDomain"
            v-model="modalData.clusterUrlPrefWithDomain"
            autocomplete="off"
            placeholder="请输入带域名集群 rm url 前缀"
            v-validate="{
              required: '带域名集群 rm url 前缀'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群tag(默认sloth)" required>
        <u-validator name="clusterTags" :validate="errors">
          <input type="text" class="ndc-input"
            name="clusterTags"
            v-model="modalData.clusterTags"
            autocomplete="off"
            placeholder="请输入集群tag"
            v-validate="{
              required: '集群tag'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="机器成本" required>
        <u-validator name="costing" :validate="errors">
          <ndc-select
            name="costing"
            value-key="key"
            label-key="label"
            :options="options"
            v-model="modalData.costing"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="是否开启 kerberosOn" required>
        <u-validator name="kerberosOn" :validate="errors">
          <ndc-select
            name="kerberosOn"
            value-key="key"
            label-key="label"
            :options="options"
            v-model="modalData.kerberosOn"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群 MasterUrl" required v-if="modalData.clusterType === 'K8S'">
        <u-validator name="clusterMasterUrl" :validate="errors">
          <input type="text" class="ndc-input"
            name="clusterMasterUrl"
            v-model="modalData.clusterMasterUrl"
            autocomplete="off"
            placeholder="请输入集群 MasterUrl"
            v-validate="{
              required: '集群 MasterUrl'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <hr class="g-hr" />
      <!-- flink 配置 -->
      <ndc-form-item label="flink配置文件路径" required>
        <u-validator name="flinkConfPath" :validate="errors">
          <input type="text" class="ndc-input"
            name="flinkConfPath"
            v-model="modalData.flinkConfPath"
            autocomplete="off"
            placeholder="请输入flink配置文件路径"
            v-validate="{
              required: 'flink配置文件路径'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="集群配置文件路径" required>
        <u-validator name="clusterConfPath" :validate="errors">
          <input type="text" class="ndc-input"
            name="clusterConfPath"
            v-model="modalData.clusterConfPath"
            autocomplete="off"
            placeholder="请输入集群配置文件路径"
            v-validate="{
              required: '集群配置文件路径'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="checkpoint hdfs路径" required>
        <u-validator name="checkpointPath" :validate="errors">
          <input type="text" class="ndc-input"
            name="checkpointPath"
            v-model="modalData.checkpointPath"
            autocomplete="off"
            placeholder="请输入checkpoint hdfs路径"
            v-validate="{
              required: 'checkpoint hdfs路径'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="flink 集群名称" required>
        <u-validator name="yarnName" :validate="errors">
          <input type="text" class="ndc-input"
            name="yarnName"
            v-model="modalData.yarnName"
            autocomplete="off"
            placeholder="请输入 flink 集群名称"
            v-validate="{
              required: 'flink 集群名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="任务提交用户">
        <u-validator name="taskSubmitter" :validate="errors">
          <input type="text" class="ndc-input"
            name="taskSubmitter"
            v-model="modalData.taskSubmitter"
            autocomplete="off"
            placeholder="请输入任务提交用户"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="用户 keytab" required v-if="modalData.kerberosOn">
        <u-validator name="keytab" :validate="errors">
          <input type="text" class="ndc-input"
            name="keytab"
            v-model="modalData.keytab"
            autocomplete="off"
            placeholder="请输入用户 keytab"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="用户 principal" required v-if="modalData.kerberosOn">
        <u-validator name="principal" :validate="errors">
          <input type="text" class="ndc-input"
            name="principal"
            v-model="modalData.principal"
            autocomplete="off"
            placeholder="请输入用户 principal"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="默认队列" required>
        <u-validator name="defaultQueue" :validate="errors">
          <input type="text" class="ndc-input"
            name="defaultQueue"
            v-model="modalData.defaultQueue"
            autocomplete="off"
            placeholder="请输入默认队列"
            v-validate="{
              required: '默认队列'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="是否公有集群" required>
        <u-validator name="publicCluster" :validate="errors">
          <ndc-select
            name="publicCluster"
            value-key="key"
            label-key="label"
            :options="options"
            v-model="modalData.publicCluster"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="支持的产品" v-if="!modalData.publicCluster">
        <u-validator name="productList" :validate="errors">
          <u-multi-select
            name="productList"
            value-key="product"
            label-key="product"
            :show-value="false"
            :options="products"
            placeholder="请输入产品名"
            v-model="modalData.productList"
          ></u-multi-select>
        </u-validator>
      </ndc-form-item>
      <hr class="g-hr" />
      <!-- 其他配置 -->
      <ndc-form-item label="esLogLevel.info" required>
        <u-validator name="esLogLevelInfo" :validate="errors">
          <input type="text" class="ndc-input"
            name="esLogLevelInfo"
            v-model="modalData.esLogLevelInfo"
            autocomplete="off"
            placeholder="请输入esLogLevel.info"
            v-validate="{
              required: 'esLogLevel.info'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="esLogLevel.error" required>
        <u-validator name="esLogLevelError" :validate="errors">
          <input type="text" class="ndc-input"
            name="esLogLevelError"
            v-model="modalData.esLogLevelError"
            autocomplete="off"
            placeholder="请输入esLogLevel.error"
            v-validate="{
              required: 'esLogLevel.error'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="es集群IP列表">
        <u-validator name="esPath" :validate="errors">
          <textarea
            class="ndc-textarea"
            name="esPath"
            v-model="modalData.esPath"
          />
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { IProduct } from '@utils/types';
import { cloneDeep } from 'lodash';

@Component
export default class MClusterModal extends Mixins(ModalMixin) {
  private options: any[] = [{
    key: true,
    label: '是'
  }, {
    key: false,
    label: '否'
  }];
  private typeOptions: any[] = [{
    key: 'YARN',
    label: 'YARN'
  }, {
    key: 'K8S',
    label: 'K8S'
  }];
  private products: IProduct[] = [];

  public async show(data: any, callback?: any) {
    try {
      const products: IProduct[] = this.products = await this.$request('getProductList', { userId: this.userId });
      if (data.isEdit) {
        const productList: IProduct[] = [];
        (data.productList || []).forEach((p: string) => {
          const product = products.find(pro => pro.product === p);
          product && productList.push(product);
        });
        data.productList = productList;
        data.esPath = (data.esPath || []).join('\n');
      }
      const esLogLevel = data.esLogLevel || {};
      if (esLogLevel.info && esLogLevel.info.length) {
        data.esLogLevelInfo = esLogLevel.info[0];
      }
      if (esLogLevel.error && esLogLevel.error.length) {
        data.esLogLevelError = esLogLevel.error[0];
      }
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private onModalConfirm() {
    const data = cloneDeep(this.modalData);
    if (!data.kerberosOn) {
      data.principal = data.keytab = null;
    }
    if (data.clusterType !== 'K8S') {
      data.clusterMasterUrl = null;
    }
    data.esLogLevel = {
      info: [data.esLogLevelInfo],
      error: [data.esLogLevelError]
    };
    return this.onConfirm(data);
  }
}
</script>

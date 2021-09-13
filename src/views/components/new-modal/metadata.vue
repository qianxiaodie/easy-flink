<template>
  <ndc-modal class="m-metadata-modal" :title="modalData.isEdit ? '编辑表' : '新增表'" :width="800" :max-height="516" :visible="visible" @hide="onHide" :on-confirm="onModalConfirm">
    <ndc-form>
      <ndc-form-item label="数据库" required>
        <u-validator name="db" :validate="errors">
          <ndc-select
            name="db"
            placeholder="请选择数据库"
            :options="databaseList"
            :disabled="modalData.isEdit"
            v-model="modalData.db"
            v-validate="{
              required: '数据库'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="表名" required>
        <u-validator name="table" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="table"
            autocomplete="off"
            v-model="modalData.table"
            placeholder="请输入表名"
            :disabled="modalData.isEdit"
            v-validate="{
              required: '表名'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="描述">
        <textarea
          class="ndc-textarea"
          v-model="modalData.comments"
        />
      </ndc-form-item>
      <ndc-form-item label="类型" required>
        <u-validator name="type" :validate="errors">
          <ndc-select
            name="type"
            placeholder="请选择类型"
            :searchable="true"
            :options="typeList"
            @change="onChangeType"
            v-model="modalData.type"
            v-validate="{
              required: '类型'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="数据源" :required="modalData.type === 'kafka'">
        <u-validator name="catalog" :validate="errors" v-if="modalData.type === 'kafka'">
          <ndc-select
            name="catalog"
            label-key="name"
            value-key="name"
            placeholder="请选择数据源"
            :searchable="true"
            :options="datasourceList"
            v-model="modalData.catalog"
            @change="onChangeDatasource"
            clearable
            v-validate="{
              required: '数据源'
            }"
          ></ndc-select>
        </u-validator>
        <ndc-select
          v-else
          label-key="name"
          value-key="name"
          placeholder="请选择数据源"
          :searchable="true"
          :options="datasourceList"
          v-model="modalData.catalog"
          @change="onChangeDatasource"
          clearable
        ></ndc-select>
        <ndc-button :disabled="!modalData.catalog" class="g-ml-8" style="padding: 0;" @click="showCatalogDetail">详情</ndc-button>
      </ndc-form-item>
      <ndc-form-item label="序列化方式" :required="modalData.type === 'kafka'">
        <u-validator name="formatType" :validate="errors" v-if="modalData.type === 'kafka'">
          <ndc-select
            name="formatType"
            placeholder="序列化方式"
            :searchable="true"
            :disabled="!modalData.type"
            :options="serializationList"
            @change="onChangeSerialization"
            v-model="modalData.formatType"
            clearable
            v-validate="{
              required: '序列化方式'
            }"
          ></ndc-select>
        </u-validator>
        <ndc-select
          v-else
          placeholder="序列化方式"
          :searchable="true"
          :disabled="!modalData.type"
          :options="serializationList"
          @change="onChangeSerialization"
          v-model="modalData.formatType"
          clearable
        ></ndc-select>
      </ndc-form-item>
      <ndc-form-item label="topic" :required="modalData.type === 'kafka'">
        <u-validator name="topic" :validate="errors" v-if="modalData.type === 'kafka'">
          <u-multi-select
            name="topic"
            :disabled="!modalData.catalog"
            :show-value="false"
            :options="topicList"
            placeholder="请选择topic"
            v-model="modalData.topic"
            v-validate="{
              required: 'topic'
            }"
          ></u-multi-select>
        </u-validator>
        <input
          v-else
          type="text"
          class="ndc-input"
          autocomplete="off"
          v-model="modalData.topic"
          placeholder="请输入topic，多个topic用,分隔"
        />
      </ndc-form-item>
      <ndc-form-item label="分隔符" v-if="modalData.formatType === 'csv'">
        <input
          type="text"
          class="ndc-input"
          autocomplete="off"
          v-model="delimiter"
          placeholder="默认','"
        />
      </ndc-form-item>
      <u-field-item ref="fields" :value="modalData.fields" :type-options="fieldTypes" />
      <u-config-item ref="config" :value="modalData.metadata" />
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from '../modal/mixin';
import UConfigItem from './components/config-item.vue';
import { metadataModalData } from '../../database/constant';
import UFieldItem from './components/field-item.vue';
import { isArray } from 'lodash';
import { isObject } from '@/utils';
import { IDatasource, IUserConfig } from '@/utils/types';
import { v1 } from 'uuid';
import { State } from 'vuex-class';
import { MODULE_NAMESPACE } from '@/utils/constant';

@Component({
  components: {
    UConfigItem,
    UFieldItem
  }
})
export default class MMetadataModal extends Mixins(ModalMixin) {
  @State('userConfig', MODULE_NAMESPACE.global)
  private userConfig!: IUserConfig;

  private databaseList: string[] = [];
  private typeList: string[] = [];
  private datasourceList: IDatasource[] = [];
  private serializationList: string[] = [];
  private topicList: any[] = [];
  private fieldTypes: string[] = [];
  private delimiter: string = '';

  private created() {
    this.modalData = metadataModalData;
    this.typeList = (this.userConfig.database && this.userConfig.database.datasourceType) || [];
  }

  public async show(data: any, callback?: any) {
    try {
      let promiseArr = [
        this.$request('getDatabaseList').then(data => this.databaseList = (data || []).map(d => d.db)),
        // this.$request('getDatasourceTypeList').then(data => this.typeList = data || []),
        this.$request('getFieldTypes').then(data => this.fieldTypes = data || [])
      ];
      await Promise.all(promiseArr);

      !data.type && (data.type = 'kafka');
      const type: string = data.type && this.typeList.includes(data.type) ? data.type : this.typeList[0];
      promiseArr = [];
      promiseArr.push(this.getDatasourceList(type));
      promiseArr.push(this.getSerializationList(type));
      await Promise.all(promiseArr);

      if (type !== data.type) {
        data.catalog = '';
        data.formatType = '';
        data.topic = type === 'kafka' ? [] : '';
      } else if (data.catalog && type === 'kafka') {
        const datasource = (this.datasourceList || []).find(d => d.name === data.catalog);
        datasource && await this.$request('getTopicList', { info: datasource.info, dsType: type }).then(data => this.topicList = (data || []).map(d => ({ label: d, value: d })));
      }
      if (data.type === 'kafka' && (!data.topic || typeof data.topic === 'string')) {
        data.topic = [];
      }
      if (data.formatType === 'csv') {
        this.delimiter = data.delimiter || '';
      }

      if (data.metadata && data.metadata.length) {
        data.metadata = (data.metadata || []).sort((a, b) => (a.key || '').localeCompare(b.key || ''));
      }
      this.showModal(data, callback);
      this.clearValidateError();
    } catch (e) {
      this.$handleException(e);
    }
  }

  private onChangeType() {
    this.modalData.catalog = '';
    this.modalData.formatType = '';
    this.modalData.topic = this.modalData.type === 'kafka' ? [] : '';
    this.getDatasourceList();
    this.getSerializationList();
    this.clearValidateError();
  }

  private async onChangeDatasource() {
    if (this.modalData.type !== 'kafka') {
      return this.modalData.topic = '';
    }
    this.modalData.topic = [];
    if (!this.modalData.catalog) {
      return this.topicList = [];
    }
    try {
      const datasource = (this.datasourceList || []).find(d => d.name === this.modalData.catalog);
      if (datasource) {
        const list = await this.$request('getTopicList', { info: datasource.info, dsType: this.modalData.type });
        this.topicList = list.map(l => ({ label: l, value: l }));
        this.$nextTick(() => this.removeValidatorError('topic'));
      }
    } catch (e) {
      this.$handleException(e, '获取 topic 列表失败');
    }
  }

  private async getDatasourceList(type?: string) {
    type = type || this.modalData.type;
    try {
      const result = await this.$request('getDatasourceListByType', { type });
      this.datasourceList = result.list || [];
    } catch (e) {
      this.$handleException(e, '获取数据源列表失败');
    }
  }

  private async getSerializationList(type?: string) {
    type = type || this.modalData.type;
    try {
      this.serializationList = await this.$request('getFormatTypeList', { tableType: type });
    } catch (e) {
      this.$handleException(e, '获取序列化列表失败');
    }
  }

  private async onChangeSerialization() {
    try {
      const list = await this.$request('getSchemaList', {
        type: this.modalData.type,
        formatType: this.modalData.formatType
      });
      this.modalData.fields = (list || []).map(l => {
        l.uuid = v1();
        return l;
      });
    } catch (e) {
      this.$handleException(e, '获取字段列表失败');
    }
  }

  private showCatalogDetail() {
    const datasource = (this.datasourceList || []).find(d => d.name === this.modalData.catalog);
    let desc = '';
    if (datasource && datasource.info) {
      const keys = Object.keys(datasource.info);
      keys.forEach(key => {
        desc += `<span style="color: #333;">${key}:</span><span class="g-ml-8" style="word-break: break-all;">${datasource.info[key]}</span><br />`;
      });
    }
    return this.$ndcconfirm({
      content: '详情',
      desc,
      cancelButton: ''
    });
  }

  private async validate(): Promise<boolean> {
    const valid = await this.$validator.validateAll();
    const configValid = this.validateConfigs();
    const fieldValid = this.validateFields();
    return valid && configValid && fieldValid;
  }

  private validateConfigs(): boolean {
    const configComp = this.$refs.config as UConfigItem;
    return configComp.validate();
  }

  private validateFields(): boolean {
    const fieldComp = this.$refs.fields as UFieldItem;
    return fieldComp.validate();
  }

  private async onModalConfirm() {
    if (this.modalData.isView) {
      return true;
    }
    const valid = await this.validate();
    if (!valid) {
      return false;
    }
    const metadata: any = {};
    (this.modalData.metadata || []).forEach(i => i.key && (metadata[i.key] = i.value || ''));
    let topic: string;
    if (this.modalData.type === 'kafka' && isArray(this.modalData.topic)) {
      const topics = this.modalData.topic.map(t => isObject(t) ? t.value : t);
      topic = topics.join(',');
    } else {
      topic = this.modalData.topic;
    }
    const externalConf = {
      topic,
      delimiter: this.modalData.formatType === 'csv' ? this.delimiter || ',' : ','
    };
    return this.onConfirm(Object.assign({}, this.modalData, {
      metadata, externalConf
    }));
  }
}
</script>

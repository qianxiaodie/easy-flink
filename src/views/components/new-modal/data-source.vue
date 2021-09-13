<template>
  <ndc-modal class="m-datasource-modal" :title="modalData.isView ? '查看数据源' : (modalData.isEdit ? '编辑数据源' : '新增数据源')" :visible="visible" :cancel-button="modalData.isView ? '' : '取消'" @hide="onHide" :on-confirm="onModalConfirm">
    <ndc-form>
      <ndc-form-item label="名称" required>
        <u-validator name="name" :validate="errors">
          <input
            type="text"
            class="ndc-input"
            name="name"
            autocomplete="off"
            :disabled="disabled || modalData.isEdit"
            v-model="modalData.name"
            placeholder="请输入名称"
            v-validate="{
              required: '名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="类型" required>
        <u-validator name="dsType" :validate="errors">
          <ndc-select
            name="dsType"
            placeholder="请选择类型"
            :searchable="true"
            :disabled="disabled || modalData.isEdit"
            :options="typeList"
            @change="onChangeType"
            v-model="modalData.dsType"
            v-validate="{
              required: '类型'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="类别" required>
        <u-validator name="tag" :validate="errors">
          <ndc-select
            name="tag"
            placeholder="请选择类别"
            :searchable="true"
            :disabled="disabled"
            :options="tagList"
            v-model="modalData.tag"
            v-validate="{
              required: '类别'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="环境" required>
        <u-validator name="envId" :validate="errors">
          <ndc-select
            name="envId"
            placeholder="请选择环境"
            :searchable="true"
            :disabled="disabled"
            :options="envList"
            v-model="modalData.envId"
            v-validate="{
              required: '环境'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="可读" class="authority">
        <u-multi-select
          :show-value="false"
          :disabled="disabled"
          :options="roleOptions"
          placeholder="请选择角色"
          v-model="modalData.readAuth.roles"
        ></u-multi-select>
        <u-multi-select
          class="g-mt-8"
          value-key="email"
          label-key="name"
          :options="userList"
          :disabled="disabled"
          placeholder="请选择用户"
          v-model="modalData.readAuth.users"
        ></u-multi-select>
      </ndc-form-item>
      <ndc-form-item label="可写" class="authority">
        <u-multi-select
          :show-value="false"
          :options="roleOptions"
          :disabled="disabled"
          placeholder="请选择角色"
          v-model="modalData.writeAuth.roles"
        ></u-multi-select>
        <u-multi-select
          class="g-mt-8"
          value-key="email"
          label-key="name"
          :options="userList"
          :disabled="disabled"
          placeholder="请选择用户"
          v-model="modalData.writeAuth.users"
        ></u-multi-select>
      </ndc-form-item>
      <ndc-form-item label="可编辑" class="authority">
        <u-multi-select
          :show-value="false"
          :options="roleOptions"
          :disabled="disabled"
          placeholder="请选择角色"
          v-model="modalData.editAuth.roles"
        ></u-multi-select>
        <u-multi-select
          class="g-mt-8"
          value-key="email"
          label-key="name"
          :options="userList"
          :disabled="disabled"
          placeholder="请选择用户"
          v-model="modalData.editAuth.users"
        ></u-multi-select>
      </ndc-form-item>
      <u-config-item ref="config" :value="modalData.info" :disabled="disabled" />
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from '../modal/mixin';
import { IUser } from '@utils/types';
import { v1 } from 'uuid';
import { datasourceModalData } from '../../database/constant';
import { isObject } from '@/utils';
import UConfigItem from './components/config-item.vue';

@Component({
  components: {
    UConfigItem
  }
})
export default class MDataSourceModal extends Mixins(ModalMixin) {
  private userList: IUser[] = [];
  private typeList: string[] = [];
  private tagList: any[] = [];
  private envList: string[] = [];
  private roleOptions: any[] = [{
    label: '数据分析师',
    value: 0
  }, {
    label: '推荐',
    value: 1
  }, {
    label: '后台开发',
    value: 2
  }];

  private created() {
    this.modalData = datasourceModalData;
  }

  private get disabled() {
    return !!this.modalData.isView;
  }

  public async show(data: any, callback?: any) {
    try {
      this.tagList = [];
      const promiseArr = [
        this.$request('getProductUsers').then(data => this.userList = data || []),
        this.$request('getDatasourceTypeList').then(data => this.typeList = data || []),
        this.$request('getEnvList').then(envs => this.envList = (envs || []).map(e => this.handleTag(e))),
        this.$request('getDatasourceTagList').then(tags => this.tagList = (tags || []).map(t => this.handleTag(t)))
      ];
      if (data.isEdit && data.dsType) {
        promiseArr.push(this.$request('getDsTypeRules', { dsType: data.dsType }).then(rules => {
          const keys = (rules || []).filter(r => r.required).map(k => k.keyName);
          data.info = (data.info || []).sort((a, b) => (a.keyName || '').localeCompare(b.keyName || '')).map(i => {
            i.default = keys.includes(i.key);
            if (i.key === 'zookeeperConnect' && data.dsType === 'kafka') {
              i.default = true;
            }
            return i;
          });
        }));
      }
      await Promise.all(promiseArr);
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private handleTag(args: any) {
    return {
      label: args.tagName,
      value: args.id
    };
  }

  private async onChangeType() {
    try {
      this.modalData.info = [];
      const rules = await this.$request('getDsTypeRules', { dsType: this.modalData.dsType });
      (rules || []).sort((a, b) => {
        return (a.keyName || '').localeCompare(b.keyName || '');
      }).forEach(rule => this.modalData.info.push({
        key: rule.keyName,
        value: '',
        default: rule.required || (this.modalData.dsType === 'kafka' && rule.keyName === 'zookeeperConnect'),
        uuid: v1()
      }));
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async validate(): Promise<boolean> {
    const valid = await this.$validator.validateAll();
    const configValid = this.validateConfigs();
    return valid && configValid;
  }

  private validateConfigs(): boolean {
    const configComp = this.$refs.config as UConfigItem;
    return configComp.validate();
  }

  private async onModalConfirm() {
    if (this.modalData.isView) {
      return true;
    }
    const valid = await this.validate();
    if (!valid) {
      return false;
    }
    const info: any = {};
    (this.modalData.info || []).forEach(i => i.key && (info[i.key] = i.value || ''));
    const readAuth = this.handleMultiSelect(this.modalData.readAuth);
    const writeAuth = this.handleMultiSelect(this.modalData.writeAuth);
    const editAuth = this.handleMultiSelect(this.modalData.editAuth);
    return this.onConfirm(Object.assign({}, this.modalData, {
      info, readAuth, writeAuth, editAuth
    }));
  }

  private handleMultiSelect(map: any) {
    const roles = (map.roles || []).map(r => isObject(r) ? r.value : r);
    const users = (map.users || []).map(u => isObject(u) ? u.email : u);
    return { roles, users };
  }
}
</script>

<style lang="scss">
.m-datasource-modal {
  .authority .content {
    display: block !important;
  }
}
</style>

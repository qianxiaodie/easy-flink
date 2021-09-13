<template>
  <ndc-modal class="m-metadata-modal" :width="480" :max-height="500" :visible="visible" :title="modalData.isEdit ? '修改元数据' : '新建元数据'" @hide="onHide" :on-confirm="onConfirmModal">
    <ndc-form>
      <ndc-form-item label="数据源" required>
        <u-validator name="dataSource" :validate="errors">
          <input
            class="ndc-input"
            name="dataSource"
            placeholder="请输入数据源"
            v-model="modalData.dataSource"
            :disabled="modalData.isEdit"
            v-validate="{
              required: '数据源'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="catalog" required>
        <u-validator name="catalog" :validate="errors">
          <input
            class="ndc-input"
            name="catalog"
            placeholder="请输入catalog"
            v-model="modalData.catalog"
            :disabled="modalData.isEdit"
            v-validate="{
              required: 'catalog'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="数据库" required>
        <u-validator name="db" :validate="errors">
          <input
            class="ndc-input"
            name="db"
            placeholder="请输入数据库"
            v-model="modalData.db"
            :disabled="modalData.isEdit"
            v-validate="{
              required: '数据库'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="元数据名称" required>
        <u-validator name="metaName" :validate="errors">
          <input
            class="ndc-input"
            name="metaName"
            placeholder="请输入元数据名称，最大长度为64个字符"
            v-maxlength="64"
            v-model="modalData.name"
            v-validate="{
              required: '元数据名称'
            }"
          />
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="元数据类型" required>
        <u-validator name="metaType" :validate="errors">
          <ndc-select
            name="metaType"
            placeholder="请选择元数据类型"
            :disabled="modalData.isEdit"
            :options="typeOptions"
            v-model="modalData.metaType"
            v-validate="{
              required: '元数据类型'
            }"
          ></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item label="编写元数据" required>
        <u-validator name="rawSql" :validate="errors">
          <m-sql-editor
            name="rawSql"
            ref="editor"
            v-model="modalData.rawSql"
            :options="{
              minimap: {
                enabled: false
              }
            }"
            @change="onChange"
          ></m-sql-editor>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import MSqlEditor from '../../develop/components/sql-editor/index.vue';

import ModalMixin from './mixin';

@Component({
  components: {
    MSqlEditor
  }
})
export default class MMetadataModal extends Mixins(ModalMixin) {
  private typeOptions: any = [];
  private editor?: any;

  public show(data: any, callback?: any) {
    this.typeOptions = (data.types || []).sort((a, b) => a.localeCompare(b)).map((t: string) => ({
      value: t,
      lebel: t
    }));
    this.showModal(data, callback);
    this.$nextTick(() => {
      this.editor && this.editor.resize();
    });
  }

  public mounted() {
    this.editor = this.$refs.editor;
  }

  private async onConfirmModal() {
    const valid = await this.validate();
    if (valid) {
      return this.onConfirm(null, false);
    }
    return false;
  }

  private async validate() {
    const valid = await this.$validator.validateAll();
    if (!this.modalData.rawSql) {
      this.errors.add({
        field: 'rawSql',
        msg: '元数据内容不能为空'
      });
      return false;
    }
    this.errors.remove('rawSql');
    return valid;
  }

  private onChange(val: string) {
    if (val) {
      return this.errors.remove('rawSql');
    }
    this.errors.add({
      field: 'rawSql',
      msg: '元数据内容不能为空'
    });
  }
}
</script>

<style lang="scss">
.m-metadata-modal {
  .m-sql-editor {
    height: 200px !important;
    border: $border;
    border-radius: 2px;
  }
}
</style>

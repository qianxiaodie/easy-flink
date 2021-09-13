<template>
  <ndc-modal title="任务提交用户" class="m-submitter-modal" :visible="visible" :width="modalData.kerberosOn ? 848 : 480" @hide="onHide" confirm-button="">
    <ndc-table :columns="columns" :data="list" :header-fixed="true">
      <template v-slot:td="scope">
        <span v-if="scope.column.name === 'product'">
          <u-validator v-if="scope.row.isEdit" name="product" :validate="errors">
            <ndc-select
              name="product"
              placeholder="请选择产品"
              value-key="product"
              label-key="product"
              :options="productOptions"
              :searchable="true"
              :disabled="!scope.row.isNew"
              v-model="scope.row.product"
              style="width: 100%;background: #fff;"
              v-validate="{
                required: '产品名'
              }"
            ></ndc-select>
          </u-validator>
          <span v-else>{{scope.row.product}}</span>
        </span>
        <span v-if="scope.column.name === 'submitter'">
          <u-validator v-if="scope.row.isEdit" name="submitter" :validate="errors">
            <input
              class="ndc-input"
              name="submitter"
              v-model="scope.row.submitter"
              style="width: 100%;"
              placeholder="请输入用户"
              autocomplete="off"
              v-validate="{
                required: '用户'
              }"
            />
          </u-validator>
          <span v-else>{{scope.row.submitter}}</span>
        </span>
        <span v-if="scope.column.name === 'principal'">
          <u-validator v-if="scope.row.isEdit" name="principal" :validate="errors">
            <input
              class="ndc-input"
              name="principal"
              v-model="scope.row.principal"
              style="width: 100%;"
              placeholder="请输入principal"
              autocomplete="off"
              v-validate="{
                required: 'principal'
              }"
            />
          </u-validator>
          <span v-else>{{scope.row.principal}}</span>
        </span>
        <span v-if="scope.column.name === 'keytab'">
          <u-validator v-if="scope.row.isEdit" name="keytab" :validate="errors">
            <input
              class="ndc-input"
              name="keytab"
              v-model="scope.row.keytab"
              style="width: 100%;"
              placeholder="请输入keytab"
              autocomplete="off"
              v-validate="{
                required: 'keytab'
              }"
            />
          </u-validator>
          <span v-else>{{scope.row.keytab}}</span>
        </span>
        <span v-if="scope.column.name === 'options'">
          <ndc-table-link class="g-mr-16" @click="ok(scope.row)" v-if="scope.row.isEdit">确定</ndc-table-link>
          <ndc-table-link class="g-mr-16" @click="edit(scope.row)" v-else>编辑</ndc-table-link>
          <ndc-table-link @click="cancel(scope.row, scope.index)" v-if="scope.row.isEdit">取消</ndc-table-link>
          <ndc-table-link @click="remove(scope.row)" v-else>删除</ndc-table-link>
        </span>
      </template>
    </ndc-table>
    <ndc-button class="btn-add" @click="add" :disabled="isEdit">新增</ndc-button>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { IProduct } from '@utils/types';
import { cloneDeep } from 'lodash';

interface ISubmitter {
  id?: number;
  clusterId?: number;
  product: string;
  submiter: string;
  isEdit?: boolean;
  isNew?: boolean;
};

const DEFAULT_COLUMNS = [{
  title: '产品名',
  name: 'product'
}, {
  title: '用户',
  name: 'submitter'
}, {
  title: '操作',
  name: 'options',
  width: '120px'
}];

const DEFAULT_KERBEROS_COLUMNS = [{
  title: '产品名',
  name: 'product'
}, {
  title: '用户',
  name: 'submitter'
}, {
  title: 'principal',
  name: 'principal'
}, {
  title: 'keytab',
  name: 'keytab'
}, {
  title: '操作',
  name: 'options',
  width: '120px'
}];

@Component
export default class MSubmitterModal extends Mixins(ModalMixin) {
  private columns: any[] = [];
  private isEdit: boolean = false;
  private originalList: ISubmitter[] = [];
  private list: ISubmitter[] = [];
  private productList: IProduct[] = [];
  private productOptions: IProduct[] = [];
  private clusterId: number = -1;

  public async show(data: any, callback?: any) {
    try {
      this.columns = data.kerberosOn ? DEFAULT_KERBEROS_COLUMNS : DEFAULT_COLUMNS;
      this.clusterId = data.clusterId;
      this.list = [];
      this.productList = [];
      this.isEdit = false;
      const productRequest = this.$request('getProductList', { userId: this.userId });
      const submitterRequest = this.refresh();
      this.productList = await productRequest;
      this.productOptions = cloneDeep(this.productList);
      await submitterRequest;
      this.showModal(data, callback);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async refresh() {
    const list = await this.$request('getSubmitterList', { clusterId: this.clusterId });
    this.list = (list || []).map(l => {
      l.isEdit = false;
      return l;
    });
    this.originalList = cloneDeep(this.list);
  }

  private async ok(item: ISubmitter) {
    try {
      const valid = await this.$validator.validateAll();
      if (!valid) {
        return;
      }
      await this.$request(item.isNew ? 'createSubmitter' : 'updateSubmitter', Object.assign({}, item, {
        clusterId: this.clusterId
      }));
      this.isEdit = false;
      this.productOptions = cloneDeep(this.productList);
      this.refresh();
    } catch (e) {
      this.$handleException(e, '提交用户修改失败');
    }
  }

  private edit(item: ISubmitter) {
    if (this.isEdit) {
      return this.$ndcconfirm({
        content: '请先保存当前正在编辑的内容',
        cancelButton: ''
      });
    }
    item.isEdit = true;
    this.isEdit = true;
    this.handleProductOptions(item);
  }

  private cancel(item: ISubmitter, index: number) {
    if (item.isNew) {
      this.list.splice(index, 1);
    } else {
      this.list.splice(index, 1, cloneDeep(this.originalList[index]));
    }
    this.isEdit = false;
  }

  private async remove(item: ISubmitter) {
    try {
      if (this.isEdit) {
        return this.$ndcconfirm({
          content: '请先保存当前正在编辑的内容',
          cancelButton: ''
        });
      }
      await this.$request('removeSubmitter', item);
      this.isEdit = false;
      this.refresh();
    } catch (e) {
      this.$handleException(e);
    }
  }

  private add() {
    const item = {
      submiter: '',
      product: '',
      isEdit: true,
      isNew: true
    };
    this.list.push(item);
    this.isEdit = true;
    this.handleProductOptions(item);
  }

  private handleProductOptions(item: ISubmitter) {
    const list = this.list.map(l => {
      if (l.product !== item.product) {
        return l.product;
      }
    });
    this.productOptions = this.productOptions.filter(p => !list.includes(p.product));
  }
}
</script>

<style lang="scss">
.m-submitter-modal {
  .ndc-table tbody tr {
    height: 56px;
  }
  .btn-add {
    margin-top: 16px;
    width: 100%;
  }
  .u-validator .error {
    top: calc(100% - 3px);
  }
}
</style>

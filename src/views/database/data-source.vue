<template>
  <div class="m-database-source">
    <div class="source-top">
      <div class="row g-flex-ac">
        <span class="label">类型</span>
        <ndc-select class="g-mr-64" style="width: 200px;" :options="typeList" v-model="dsType" @change="search"></ndc-select>
      </div>
      <div class="row g-flex-ac">
        <span class="label">数据源名称</span>
        <input class="ndc-input g-mr-64" style="width: 200px;" placeholder="请输入数据源名称" v-model="catalogName" @change="search" />
      </div>
      <div class="row g-flex-ac">
        <span class="label">类别</span>
        <ndc-select class="g-mr-64" style="width: 200px;" placeholder="请选择类别" :options="tagList" v-model="tag" clearable @change="search"></ndc-select>
      </div>
      <div class="row g-flex-ac">
        <span class="label">属性</span>
        <input class="ndc-input g-mr-64" style="width: 200px;" placeholder="请输入属性" v-model="info" @change="search" />
      </div>
      <div class="row g-flex-ac">
        <ndc-button theme="primary" @click="search">查询</ndc-button>
      </div>
    </div>
    <div class="source-content">
      <div class="table-header">
        <ndc-button theme="primary" @click="showModal()">新增</ndc-button>
      </div>
      <div class="table-body">
        <ndc-table :columns="columns" :data="datasourceList" :header-fixed="true">
          <template v-slot:td="scope">
            <span v-if="scope.column.name === 'options'">
              <ndc-table-link v-if="scope.row.editable" class="g-mr-16" @click="showModal(Object.assign({ isEdit: true }, scope.row))">编辑</ndc-table-link>
              <ndc-table-link v-else class="g-mr-16" @click="showModal(Object.assign({ isView: true }, scope.row))">查看</ndc-table-link>
              <ndc-table-link :disabled="!scope.row.editable" @click="removeDatasource(scope.row)">删除</ndc-table-link>
              <!-- <ndc-table-link class="g-ml-16" @click="refreshIndex(scope.row)">刷新索引</ndc-table-link> -->
            </span>
            <span v-else :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</span>
          </template>
        </ndc-table>
      </div>
      <div class="table-footer">
        <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
      </div>
    </div>
    <u-loading v-if="loading" loading-text="加载中，请稍候..."></u-loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { datasourceColumns, datasourceModalData } from './constant';
import { cloneDeep } from 'lodash';
import ModalMixin from '../components/modal/mixin';
import { NEW_MODAL_TYPE } from '../components/new-modal/constant';
import { v1 } from 'uuid';
import { IDatasource } from '@/utils/types';

@Component
export default class DatabaseDataSource extends Vue {
  private typeList: any[] = [{
    label: '全部',
    value: 'ALL'
  }];
  private dsType: string = 'ALL';
  private catalogName: string = '';
  private tag: string = '';
  private tagList: any[] = [];
  private info: string = '';
  private total: number= 0;
  private page: number = 1;
  private pageSize: number = 25;
  private datasourceList: IDatasource[] = [];
  private loading: boolean = false;
  private columns: any[] = datasourceColumns;
  private modalData: any = datasourceModalData;
  private modalInstance: ModalMixin | null = null;

  @Watch('page')
  private onPageChanged(val: number) {
    this.refresh();
  }

  @Watch('pageSize')
  private onPageSizeChanged(val: number) {
    this.page = 1;
    this.refresh();
  }

  private created() {
    this.getDatasourceTypeList();
    this.getDatasourceTagList();
    this.refresh();
  }

  private beforeDestroy() {
    this.modalInstance && this.modalInstance.hide();
    this.modalInstance = null;
  }

  private async getDatasourceTypeList() {
    try {
      const types = await this.$request('getDatasourceTypeList');
      this.typeList = [{
        label: '全部',
        value: 'ALL'
      }].concat((types || []).map(t => ({
        label: t,
        value: t
      })));
    } catch (e) {
      this.$handleException(e, '数据源类型获取失败');
    }
  }

  private async getDatasourceTagList() {
    try {
      const tags = await this.$request('getDatasourceTagList');
      this.tagList = (tags || []).map(t => ({
        label: t.tagName,
        value: t.id
      }));
    } catch (e) {
      this.$handleException(e, '数据源类别获取失败');
    }
  }

  private search() {
    this.page = 1;
    this.pageSize = 25;
    this.refresh();
  }

  private async refresh() {
    try {
      this.loading = true;
      const result = await this.$request('getDatasourceList', {
        offset: (this.page - 1) * this.pageSize,
        limit: this.pageSize,
        dsType: this.dsType === 'ALL' ? '' : this.dsType,
        catalogName: this.catalogName,
        tag: this.tag,
        info: this.info
      });
      this.datasourceList = (result.list || []).map(l => {
        l.creator = this.handleCreator(l.creator);
        l.lastModify = this.handleCreator(l.lastModify);
        l.info = this.handleInfo(l.info);
        return l;
      });
      this.total = result.count || 0;
    } catch (e) {
      this.$handleException(e, '数据源列表获取失败');
    } finally {
      this.loading = false;
    }
  }

  private handleCreator(email: string) {
    const arr = email.split('@');
    return arr.length ? arr[0] : '';
  }

  private handleInfo(info: any = {}) {
    const result: any[] = [];
    const keys = Object.keys(info);
    keys.forEach(key => result.push({ key, value: info[key] || '', uuid: v1() }));
    return result;
  }

  private async showModal(args) {
    args = cloneDeep(args || this.modalData);
    // args = cloneDeep(this.modalData || args);
    console.log(args,'argsssss')
    // 报错cannot read roles of null
    if (args.editAuth === null) {
      args.editAuth = this.modalData.editAuth;
    }
    if (args.readAuth === null) {
      args.readAuth = this.modalData.readAuth;
    }
    if (args.writeAuth === null) {
      args.writeAuth = this.modalData.writeAuth;
    }

    if (!this.modalInstance) {
      this.modalInstance = await this.$createNewModalInstance(NEW_MODAL_TYPE.datasource);
    }
    this.modalInstance && this.modalInstance.show(args, async (params: any) => {
      debugger
      if (args.isView) {
        return true;
      }
      try {
        if (args.isEdit) {
          await this.$request('updateDatasource', params);
        } else {
          await this.$request('createDatasource', params);
        }
        await this.search();
        this.$ndcmessage.success('新增数据源成功');
        return true;
      } catch (e) {
        this.modalInstance && this.modalInstance.setError(e.message);
      }
    });
  }

  private removeDatasource(item: any) {
    this.$ndcconfirm({
      content: '删除数据源',
      desc: '数据源删除后将无法恢复，确认删除吗？',
      onConfirm: async () => {
        try {
          await this.$request('removeDatasource', item);
          await this.search();
          this.$ndcmessage.success('删除数据源成功');
        } catch (e) {
          this.$handleException(e, '删除数据源失败');
        }
      }
    });
  }

  private refreshIndex() {
    // TODO:
  }
}
</script>

<style lang="scss">
.m-database-source {
  width: 100%;
  height: 100%;
  border: $border;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  background: #fff;
  .source-top {
    display: flex;
    flex-wrap: wrap;
    .row {
      height: 48px;
      line-height: 48px;
      color: #333;
      .label {
        margin-right: 12px;
      }
    }
  }
  .source-content {
    height: 0;
    flex: 1;
    display: flex;
    flex-direction: column;
    .table-header {
      padding: 16px 0;
    }
    .table-body {
      flex: 1;
      height: 0;
      .ndc-table {
        height: 100%;
        &-header {
          background: #f2f4f9;
          border-bottom: $border;
          tr {
            border: none !important;
          }
        }
      }
    }
    .table-footer {
      padding-top: 16px;
    }
  }
}
</style>

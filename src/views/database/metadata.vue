<template>
  <div class="m-database-metadata">
    <div class="left">
      <div class="newdb">
        <ndc-button theme="primary" @click="showDBModal()">新建 DB</ndc-button>
      </div>
      <div class="search-bar">
        <u-searchbox placeholder="搜索数据库" @change="dbKeyword = arguments[0].value" @clear="dbKeyword = ''"></u-searchbox>
      </div>
      <div class="databases">
        <ndc-virtual-list ref="list" :data="databaseList" :selected-nodes="selectedKeys" @click="selectDatabase" @right-click="onRightClick">
          <template v-slot:item="scope">
            <div class="g-flex-ac" style="height: 32px;line-height: 32px;">
              <i class="ndc-icon-db" />
              <span class="g-ml-8 g-text-nowrap" :title="scope.item && scope.item.db">{{scope.item && scope.item.db}}</span>
            </div>
          </template>
        </ndc-virtual-list>
      </div>
    </div>
    <div class="right" v-if="databaseList.length === 0 || !selectedDb">
      <div class="empty">
        <img src="../../assets/images/metadata.svg" />
        <span class="empty-desc">请选择数据库</span>
      </div>
    </div>
    <div class="right" v-else>
      <div class="db">
        <i class="ndc-icon-db" />
        <span class="g-ml-8">{{selectedDb && selectedDb.db || ''}}</span>
      </div>
      <div class="tool">
        <div class="tool-left g-flex-ac">
          <ndc-select class="g-mr-16" style="width: 180px;" :options="typeOptions" v-model="type" @change="getTableList" clearable></ndc-select>
          <input class="ndc-input g-mr-16" style="width: 180px;" placeholder="请输入topic" :value="topicKeyword" @change="topicKeyword = arguments[0].target.value" />
          <u-searchbox placeholder="搜索表名" @change="tableKeyword = arguments[0].value" @clear="tableKeyword = ''"></u-searchbox>
        </div>
        <div class="tool-right">
          <ndc-button theme="primary" @click="showModal()">新建表</ndc-button>
        </div>
      </div>
      <div class="table">
        <div class="table-body">
          <ndc-table :columns="columns" :data="tableList" :header-fixed="true">
            <template v-slot:td="scope">
              <span v-if="scope.column.name === 'options'">
                <ndc-table-link class="g-mr-16" @click="showModal(Object.assign({}, scope.row, { isEdit: true }))">编辑</ndc-table-link>
                <ndc-table-link class="g-mr-16" @click="showModal(scope.row, true)">复制</ndc-table-link>
                <ndc-table-link @click="removeTable(scope.row)">删除</ndc-table-link>
              </span>
              <span v-else-if="scope.column.name === 'table'">
                <span class="g-text-link" @click="clickToDetail(scope.row)">{{scope.row.table}}</span>
              </span>
              <span v-else :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</span>
            </template>
          </ndc-table>
        </div>
        <div class="table-footer">
          <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
        </div>
      </div>
      <u-loading v-if="tableLoading" loading-text="加载中，请稍候..."></u-loading>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { tableColumns, metadataModalData } from './constant';
import ModalMixin from '../components/modal/mixin';
import { cloneDeep } from 'lodash';
import { NEW_MODAL_TYPE } from '../components/new-modal/constant';
import { Mutation } from 'vuex-class';
import { MODULE_NAMESPACE } from '../../utils/constant';
import { v1 } from 'uuid';
import UContextMenu from '../../components/context-menu/context-menu.vue';
import { IMenuItem } from '../../utils/types';

const metaMenuItems: IMenuItem[] = [{
  key: 'delete',
  label: '删除'
}];

@Component
export default class DatabaseMetadata extends Vue {
  private dbKeyword: string = '';
  private databaseList: any[] = [];
  private selectedDb: any = null;
  private tableList: any[] = [];
  private tableLoading: boolean = false;
  private type: string = '';
  private typeOptions: any[] = [{
    label: '当前用户',
    value: 'current-user'
  }, {
    label: '当前db',
    value: 'current-db'
  }];
  private tableKeyword: string = '';
  private topicKeyword: string = '';
  private columns: any[] = tableColumns;
  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private modalData: any = metadataModalData;
  private modalInstance: ModalMixin | null = null;
  private dbModalInstance: ModalMixin | null = null;
  private metaContextMenuInstance: UContextMenu | null = null;
  private toRemoveDB: any = null;

  private get selectedKeys(): string[] {
    return this.selectedDb ? [this.selectedDb.key] : [];
  }

  @Watch('dbKeyword')
  private onDbKeywordChanged() {
    this.getDatabaseList();
  }

  @Watch('tableKeyword')
  private onTableKeywordChanged() {
    this.getTableList();
  }

  @Watch('topicKeyword')
  private onTopicKeyword() {
    this.getTableList();
  }

  @Watch('page')
  private onPageChanged(val: number) {
    this.getTableList();
  }

  @Watch('pageSize')
  private onPageSizeChanged(val: number) {
    this.page = 1;
    this.getTableList();
  }

  private async created() {
    await this.init();
  }

  private async activated() {
    await this.init();
  }

  private mounted() {
    this.setDatabaseKeepAliveList(['DatabaseMetadata']);
  }

  private beforeDestroy() {
    this.modalInstance && this.modalInstance.hide();
    this.modalInstance = null;
    this.dbModalInstance && this.dbModalInstance.hide();
    this.dbModalInstance = null;
  }

  @Mutation('SET_DATABASEKEEPALIVELIST', MODULE_NAMESPACE.global)
  private setDatabaseKeepAliveList!: any;

  private async init() {
    const { db = '' } = this.$route.query || {};
    await this.getDatabaseList();
    if (this.databaseList.length) {
      let selectedDb = this.databaseList[0];
      if (db) {
        const database = (this.databaseList || []).find(d => d.db === db);
        database && (selectedDb = database);
      }
      this.selectDatabase(selectedDb);
    }
  }

  private resize() {
    const comp = this.$refs.list as any;
    comp && comp.resize();
  }

  private async getDatabaseList() {
    try {
      const list = await this.$request('getDatabaseList', {
        db: this.dbKeyword
      });
      this.databaseList = (list || []).map(l => {
        l.key = l.db;
        return l;
      });
      this.$nextTick(() => {
        this.resize();
      });
    } catch (e) {
      this.$handleException(e, '获取元数据列表失败');
    }
  }

  private selectDatabase(db) {
    if (db && db.db) {
      this.selectedDb = db;
      this.$router.push({
        path: '/sloth/database/metadata',
        query: {
          db: db.db
        }
      }).catch(e => {});
      this.getTableList();
    }
  }

  private async getTableList() {
    try {
      this.tableLoading = true;
      const result = await this.$request('getTableList', {
        db: this.selectedDb.db,
        table: this.tableKeyword,
        type: this.type,
        offset: (this.page - 1) * this.pageSize,
        limit: this.pageSize,
        topic: this.topicKeyword
      });
      this.total = result.count || 0;
      this.tableList = (result.data || []).map(l => {
        if (l.externalConf && l.externalConf.topic) {
          l.topic = l.type === 'kafka' ? l.externalConf.topic.split(',') : l.externalConf.topic;
        }
        if (l.externalConf && l.externalConf.delimiter) {
          l.delimiter = l.externalConf.delimiter;
        }
        l.fields = (l.fields || []).map(f => {
          f.uuid = v1();
          return f;
        });
        l.metadata = this.handleMetadata(l.metadata);
        l.creator = this.handleCreator(l.creator);
        l.modifier = this.handleCreator(l.modifier);
        return l;
      });
    } catch (e) {
      this.$handleException(e, '获取数据表失败');
    } finally {
      this.tableLoading = false;
    }
  }

  private handleCreator(email: string) {
    const arr = email.split('@');
    return arr.length ? arr[0] : '';
  }

  private handleMetadata(info: any = {}) {
    const result: any[] = [];
    const keys = Object.keys(info);
    keys.forEach(key => result.push({ key, value: info[key] || '', uuid: v1() }));
    return result;
  }

  private async removeTable(item: any) {
    this.$ndcconfirm({
      content: '删除表',
      desc: '表删除后将无法恢复，确认删除吗？',
      onConfirm: async () => {
        try {
          await this.$request('removeTable', item);
          await this.getTableList();
          this.$ndcmessage.success('删除表成功');
        } catch (e) {
          this.$handleException(e, '删除表失败');
        }
      }
    });
  }

  private async showModal(args: any, isCopy: boolean = false) {
    args = cloneDeep(args || this.modalData);
    if (isCopy) {
      args.table += '-copy';
    }
    if (!args.db && this.selectedDb) {
      args.db = this.selectedDb.db;
    }
    if (!this.modalInstance) {
      this.modalInstance = await this.$createNewModalInstance(NEW_MODAL_TYPE.metadata);
    }
    this.modalInstance && this.modalInstance.show(args, async (params: any) => {
      try {
        if (args.isEdit) {
          await this.$request('updateTable', params);
        } else {
          await this.$request('createTable', params);
        }
        await this.getTableList();
        this.$ndcmessage.success(args.isEdit ? '更新表成功' : '新增表成功');
        return true;
      } catch (e) {
        this.modalInstance && this.modalInstance.setError(e.message);
      }
    });
  }

  private clickToDetail(item: any) {
    const { catalog = '', db = '', table = '' } = item;
    this.$router.push({
      path: '/sloth/database/metadata/tabledetail',
      query: { catalog, db, table }
    });
  }

  private async showDBModal() {
    if (!this.dbModalInstance) {
      this.dbModalInstance = await this.$createNewModalInstance(NEW_MODAL_TYPE.database);
    }
    this.dbModalInstance && this.dbModalInstance.show({
      db: '',
      desc: ''
    }, async (params: any) => {
      try {
        await this.$request('createDB', params);
        await this.getDatabaseList();
        this.$ndcmessage.success('新增 DB 成功');
        return true;
      } catch (e) {
        this.dbModalInstance && this.dbModalInstance.setError(e.message);
      }
    });
  }

  private onRightClick(e) {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
    this.toRemoveDB = e.node;
    this.showMetaContextMenu(e);
  }

  private showMetaContextMenu(e: any) {
    if (!this.metaContextMenuInstance) {
      this.metaContextMenuInstance = this.$contextmenu(metaMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'delete') {
          return this.removeDB();
        }
      });
    }
    this.metaContextMenuInstance && this.metaContextMenuInstance.open(e.event);
  }

  private async removeDB() {
    this.$ndcconfirm({
      content: '删除数据库',
      desc: '数据库删除后将无法恢复，确认删除吗？',
      onConfirm: async () => {
        try {
          await this.$request('removeDB', this.toRemoveDB || {});
          await this.init();
          this.toRemoveDB = null;
          this.$ndcmessage.success('删除数据库成功');
        } catch (e) {
          this.$handleException(e, '删除数据库失败');
        }
      }
    });
  }
}
</script>

<style lang="scss">
.m-database-metadata {
  width: 100%;
  height: 100%;
  border: $border;
  box-sizing: border-box;
  display: flex;
  background: #fff;
  .left {
    display: flex;
    flex-direction: column;
    height: 100%;
    width: 250px;
    border-right: $border;
    box-sizing: border-box;
    .newdb {
      padding: 16px 16px 0 16px;
      width: 100%;
      box-sizing: border-box;
    }
    .search-bar {
      padding: 16px;
      width: 100%;
      box-sizing: border-box;
      .u-searchbox {
        width: 100%;
      }
    }
    .databases {
      flex: 1;
      height: 0;
      .ndc-virtual-list {
        .ndc-virtual-list-item {
          color: #666;
          &.active {
            color: #3B68B7;
            background: #f5f7fa;
          }
          .ndc-icon-db {
            font-size: 16px;
          }
        }
      }
    }
  }
  .right {
    flex: 1;
    width: 0;
    padding: 16px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    .empty {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      margin-top: 150px;
      &-desc {
        margin-top: 24px;
        color: #999;
      }
    }
    .db {
      text-align: center;
      font-size: 24px;
      color: #999;
      line-height: 36px;
      padding-bottom: 16px;
      border-bottom: $border;
    }
    .tool {
      padding: 16px 0;
      display: flex;
      justify-content: space-between;
    }
    .table {
      display: flex;
      flex-direction: column;
      flex: 1;
      height: 0;
      &-body {
        flex: 1;
        height: 0;
        .ndc-table {
          height: 100%;
          td {
            white-space: inherit !important;
            word-break: break-all;
          }
          &-header {
            background: #f2f4f9;
            border-bottom: $border;
            tr {
              border: none !important;
            }
          }
        }
      }
      &-footer {
        padding-top: 16px;
      }
    }
  }
}
</style>

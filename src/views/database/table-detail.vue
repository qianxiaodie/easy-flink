<template>
  <div class="m-table-detail">
    <div class="back g-flex-ac">
      <i class="ndc-icon-back f-csp g-mr-16" @click="clickToBack" />
      <span>{{tableInfo.table || ''}}</span>
      <i v-if="tableInfo.table" class="ndc-icon-edit2 f-csp g-ml-8" @click="showModal" />
    </div>
    <div class="info">
      <u-info head="基本信息">
        <u-info-section>
          <u-info-item label="表名" :title="tableInfo.table">{{tableInfo.table}}</u-info-item>
          <u-info-item label="创建人">{{tableInfo.creator}}</u-info-item>
          <u-info-item label="修改人">{{tableInfo.modifier}}</u-info-item>
          <u-info-item label="类型">{{tableInfo.type}}</u-info-item>
          <u-info-item label="数据源" :title="tableInfo.db">{{tableInfo.db}}</u-info-item>
          <u-info-item label="序列化方式">{{tableInfo.formatType}}</u-info-item>
          <u-info-item label="topic" :title="tableInfo.topicStr">{{tableInfo.topicStr}}</u-info-item>
          <u-info-item label="创建日期">{{tableInfo.createTime}}</u-info-item>
          <u-info-item label="修改日期">{{tableInfo.updateTime}}</u-info-item>
          <u-info-item label="描述" size="large" :title="tableInfo.comments">{{tableInfo.comments}}</u-info-item>
        </u-info-section>
      </u-info>
      <u-info head="字段信息">
        <ndc-table :columns="fieldColumns" :data="tableInfo.fields"></ndc-table>
      </u-info>
      <u-info head="配置信息">
        <ndc-table :columns="configColumns" :data="tableInfo.metadata"></ndc-table>
      </u-info>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ModalMixin from '../components/modal/mixin';
import { NEW_MODAL_TYPE } from '../components/new-modal/constant';
import { fieldColumns, configColumns } from './constant';

@Component
export default class MTableDetail extends Vue {
  private tableInfo: any = {};
  private modalInstance: ModalMixin | null = null;
  private fieldColumns: any[] = fieldColumns;
  private configColumns: any[] = configColumns;
  private catalog: string = '';
  private db: string = '';
  private table: string = '';

  private created() {
    const query: any = this.$route.query || {};
    this.catalog = query.catalog || '';
    this.db = query.db || '';
    this.table = query.table || '';
    this.getTableDetail();
  }

  private async getTableDetail() {
    try {
      const info = await this.$request('getTableDetail', {
        catalog: this.catalog,
        db: this.db,
        table: this.table
      });
      info.metadata = this.handleInfo(info.metadata);
      if (info.externalConf && info.externalConf.topic) {
        info.topic = info.type === 'kafka' ? info.externalConf.topic.split(',') : info.externalConf.topic;
        info.topicStr = info.externalConf.topic;
      }
      this.tableInfo = info;
    } catch (e) {
      this.$handleException(e, '获取表详情失败');
    }
  }

  private handleInfo(info: any = {}) {
    const result: any[] = [];
    const keys = Object.keys(info);
    keys.forEach(key => result.push({ key, value: info[key] || '' }));
    return result.sort((a, b) => (a.key || '').localeCompare(b.key || ''));
  }

  private clickToBack() {
    this.$router.back();
  }

  private async showModal() {
    if (!this.modalInstance) {
      this.modalInstance = await this.$createNewModalInstance(NEW_MODAL_TYPE.metadata);
    }
    this.modalInstance && this.modalInstance.show(Object.assign({}, this.tableInfo, { isEdit: true }), async (params: any) => {
      try {
        await this.$request('updateTable', params);
        await this.getTableDetail();
        this.$ndcmessage.success('编辑表成功');
        return true;
      } catch (e) {
        this.modalInstance && this.modalInstance.setError(e.message);
      }
    });
  }
}
</script>

<style lang="scss">
.m-table-detail {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  border: $border;
  background: #fff;
  .back {
    font-size: 28px;
    color: #999;
    padding: 16px;
  }
  .info {
    flex: 1;
    height: 0;
    overflow-y: auto;
    padding: 0 16px;
    color: #222;
    box-sizing: border-box;
    .card {
      margin-bottom: 32px;
      .title {
        font-size: 16px;
        margin-bottom: 16px;
      }
    }
  }
}
</style>

<template>
  <div class="m-normal-list ndc-table">
    <div class="ndc-table-header">
      <table>
        <thead>
          <tr>
            <th v-for="(column, index) in columns" :key="index" :style="{width: column.width}">
              <div class="g-flex-ac" v-if="column.name === 'creator'">
                <span>{{column.title}}</span>
                <a-popover title="" trigger="click" v-model="visible">
                  <template v-slot:content>
                    <input
                      class="ndc-input"
                      type="text"
                      :placeholder="isAdmin ? '请输入操作人' : '请输入创建人'"
                      v-model="creator"
                      @change="onCreatorChange"
                    />
                  </template>
                  <i class="g-ml-4 ndc-icon-filter2" :class="{'active': !!creator}" @click="visible = true"></i>
                </a-popover>
              </div>
              <div class="g-flex-ac" v-else>
                {{column.title}}
                <ndc-table-filter class="g-ml-4" v-if="column.filters" :filters="column.filters" :value="filterValue[column.name]" @select="onFilter(arguments[0], column)"></ndc-table-filter>
                <ndc-table-order ref="columnOrder" class="g-ml-4" v-if="column.orderable" :order="column.order" @order="onOrder(arguments[0], column)"></ndc-table-order>
              </div>
            </th>
          </tr>
        </thead>
      </table>
    </div>
    <div class="ndc-table-body" v-if="operationList.length">
      <table>
        <tbody>
          <tr v-for="(row, index) in operationList" :key="row.jobId || index" @click="onClickRow(row)" :class="{'active': isSimple && selected === row.jobId}">
            <td v-for="(col, idx) in columns" :key="col.name || idx" :style="{width: col.width}">
              <span v-if="col.name === 'operation'">
                <ndc-table-link :disabled="starting.includes(row.jobId)" v-if="startButtonStatus.includes(row.jobStatus)" @click="start(row)">启动</ndc-table-link>
                <ndc-table-link v-else :disabled="recoverDisabledStatus.includes(row.jobStatus) || starting.includes(row.jobId)" @click="recover(row)">恢复</ndc-table-link>
                <ndc-table-link :disabled="stopDisabledStatus.includes(row.jobStatus) || stoping.includes(row.jobId)" class="g-ml-8" @click="stop(row)">停止</ndc-table-link>
                <ndc-table-link v-if="!isAdmin" :disabled="downDisabledStatus.includes(row.jobStatus)" class="g-ml-8" @click="down(row)">下线</ndc-table-link>
                <ndc-table-link v-if="!isAdmin" :disabled="alarmDisabledStatus.includes(row.jobStatus)" class="g-ml-8" @click="setAlarm(row)">设置报警</ndc-table-link>
                <!-- <ndc-table-link v-if="isAdmin" class="g-ml-8" @click="editJobStatus(row)">修改任务状态</ndc-table-link> -->
              </span>
              <span v-else-if="col.name === 'jobStatus'">
                <span style="color: #f04346;" v-if="row[col.name] === 'CRASHED' || row[col.name] === 'FAILED'">{{statusMap[row[col.name]]}}</span>
                <span v-else>{{statusMap[row[col.name]]}}</span>
              </span>
              <span v-else-if="col.name === 'runtimeStatus'">
                <div class="status g-flex-ac" v-if="row[col.name] === 'NORMAL'">
                  <u-wave-icon></u-wave-icon>
                  {{runtimeStatusMap[row[col.name]]}}
                </div>
                <div class="status g-flex-ac" v-else-if="row[col.name] === 'ABNORMAL'">
                  <div class="icon abnormal"></div>
                  {{runtimeStatusMap[row[col.name]]}}
                </div>
                <div class="status g-flex-ac" v-else-if="row[col.name] === 'FAILED'">
                  <div class="icon failed"></div>
                  {{runtimeStatusMap[row[col.name]]}}
                </div>
                <span style="margin-left: 4px;" v-else>-</span>
              </span>
              <span v-else-if="col.name === 'jobName'">
                <span v-if="isSimple" :title="row[col.name]">{{row[col.name]}}</span>
                <ndc-table-link v-else-if="isOverview" @click="jump(row)">
                  <span :title="row[col.name]">{{row[col.name]}}</span>
                </ndc-table-link>
                <ndc-table-link v-else-if="isAdmin" @click="jumpToDetail(row)">
                  <span :title="row[col.name]">{{row[col.name]}}</span>
                </ndc-table-link>
                <ndc-table-link v-else @click="view(row)">
                  <span :title="row[col.name]">{{row[col.name]}}</span>
                </ndc-table-link>
              </span>
              <span :title="clusterMap[row[col.name]]" v-else-if="col.name === 'clusterId'">
                {{clusterMap[row[col.name]]}}
              </span>
              <span :title="handleCreator(row[col.name])" v-else-if="col.name === 'creator'">
                {{handleCreator(row[col.name])}}
              </span>
              <span :title="parseTagNames(row[col.name])" v-else-if="col.name === 'tagIds'">
                {{parseTagNames(row[col.name])}}
              </span>
              <span v-else-if="col.name === 'startTime'">
                {{row['jobStatus'] === 'READY' ? '-' : row[col.name]}}
              </span>
              <span :title="row[col.name]" v-else>{{row[col.name]}}</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <ndc-table-empty v-else>{{emptyText}}</ndc-table-empty>
    <div class="pagination">
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="!isSimple" :size-visible="!isSimple" :jump-visible="!isSimple" :small="true"></ndc-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';

import { IJob, ITag, IAlarmConfigMeta, IAlarmConfigMetaItem, ICluster, IPageInfo } from '@utils/types';
import { STATUS_MAP, RUNTIME_STATUS_MAP, NORMAL_LIST_COLUMNS, STATUS_OPTIONS } from '../../constant';
import { MODULE_NAMESPACE } from '@utils/constant';
import { cloneDeep } from 'lodash';
import Operation from '../../index.vue';
import ModalMixin from '../../../components/modal/mixin';
import { MODAL_TYPE } from '../../../components/modal/constant';
import MRecoveryJob from '../../../administrator/recovery/job.vue';
import Bus from '@/bus';
import MOperationList from './index.vue';

@Component
export default class MNormalList extends Vue {
  @Prop({
    default: ''
  })
  private keyword!: string;

  @Prop({
    default: false
  })
  private isSimple!: boolean;

  @Prop({
    default: false
  })
  private isOverview!: boolean;

  @Prop({
    default: false
  })
  private isAdmin!: boolean;

  @Prop({
    default: 'ALL'
  })
  private jobType!: string;

  @Prop({
    default: ''
  })
  private jobStatus!: string;

  @Prop({
    default: ''
  })
  private runtimeStatus!: string;

  @Prop({
    default: -1
  })
  private selectedJobId!: number;

  @Prop({
    default() {
      return [];
    }
  })
  private starting!: number[];

  @Prop({
    default() {
      return [];
    }
  })
  private stoping!: number[];

  @State('operationList', MODULE_NAMESPACE.operation)
  private operationList!: IJob[];

  @State('tagList', MODULE_NAMESPACE.develop)
  private tagList!: ITag[];

  @State('product', MODULE_NAMESPACE.global)
  private product!: string;

  @State('userId', MODULE_NAMESPACE.global)
  private userId!: string;

  @Inject('operation')
  private operation!: Operation;

  @Watch('keyword')
  private onKeywordChanged(val: string) {
    this.page = 1;
    this.refresh();
  }

  @Watch('jobType')
  private onJobTypeChanged(val: string) {
    this.filterValue['jobType'] = val || 'ALL';
    this.page = 1;
    this.refresh();
  }

  @Watch('jobStatus')
  private onJobStatusChanged(val: string) {
    this.filterValue['jobStatus'] = val || 'ALL';
    this.page = 1;
    this.refresh();
  }

  @Watch('runtimeStatus')
  private onRuntimeStatusChanged(val: string) {
    this.filterValue['runtimeStatus'] = val || 'ALL';
    this.page = 1;
    this.refresh();
  }

  @Watch('selectedJobId')
  private onSelectedJobIdChanged(val: number) {
    if (val !== -1) {
      this.selected = val;
    }
  }

  @Watch('page')
  private onPageChanged(val: number) {
    this.refresh();
  }

  @Watch('pageSize')
  private onPageSizeChanged(val: number) {
    this.page = 1;
    this.refresh();
  }

  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private filterValue: any = {
    clusterId: 'ALL',
    jobStatus: 'ALL',
    runtimeStatus: 'ALL',
    tagIds: 'ALL',
    jobType: 'ALL'
  }
  private orderKey: string = 'startTime';
  private orderValue: any = {
    startTime: 'desc'
  };
  private statusMap: any = STATUS_MAP;
  private runtimeStatusMap: any = RUNTIME_STATUS_MAP;
  private startButtonStatus: string[] = ['CRASHED', 'FAILED', 'READY'];
  private recoverDisabledStatus: string[] = ['RUNNING', 'STARTING', 'STOPPING'];
  private stopDisabledStatus: string[] = ['STOPPED', 'FINISHED', 'READY', 'STARTING', 'STOPPING', 'CRASHED', 'FAILED'];
  private downDisabledStatus: string[] = ['RUNNING', 'STARTING', 'STOPPING'];
  private alarmDisabledStatus: string[] = ['STARTING', 'STOPPING'];
  private alarmModalInstance: ModalMixin | null = null;
  private statusModalInstance: ModalMixin | null = null;
  private selected: number = -1;
  private alarmConfig: any = {};
  private clusterList: ICluster[] = [];
  private clusterMap: any = {};
  private timer: any = null;
  private creator: string = '';
  private visible: boolean = false;

  private get emptyText(): string {
    if (this.keyword) {
      return '搜索结果为空';
    } else {
      let isFilter = false;
      Object.keys(this.filterValue).forEach(filter => {
        if (this.filterValue[filter] !== 'ALL') {
          isFilter = true;
        }
      });
      return isFilter ? '筛选结果为空' : '暂无数据';
    }
  }

  private get columns() {
    const columns = cloneDeep(NORMAL_LIST_COLUMNS);
    if (this.isSimple) {
      columns[1].width = '100px';
      columns[2].width = '100px';
      return columns.slice(0, 3);
    }
    if (this.isOverview) {
      columns[1].width = '10%';
      columns[2].width = '10%';
      columns[3].width = '12%';
      columns[4].width = '14%';
    }
    if (this.isAdmin) {
      columns[1].width = '10%';
      columns[2].width = '10%';
      columns[4].width = '16%';
      columns[6].width = '7%';
    }
    columns[3].filters = this.tagFilters;
    columns[5].filters = this.clusterFilters;
    if (this.isOverview) {
      columns.splice(columns.length - 1, 1);
    }
    if (this.isAdmin) {
      columns.splice(columns.length - 2, 1);
      columns.splice(3, 1);
    }
    return columns;
  }

  private get clusterFilters(): any[] {
    const result: any[] = [{
      key: 'ALL',
      value: '全部'
    }];
    this.clusterList.forEach(cluster => result.push({
      key: cluster.id,
      value: cluster.clusterName
    }));
    return result;
  }

  private get tagFilters(): any[] {
    const result: any[] = [{
      key: 'ALL',
      value: '全部'
    }];
    this.tagList.forEach(tag => {
      result.push({
        key: tag.id,
        value: tag.name
      });
    });
    return result;
  }

  @Action('getOperationJobList', MODULE_NAMESPACE.operation)
  private getOperationJobList!: any;

  public setClusterList(list: ICluster[]) {
    this.clusterList = list;
  }

  public async refresh() {
    const params = this.genParams();
    if (this.isAdmin) {
      Bus.$emit('admin_job_refresh', params);
      return;
    }
    const result = await this.getOperationJobList(params);
    this.refreshList(result);
  }

  private created() {
    Bus.$on('job_list_init', this.init);
    Bus.$on('job_list_refresh', this.refreshList);
    Bus.$on('job_list_reset', this.reset);
  }

  private async mounted() {
    try {
      this.handleClusterList();
      if (!this.isOverview) {
        const alarmConfig = await this.$request('getAlarmRulesMeta');
        this.handleAlarmConfig(alarmConfig);
        this.timer = setInterval(this.refresh, 5000);
      }
    } catch (e) {
      this.$handleException(e);
    }
  }

  private beforeDestroy() {
    this.alarmModalInstance && this.alarmModalInstance.hide();
    this.alarmModalInstance = null;
    this.statusModalInstance && this.statusModalInstance.hide();
    this.statusModalInstance = null;
    this.timer && clearInterval(this.timer);
    this.timer = null;
    Bus.$off('job_list_init', this.init);
    Bus.$off('job_list_refresh', this.refreshList);
    Bus.$off('job_list_reset', this.reset);
  }

  private reset() {
    this.page = 1;
    this.pageSize = 25;
    this.filterValue = {
      clusterId: 'ALL',
      jobStatus: 'ALL',
      runtimeStatus: 'ALL',
      tagIds: 'ALL',
      jobType: 'ALL'
    };
    this.orderValue = {
      startTime: 'desc'
    };
    this.creator = '';
    this.refresh();
  }

  private refreshList(result) {
    const pageInfo = result && result.page as IPageInfo;
    this.page = (pageInfo && pageInfo.pageIndex) || 1;
    this.total = (pageInfo && pageInfo.objTotal) || 0;
  }

  private init() {
    const arr = (this.userId || '').split('@');
    this.creator = arr.length ? arr[0] : '';
    this.orderValue = {
      startTime: ''
    };
    const comp = this.$refs.columnOrder[0] as any;
    comp && comp.setValue && comp.setValue('');
  }

  private genParams() {
    const params: any = {
      pageNo: this.page,
      pageSize: this.pageSize,
      order: this.orderValue.startTime || 'desc',
      orderBy: this.orderValue.startTime ? 'startTime' : 'deployTime'
    };
    if (this.keyword) {
      params.jobName = this.keyword;
    }
    if (this.creator) {
      params.creator = this.creator;
    }
    if (this.filterValue.jobType && this.filterValue.jobType !== 'ALL') {
      params.jobType = this.filterValue.jobType;
    }
    if (this.filterValue.jobStatus && this.filterValue.jobStatus !== 'ALL') {
      params.jobStatus = this.filterValue.jobStatus;
    }
    if (this.filterValue.runtimeStatus && this.filterValue.runtimeStatus !== 'ALL') {
      params.runtimeStatus = this.filterValue.runtimeStatus === 'OTHERS' ? 'IDLE' : this.filterValue.runtimeStatus;
    }
    if (this.filterValue.clusterId && this.filterValue.clusterId !== 'ALL') {
      params.clusterId = this.filterValue.clusterId;
    }
    if (!this.isAdmin && this.filterValue.tagIds && this.filterValue.tagIds !== 'ALL') {
      params.tagIds = [this.filterValue.tagIds];
    }
    return params;
  }

  private async handleClusterList() {
    this.clusterList = await this.$request('getClusterList');
    this.clusterMap = {};
    this.clusterList.forEach(cluster => {
      if (!this.clusterMap[cluster.id]) {
        this.clusterMap[cluster.id] = cluster.clusterName;
      }
    });
  }

  private handleCreator(email: string) {
    const arr = email.split('@');
    return arr.length ? arr[0] : '';
  }

  private handleAlarmConfig(config: any) {
    const columnSeq = config.columnSeq;
    const alarmConfig = config.data || [];

    const requiredRules: IAlarmConfigMeta[] = [];
    const optionalRules: any[] = [];
    const rulesMap: any = {};
    const requiredMetricTypes: any[] = [];
    const metricTypes: any[] = [];
    const metricTypesMap: any = {};
    for (let i = 0, len = alarmConfig.length; i < len; i++) {
      const rule = alarmConfig[i];
      const keys = Object.keys(rule);
      keys.forEach(key => {
        const value = rule[key];
        if (key !== 'id' && key !== 'optional' && (value !== '-1' || value !== -1)) {
          rule[key] = value;
        }
      });
      const metricType = rule.metricType;
      if (rule.optional) {
        optionalRules.push(rule);
        metricTypes.push(metricType);
      } else {
        requiredRules.push(rule);
        requiredMetricTypes.push(metricType);
      }
      const id = metricType.id;
      if (!rulesMap[id]) {
        rulesMap[id] = rule;
      }
      metricTypesMap[id] = metricType.value;
    }

    this.alarmConfig = {
      columnSeq,
      metricTypes,
      metricTypesMap,
      requiredMetricTypes,
      rulesMap,
      requiredRules,
      optionalRules
    };
  }

  private parseTagNames(ids: number[] = []) {
    if (!ids || !ids.length) {
      return '';
    }
    const names: string[] = [];
    for (let i = 0, len = this.tagList.length; i < len; i++) {
      const tag = this.tagList[i];
      if (ids.includes(tag.id)) {
        names.push(tag.name);
      }
      if (names.length === ids.length) {
        return names.join(',');
      }
    }
    return names.join(',');
  }

  private view(job: IJob) {
    this.selected = job.jobId || -1;
    this.$router.push({
      path: '/sloth/operation',
      query: {
        jobId: this.selected.toString(),
        product: this.product
      }
    });
    this.operation.showJobDetail(this.selected, '');
  }

  private jump(job: IJob) {
    this.$router.push({
      path: '/sloth/operation',
      query: {
        jobId: (job.jobId || -1).toString(),
        product: this.product
      }
    });
  }

  private jumpToDetail(job: IJob) {
    Bus.$emit('admin_job_jump', job);
  }

  private recover(job: IJob) {
    this.operation.recover(job);
  }

  private start(job: IJob) {
    this.operation.start(job);
  }

  private stop(job: IJob) {
    this.operation.stop(job);
  }

  private down(job: IJob) {
    this.operation.down(job);
  }

  private async setAlarm(job: IJob) {
    try {
      const alarm = await this.$request('getOperationJobAlarm', {
        jobId: job.jobId
      });
      if (!this.alarmModalInstance) {
        this.alarmModalInstance = this.$createModalInstance(MODAL_TYPE.alarm);
      }
      this.alarmModalInstance && this.alarmModalInstance.show(Object.assign({}, this.alarmConfig, {
        jobName: job.jobName,
        alarm
      }), async (args: any) => {
        try {
          await this.$request('setOperationJobAlarm', {
            ...args,
            jobId: job.jobId
          });
          this.$ndcmessage.success('报警设置成功');
          return true;
        } catch (e) {
          this.alarmModalInstance && this.alarmModalInstance.setError(e.message);
        }
      });
    } catch (e) {
      this.$handleException(e);
    }
  }

  private editJobStatus(job: IJob) {
    if (!this.statusModalInstance) {
      this.statusModalInstance = this.$createModalInstance(MODAL_TYPE.status);
    }
    this.statusModalInstance && this.statusModalInstance.show({
      statusOptions: STATUS_OPTIONS,
      status: job.jobStatus
    }, async (args: any) => {
      try {
        await this.$request('modifyJobStatus', {
          jobId: job.jobId,
          newTaskStatus: args.status
        });
        await this.refresh();
        this.$ndcmessage.success('任务状态修改成功');
        return true;
      } catch (e) {
        this.statusModalInstance && this.statusModalInstance.setError(e.message);
      }
    });
  }

  private onClickRow(job: IJob) {
    this.isSimple && this.view(job);
  }

  private onFilter(filter: any, column: any) {
    this.filterValue = Object.assign({}, this.filterValue, {
      [column.name]: filter.key
    });
    if (column.name === 'runtimeStatus' || column.name === 'jobStatus' || this.isOverview) {
      this.$emit('filter-change', this.filterValue);
    }
    if (column.name === 'jobType') {
      const parent = this.$parent as MOperationList;
      parent && parent.setJobType(this.filterValue['jobType']);
    }
    this.page = 1;
    this.refresh();
  }

  private onOrder(order: any, column: any) {
    this.orderValue[column.name] = order;
    this.page = 1;
    this.refresh();
  }

  private onCreatorChange() {
    this.visible = false;
    this.page = 1;
    this.refresh();
  }
}
</script>

<style lang="scss">
.m-normal-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  .ndc-table-header {
    background: #f4f6fa;
    padding-right: 0;
    .ndc-icon-filter2 {
      cursor: pointer;
      font-size: 12px;
      color: #d2d7e0;
      &.active {
        color: #0075ff;
      }
    }
  }
  .ndc-table-body {
    padding-right: 0;
    .status {
      .icon {
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin: 4px 12px 4px 4px;
        &.abnormal {
          background: #ffcc00;
        }
        &.failed {
          background: #f04346;
        }
      }
    }
  }
  tr.active {
    background: #f4f5f7;
  }
  .pagination {
    padding: 32px 0;
    box-sizing: border-box;
    flex-shrink: 0;
  }
}
</style>

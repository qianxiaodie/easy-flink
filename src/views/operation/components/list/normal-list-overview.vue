<template>
  <div class="m-normal-list">
    <el-table ref="table" :data="operationList" row-key="jobId" style="width: 100%;flex: 1;" highlight-current-row @row-click="onClickRow">
      <el-table-column prop="jobName" label="名称" min-width="100" v-if="isSimple">
        <template slot-scope="{ row }">
          <span v-if="isSimple" :title="row.jobName">{{row.jobName}}</span>
          <ndc-table-link v-else-if="isOverview" @click="jump(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
          <ndc-table-link v-else-if="isAdmin" @click="jumpToDetail(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
          <ndc-table-link v-else @click="view(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
        </template>
      </el-table-column>
      <el-table-column prop="jobName" label="名称" :width="jobNameWidth" fixed="left" v-else>
        <template slot-scope="{ row }">
          <span v-if="isSimple" :title="row.jobName">{{row.jobName}}</span>
          <ndc-table-link v-else-if="isOverview" @click="jump(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
          <ndc-table-link v-else-if="isAdmin" @click="jumpToDetail(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
          <ndc-table-link v-else @click="view(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
        </template>
      </el-table-column>
      <el-table-column prop="jobStatus" label="任务状态" width="100" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            任务状态
            <ndc-table-filter class="g-ml-4" :filters="jobStatusFilters" :value="filterValue.jobStatus" @select="onFilter(arguments[0], 'jobStatus')"></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          <span style="color: #f04346;" v-if="row.jobStatus === 'CRASHED' || row.jobStatus === 'FAILED'">{{statusMap[row.jobStatus]}}</span>
          <span v-else>{{statusMap[row.jobStatus]}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="runtimeStatus" label="运行状态" width="100" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            运行状态
            <ndc-table-filter class="g-ml-4" :filters="runtimeStatusFilters" :value="filterValue.runtimeStatus" @select="onFilter(arguments[0], 'runtimeStatus')"></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          <div>
            <div class="status g-flex-ac" v-if="row.runtimeStatus === 'NORMAL'">
              <u-wave-icon></u-wave-icon>
              {{runtimeStatusMap[row.runtimeStatus]}}
            </div>
            <div class="status g-flex-ac" v-else-if="row.runtimeStatus === 'ABNORMAL'">
              <div class="icon abnormal"></div>
              {{runtimeStatusMap[row.runtimeStatus]}}
            </div>
            <div class="status g-flex-ac" v-else-if="row.runtimeStatus === 'FAILED'">
              <div class="icon failed"></div>
              {{runtimeStatusMap[row.runtimeStatus]}}
            </div>
            <span style="margin-left: 4px;" v-else>-</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple && !isAdmin" prop="tagIds" label="标签" min-width="100" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            标签
            <ndc-table-filter class="g-ml-4" :filters="tagFilters" :value="filterValue.tagIds" :multiple="true" @select="onFilter(arguments[0], 'tagIds')"></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          <span :title="parseTagNames(row.tagIds)">
            {{parseTagNames(row.tagIds)}}
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="startTime" label="启动时间" width="170" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            启动时间
            <ndc-table-order ref="columnOrder" class="g-ml-4" :order="orderValue.startTime" @order="onOrder(arguments[0], 'startTime')"></ndc-table-order>
          </div>
        </template>
        <template slot-scope="{ row }">
          {{row.jobStatus === 'READY' ? '-' : row.startTime}}
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="clusterId" label="集群" min-width="136">
        <template v-slot:header>
          <div class="g-flex-ac">
            集群
            <ndc-table-filter class="g-ml-4" :filters="clusterFilters" :value="filterValue.clusterId" @select="onFilter(arguments[0], 'clusterId')"></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          {{clusterMap[row.clusterId]}}
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="jobType" label="类型" width="80" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            类型
            <ndc-table-filter class="g-ml-4" :filters="jobTypeFilters" :value="filterValue.jobType" @select="onFilter(arguments[0], 'jobType')"></ndc-table-filter>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="creator" label="创建人" min-width="136">
        <template v-slot:header>
          <div class="g-flex-ac">
            创建人
            <a-popover title="" style="{'z-index':'3'}" trigger="click" :value="visible">
              <template v-slot:content>
                <input
                  class="ndc-input input-creator"
                  type="text"
                  :placeholder="isAdmin ? '请输入操作人' : '请输入创建人'"
                  v-model="creator"
                  @change="onCreatorChange"
                  @keydown.enter="onCreatorChange"
                />
              </template>
              <i class="g-ml-4 ndc-icon-filter2" :class="{'active': !!creator}" @click="onClickCreator"></i>
            </a-popover>
          </div>
        </template>
        <template slot-scope="{ row }">
          <span :title="handleCreator(row.creator)">
            {{handleCreator(row.creator)}}
          </span>
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="resourceUse" label="资源用量" width="100" :resizable="false"></el-table-column>
      <el-table-column v-if="!isSimple " prop="options" label="操作" width="200" fixed="right" :resizable="false">
        <template slot-scope="{ row }">
          <div class="g-flex-ac">
            <ndc-table-link :disabled="starting.includes(row.jobId)" v-if="startButtonStatus.includes(row.jobStatus)" @click="start(row)">启动</ndc-table-link>
            <ndc-table-link v-else :disabled="recoverDisabledStatus.includes(row.jobStatus) || starting.includes(row.jobId)" @click="recover(row)">恢复</ndc-table-link>
            <ndc-table-link :disabled="stopDisabledStatus.includes(row.jobStatus) || stoping.includes(row.jobId)" class="g-ml-8" @click="stop(row)">停止</ndc-table-link>
            <ndc-table-link v-if="!isAdmin" :disabled="downDisabledStatus.includes(row.jobStatus)" class="g-ml-8" @click="down(row)">下线</ndc-table-link>
            <ndc-table-link v-if="!isAdmin" :disabled="alarmDisabledStatus.includes(row.jobStatus)" class="g-ml-8" @click="setAlarm(row)">设置报警</ndc-table-link>
            <!-- <ndc-table-link v-if="isAdmin" class="g-ml-8" @click="editJobStatus(row)">修改任务状态</ndc-table-link> -->
          </div>
        </template>
      </el-table-column>
    </el-table>

    <div class="m-table-line" v-if="!isSimple" :class="{'active': lineVisible}" :style="lineStyle" @mousedown="onMouseDown" @mouseover="onMouseOver"></div>

    <div class="pagination">
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="!isSimple" :size-visible="!isSimple" :jump-visible="!isSimple" :small="true"></ndc-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';

import { IJob, ITag, IAlarmConfigMeta, IAlarmConfigMetaItem, ICluster, IPageInfo } from '@utils/types';
import { STATUS_MAP, RUNTIME_STATUS_MAP, NORMAL_LIST_COLUMNS, STATUS_OPTIONS, JOB_STATUS_FILTERS, RUNTIME_STATUS_FILTERS, JOB_TYPE_FILTERS } from '../../constant';
import { MODULE_NAMESPACE } from '@utils/constant';
import { debounce } from 'lodash';
import Operation from '../../index.vue';
import ModalMixin from '../../../components/modal/mixin';
import { MODAL_TYPE } from '../../../components/modal/constant';
import MRecoveryJob from '../../../administrator/recovery/job.vue';
import Bus from '@/bus';
import MOperationList from './index.vue';
import { Table, TableColumn } from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';

@Component({
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn
  }
})
export default class MNormalListOverview extends Vue {
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

  @Watch('selected')
  private onSelectedChanged(val: number) {
    const table = this.$refs.table as any;
    table && table.store.setCurrentRowByKey(val);
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

  @Watch('operationList')
  private onOperationListChanged() {
    this.$nextTick(() => {
      this.resize();
    });
  }

  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private filterValue: any = {
    clusterId: 'ALL',
    jobStatus: 'ALL',
    runtimeStatus: 'ALL',
    tagIds: ['ALL'],
    jobType: 'ALL'
  }
  private orderKey: string = 'startTime';
  private orderValue: any = {
    startTime: 'desc'
  };
  private statusMap: any = STATUS_MAP;
  private runtimeStatusMap: any = RUNTIME_STATUS_MAP;
  private jobStatusFilters: any[] = JOB_STATUS_FILTERS;
  private runtimeStatusFilters: any[] = RUNTIME_STATUS_FILTERS;
  private jobTypeFilters: any[] = JOB_TYPE_FILTERS;
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
  private lineVisible: boolean = false;
  private jobNameWidth: number = 200;
  private tableHeight: number = 0;
  private lineLeftWidth: number = 200;
  private debounceResize: any;

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

  private get lineStyle() {
    return {
      left: this.lineLeftWidth + 'px',
      height: this.tableHeight + 'px'
    };
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
      this.debounceResize = debounce(this.resize.bind(this), 100);
      window.addEventListener('resize', this.debounceResize);
      this.$nextTick(() => {
        const dom = this.$el.getElementsByClassName('el-table')[0];
        dom && (this.tableHeight = dom.clientHeight - 24);
      });
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
    window.removeEventListener('resize', this.debounceResize);
    Bus.$off('job_list_init', this.init);
    Bus.$off('job_list_refresh', this.refreshList);
    Bus.$off('job_list_reset', this.reset);
  }

  private resize() {
    const dom = this.$el.getElementsByClassName('el-table')[0];
    dom && (this.tableHeight = dom.clientHeight);
  }

  private reset() {
    this.page = 1;
    this.pageSize = 25;
    this.filterValue = {
      clusterId: 'ALL',
      jobStatus: 'ALL',
      runtimeStatus: 'ALL',
      tagIds: ['ALL'],
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
    if (!this.isAdmin && this.filterValue.tagIds.length && !this.filterValue.tagIds.includes('ALL')) {
      params.tagIds = this.filterValue.tagIds;
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
    if (this.selected === job.jobId) {
      return;
    }
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
    debugger;
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

  private onFilter(filter: any, name: string) {
    if (name === 'tagIds') {
      return this.onFilterTagIds(filter);
    }
    this.filterValue = Object.assign({}, this.filterValue, {
      [name]: filter.key
    });
    if (name === 'runtimeStatus' || name === 'jobStatus' || this.isOverview) {
      this.$emit('filter-change', this.filterValue);
    }
    if (name === 'jobType') {
      const parent = this.$parent as MOperationList;
      parent && parent.setJobType(this.filterValue['jobType']);
    }
    this.page = 1;
    this.refresh();
  }

  private onFilterTagIds(filter: any) {
    const val = filter.key;
    if (val === 'ALL') {
      this.filterValue.tagIds = ['ALL'];
    } else {
      let index = this.filterValue.tagIds.indexOf('ALL');
      if (index !== -1) {
        this.filterValue.tagIds.splice(index, 1);
      }
      index = this.filterValue.tagIds.indexOf(val);
      if (index === -1) {
        this.filterValue.tagIds.push(val);
      } else {
        this.filterValue.tagIds.splice(index, 1);
      }
      if (this.filterValue.tagIds.length === 0) {
        this.filterValue.tagIds.push('ALL');
      }
    }
    if (this.isOverview) {
      this.$emit('filter-change', this.filterValue);
    }
    this.page = 1;
    this.refresh();
  }

  private onOrder(order: any, name: string) {
    this.orderValue[name] = order;
    this.page = 1;
    this.refresh();
  }

  private onClickCreator() {
    this.visible = true;
    const arr = this.userId.split('@');
    arr.length && !this.creator && (this.creator = arr[0]);
    setTimeout(() => {
      const dom = document.getElementsByClassName('input-creator')[0] as any;
      dom && dom.select();
    }, 100);
  }

  private onCreatorChange() {
    this.visible = false;
    this.page = 1;
    this.refresh();
  }

  private onMouseOver(e: MouseEvent) {
    e.preventDefault();
    this.lineVisible = true;
    document.addEventListener('mouseout', this.onMouseOut);
  }

  private onMouseOut(e: MouseEvent) {
    e.preventDefault();
    this.lineVisible = false;
    document.removeEventListener('mouseout', this.onMouseOut);
  }

  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    this.lineVisible = true;
    document.addEventListener('mouseup', this.onMouseUp);
    document.addEventListener('mousemove', this.onMouseMove);
  }

  private onMouseUp(e: MouseEvent) {
    e.preventDefault();
    this.lineVisible = false;
    this.$nextTick(() => {
      this.jobNameWidth = this.lineLeftWidth;
    });
    document.removeEventListener('mouseup', this.onMouseUp);
    document.removeEventListener('mousemove', this.onMouseMove);
  }

  private onMouseMove(e: MouseEvent) {
    e.preventDefault();
    const clientX = e.clientX - 24;
    this.lineLeftWidth = clientX < 200 ? 200 : (clientX > 500 ? 500 : clientX);
  }
}
</script>

<style lang="scss">
.m-normal-list {
  height: 100%;
  display: flex;
  flex-direction: column;
  .el-table {
    thead tr {
      background: #f4f6fa;
      height: 40px;
      th {
        background-color: #f4f6fa;
        padding: 8px 0;
        color: #666;
        word-wrap: normal;
      }
    }
    th.is-leaf {
      background: #eee;
      border-color: #e2e5e9;
      box-sizing: border-box;
    }
    td {
      border-color: #ebf0f5;
    }
    .cell {
      white-space: nowrap;
    }
  }
  .el-table__fixed-right-patch {
    background: #f4f6fa;
  }
  .el-table--border {
    border: none;
    td, th {
      border-right: none;
    }
  }
  .el-table__body tr.hover-row.current-row>td,
  .el-table__body tr.hover-row.el-table__row--striped.current-row>td,
  .el-table__body tr.hover-row.el-table__row--striped>td,
  .el-table__body tr.hover-row>td {
    background: #edf8ff;
  }
  .ndc-icon-filter2 {
    font-size: 12px;
    color: #d2d7e0;
    cursor: pointer;
    &.active {
      color: #0075ff;
    }
  }
  .m-table-line {
    position: absolute;
    top: 50px;
    width: 6px;
    z-index: 10;
    box-sizing: border-box;
    &.active {
      border-left: $border_dot;
      cursor: ew-resize;
    }
  }
  .pagination {
    // padding: 32px 0;
    padding: 0;
    height: 100px;
    box-sizing: border-box;
    flex-shrink: 0;
  }
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
</style>

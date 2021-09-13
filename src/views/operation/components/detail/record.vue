<template>
  <div class="m-job-record">
    <ndc-table :columns="columns" :data="listData.list" :header-fixed="true">
      <template v-slot:td="scope">
        <span v-if="scope.column.name === 'options'">
          <ndc-table-link :disabled="startDisabled.includes(scope.row.status)" @click="viewLog(scope.row, 'START')">启动</ndc-table-link>
          <ndc-table-link class="g-ml-8" :disabled="stopDisabled.includes(scope.row.status)" @click="viewLog(scope.row, 'STOP')">停止</ndc-table-link>
          <ndc-table-link class="g-ml-8" :disabled="allDisabled.includes(scope.row.status)" @click="viewLog(scope.row, 'FINISH')">最后运行</ndc-table-link>
        </span>
        <span v-else-if="scope.column.name === 'kernelName'">
          <span>{{scope.row.clusterType && scope.row.clusterType.toLocaleUpperCase() === 'K8S' ? scope.row.imageName : scope.row.kernelName}}</span>
        </span>
        <span v-else-if="scope.column.name === 'status'">
          <span>{{recordStatusMap[scope.row.status] || scope.row.status}}</span>
        </span>
        <!-- <span v-else :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</span> -->
        <span v-else :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</span>
      </template>
    </ndc-table>
    <div class="pagination">
      <ndc-pagination :total="listData.total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :small="true"></ndc-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IJob } from '@utils/types';

import { RECORD_COLUMNS, RECORD_STATUS_MAP } from '../../constant';
import { paginationSimulator } from '@/utils';

interface IRecord {
  id: number;
  clusterName: string;
  kernelName: string;
  status: string;
  startTime: string;
  finishTime: string;
}

@Component
export default class MJobRecord extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private jobDetail!: IJob;

  @Prop({
    default() {
      return {};
    }
  })
  private recodeupdate!: boolean;

  private recordList: IRecord[] = [];
  private recordStatusMap: any = RECORD_STATUS_MAP;
  private columns: any[] = RECORD_COLUMNS;
  private page: number = 1;
  private pageSize: number = 25;
  private startDisabled: string[] = ['STARTING']; // 启动中不可点击
  private stopDisabled: string[] = ['STARTING', 'STOPPING', 'RUNNING', 'START_FAILED'];
  private allDisabled: string[] = ['STARTING', 'STOPPING', 'RUNNING', 'START_FAILED', 'STOP_FAILED', 'INIT'];

  @Watch('recodeupdate')
  private onRecodeupdateChanged(val: string) {
    this.refresh();
    // console.log(val,'recodeupdate')
  }

  private get listData() {
    // console.log('recodeupdate get')
    const { page, pageSize } = this;
    return paginationSimulator(this.recordList, {
      page,
      pageSize
    });
  }

  public async refresh() {
    try {
      this.recordList = await this.$request('getOperationJobRecords', {
        jobId: this.jobDetail.jobId
      });
      // console.log(this.listData.list,'listData')
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async viewLog(row: IRecord, type: string) {
    try {
      window.open(`#/oms/onlineDevelop/log?id=${row.id}&type=${type}`, '_blank');
      // window.open(`#/sloth_log?id=${row.id}&type=${type}`, '_blank');
    } catch (e) {
      this.$handleException(e);
    }
  }
}
</script>

<style lang="scss">
.m-job-record {
  width: 100%;
  height: 100%;
  padding: 24px 24px 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .g-text-link{
    color: #3B68B7;
  }
  .g-text-link.disabled, .g-text-link.disabled:hover{
    color: #999;
  }
  .ndc-table {
    flex: 1;
    height: 0;
  }
  .pagination {
    padding: 50px 0;
  }
}
</style>

<template>
  <div class="m-job-record">
    <ndc-table :columns="columns" :data="alarmList" :header-fixed="true">
     <template v-slot:th="scope">
        <div class="g-flex-ac" v-if="scope.column.name === 'alarmtype'">
          <span>{{scope.column.title}}</span>
          <a-popover title="" trigger="click" v-model="visible">
            <template v-slot:content>
              <input
                class="ndc-input"
                type="text"
                placeholder="请输入报警类型"
                v-model="alarmtype"
                @change="onChange"
              />
            </template>
            <!-- <img @click="visible = true" v-if="!alarmtype" src="../../../../assets/lanhuicons/漏斗normal.svg" alt="">
            <img @click="visible = true" v-else src="../../../../assets/lanhuicons/漏斗已筛.svg" alt=""> -->
            <!-- <i class="g-ml-8 ndc-icon-filter2" :class="{'active': !!alarmtype}" @click="visible = true"></i> -->
          </a-popover>
        </div>
        <span v-else>{{scope.column.title}}</span>
      </template>
    </ndc-table>
    <div class="pagination">
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true"
      :jump-visible='true' :size-visible='true' :small="true"></ndc-pagination>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IJob, IPageInfo } from '@utils/types';
import { IColumn } from '../../../administrator/constant';

import { paginationSimulator } from '@/utils';

const RECORD_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '100px'
}, {
  name: 'taskName',
  title: '任务名称',
  width: '20%'
}, {
  name: 'status',
  title: '报警类型',
  width: '15%'
}, {
  name: 'receiver',
  title: '接收人',
  width: '170px'
}, {
  name: 'sendTime',
  title: '报警时间',
  width: '170px'
}];

interface IRecord {
  id: number;
  clusterName: string;
  kernelName: string;
  status: string;
  startTime: string;
  finishTime: string;
}

interface IRecordResult {
  page: IPageInfo;
  info: IRecord[];
}

@Component
export default class MJobAlarm extends Vue {
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

  private alarmtype: string = '';
  private alarmList: IRecord[] = [];
  private columns: any[] = RECORD_COLUMNS;
  private page: number = 1;
  private pageSize: number = 10;
  private total: number = 0;
  private ruleRuning:boolean = false;
  private visible: boolean = false;
  private loading: boolean = false;

  @Watch('recodeupdate')
  private onRecodeupdateChanged(val: string) {
    this.refresh();
    // console.log(val,'recodeupdate')
  }

  private async mounted() {
    this.search();
    const rule :any = localStorage.getItem('sloth_roleRtdev');
  }

  @Watch('page')
  private onPageChanged(val: number) {
    this.refresh();
  }

  @Watch('pageSize')
  private onPageSizeChanged(val: number) {
    this.search();
  }

  public search() {
    this.page = 1;
    this.refresh();
  }

  public async refresh() {
    try {
      const params: any = {
        pageNo: this.page,
        pageSize: this.pageSize

      };
      if (this.alarmtype) {
        params.caller = this.alarmtype;
      }
      params.jobId = this.jobDetail.jobId;
      this.loading = true;
      const result: any = await this.$request('getJobalarmList', params) || [];
      const resdata = result.logArray || [];
      // const resdata = result
      // const arr = str.split('__')
      // console.log(str,arr,arr[arr.length-1],'taskName')
      resdata.forEach(e => {
        var patt = /.*?(\.__+?)+/;
        const arr = (e.taskName).split('__');
        e.taskName = arr[arr.length - 1];
        console.log(e.taskName, 'taskName');
      });
      // if(this.ruleRuning){
      this.alarmList = resdata;
      // }else{
      // this.alarmList = [];
      // }

      console.log(this.alarmList, 'alarmList', result, params);

      // const pageInfo = result.page || "";
      // this.page = pageInfo.pageIndex;
      this.total = result.total;
    } catch (e) {
      this.$handleException(e, '获取告警历史列表失败');
    } finally {
      this.loading = false;
    }
  }

  private onChange() {
    this.visible = false;
    this.search();
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

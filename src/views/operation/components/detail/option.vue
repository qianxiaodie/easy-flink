<template>
  <div class="m-job-option">
    <ndc-table :columns="columns" :data="recordList" :header-fixed="true">
      <template v-slot:th="scope">
        <div class="g-flex-ac" v-if="scope.column.name === 'operator'">
          <span>{{scope.column.title}}</span>
          <a-popover title="" trigger="click" v-model="visible">
            <template v-slot:content>
              <input
                class="ndc-input"
                type="text"
                placeholder="请输入操作人"
                v-model="operator"
                @change="onChange"
              />
            </template>
            <img @click="visible = true" v-if="!operator" src="../../../../assets/lanhuicons/filternormal.svg" alt="">
            <img @click="visible = true" v-else src="../../../../assets/lanhuicons/漏斗已筛.svg" alt="">
            <!-- <i class="g-ml-8 ndc-icon-filter2" :class="{'active': !!operator}" @click="visible = true"></i> -->
          </a-popover>
        </div>
        <span v-else>{{scope.column.title}}</span>
      </template>
    </ndc-table>
    <div class="pagination">
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :small="true"></ndc-pagination>
    </div>
    <div v-if="loading" class="example">
      <a-spin />
    </div>
    <!-- <u-loading v-if="loading" loading-text="查询中..."></u-loading> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { IColumn } from '../../../administrator/constant';
import { IPageInfo, IJob } from '@utils/types';

import { MODULE_NAMESPACE } from '@utils/constant';

const RECORD_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '100px'
}, {
  name: 'method',
  title: '方法名称',
  width: '18%'
}, {
  name: 'methodDesc',
  title: '方法描述'
}, {
  name: 'operator',
  title: '操作人',
  width: '26%'
}, {
  name: 'opTime',
  title: '调用时间',
  width: '170px'
}, {
  name: 'callFrom',
  title: '来源',
  width: '150px'
}];

interface IRecord {
  id: number;
  method: string;
  methodDesc: string;
  operator: string;
  product: string;
  opTime: string;
  opContent: string;
  callFrom:string
}

interface IRecordResult {
  page: IPageInfo;
  info: IRecord[];
}

@Component
export default class MJobOption extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private jobDetail!: IJob;

  private columns: IColumn[] = RECORD_COLUMNS;
  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private recordList: IRecord[] = [];
  private operator: string = '';
  private ruleRuning:boolean = false;
  private visible: boolean = false;
  private loading: boolean = false;

  @Watch('jobDetail')
  private onJobDetailChanged(val: IJob, oldVal: IJob) {
    val.jobId !== oldVal.jobId && this.search();
  }

  private async mounted() {
    this.search();
    const rule :any = localStorage.getItem('sloth_roleRtdev')
    this.ruleRuning = rule.includes('rtdev_proj.jobdecommission')
    console.log(this.ruleRuning,'this.ruleRuning')
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

  private async refresh() {
    try {
      const params: any = {
        pageIndex: this.page,
        pageSize: this.pageSize
      };
      if (this.operator) {
        params.caller = this.operator;
      }
      params.jobId = this.jobDetail.jobId;
      this.loading = true;
      const result: IRecordResult = await this.$request('getJobRecordList', params);
      let roleres :any= []
      result.info.forEach(v=>{
        if(v.callFrom=='web'){
          roleres.push(v)
        }
      })

      if(this.ruleRuning){
        this.recordList = result.info || [];
      }else{
        this.recordList = roleres || [];
      }

      console.log(this.recordList,'recordList')
      
      const pageInfo = result.page;
      this.page = pageInfo.pageIndex;
      this.total = pageInfo.objTotal;
    } catch (e) {
      this.$handleException(e, '获取操作记录列表失败');
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
.m-job-option {
  width: 100%;
  height: 100%;
  padding: 24px 24px 0 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .ndc-table {
    flex: 1;
    height: 0;
  }
  .pagination {
    padding: 32px 0;
  }
  .ndc-icon-filter2 {
    cursor: pointer;
    font-size: 12px;
    color: #d2d7e0;

    &.active {
      color: #3B68B7;
    }
  }
}
</style>

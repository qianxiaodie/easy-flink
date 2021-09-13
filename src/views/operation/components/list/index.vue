<template>
  <div class="m-list" :class="{'simple': isSimple}">
    <div class="m-list-content" :class="{'simple': isSimple}">

      <div class="m-list-header">
        <div class="header-left" v-if="!isAdmin">
          任务运行状况 
          <!-- <ndc-table-filter class="g-ml-8" v-if="isSimple" :filters="filters" :value="jobType" @select="setJobType(arguments[0].key)"></ndc-table-filter> -->
        </div>
        <div class="header-right">
          <!-- <div class="header-status" v-show="!isSimple && !isAdmin">
            <div class="g-flex-ac">
              <u-wave-icon></u-wave-icon>
              正常
              <a class="count g-text-link" :class="{'active': runtimeStatus === 'NORMAL'}" @click="setFilterStatus('NORMAL', true)">{{jobCounter.normal}}</a>
            </div>
            <div class="g-flex-ac">
              <div class="icon delay"></div>
              异常
              <a class="count g-text-link" :class="{'active': runtimeStatus === 'ABNORMAL'}" @click="setFilterStatus('ABNORMAL', true)">{{jobCounter.abnormal}}</a>
            </div>
            <div class="g-flex-ac">
              <div class="icon abnormal"></div>
              失败
              <a class="count g-text-link" :class="{'active': runtimeStatus === 'FAILED'}" @click="setFilterStatus('FAILED', true)">{{jobCounter.failed}}</a>
            </div>
            <div class="g-split-line large"></div>
            <div class="g-flex-ac">
              停止
              <a class="count g-text-link" :class="{'active': jobStatus === 'STOPPED'}" @click="setFilterStatus('STOPPED', false)">{{jobCounter.stopped}}</a>
            </div>
            <div class="g-split-line large"></div>
            <div class="g-flex-ac">
              其他
              <a class="count g-text-link" :class="{'active': jobStatus === 'NONE'}" @click="setFilterStatus('NONE', false)">{{jobCounter.other}}</a>
            </div>
            <div class="g-split-line large"></div>
            <div class="g-flex-ac">
              共
              <a class="count total g-text-link" :class="{'active': jobStatus === '' && runtimeStatus === ''}" @click="setFilterStatus('', false)">{{jobCounter.total}}</a>
              作业
            </div>
            <div class="g-split-line large"></div>
          </div> -->

          <!-- 搜索任务名称 -->
          <!-- <u-searchbox v-if="isSimple" :class="{'header-search': isSimple}" placeholder="任务名称" @change="onChangeKeyword" @clear="keyword = ''"></u-searchbox> -->

        </div>
      </div>
      <div class="m-list-body" :class="{'simple': isSimple, 'overview': isOverview, 'admin': isAdmin}">
        <!-- <m-normal-list-overview ref="list" :selected-job-id="selectedJobId" @filter-change="onFilterChange" :job-type="jobType" :job-status="jobStatus" :runtime-status="runtimeStatus" :is-simple="isSimple" :is-overview="isOverview" :is-admin="isAdmin" :keyword="keyword" :starting="starting" :stoping="stoping"></m-normal-list-overview> -->

        <!-- <m-normal-list ref="list" :filtercluster='filtercluster' :selected-job-id="selectedJobId" @filter-change="onFilterChange" :job-type="jobType"
                :job-status="jobStatus" :runtime-status="runtimeStatus" :is-simple="isSimple" :is-overview="false" :is-admin="isAdmin" :keyword="keyword" :starting="starting" :stoping="stoping">
        </m-normal-list> -->

          <m-normal-list v-if="showjobmaintain" ref="list" :filterspace="filterspace" :filterproject="filterproject" :filtercluster='filtercluster' :selected-job-id="selectedJobId"
          :showjobdecommission='showjobdecommission'
          @filter-change="onFilterChange" :job-type="jobType"
                :job-status="jobStatus" :runtime-status="runtimeStatus" :is-simple="isSimple" :is-overview="false" :is-admin="isAdmin" :keyword="keyword" :starting="starting" :stoping="stoping">
        </m-normal-list>

        <show-list v-else ref="list" :filterspace="filterspace" :filterproject="filterproject"  :filtercluster='filtercluster' :selected-job-id="selectedJobId" @filter-change="onFilterChange" :job-type="jobType"
                :job-status="jobStatus" :runtime-status="runtimeStatus" :is-simple="isSimple" :is-overview="false" :is-admin="isAdmin" :keyword="keyword" :starting="starting" :stoping="stoping">

          </show-list>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop,Watch } from 'vue-property-decorator';
import { State } from 'vuex-class';

import MNormalList from './normal-list.vue';
import showList from './show-list.vue';
import MNormalListOverview from './normal-list-overview.vue';
import { MODULE_NAMESPACE } from '@utils/constant';
import { IJob, IJobCounter } from '@utils/types';

@Component({
  components: {
    MNormalList,
    MNormalListOverview,
    showList
  }
})
export default class MOperationList extends Vue {
  @Prop({
    default: false
  })
  private isSimple!: boolean;

  @Prop({
    default: false
  })
  private isOverview!: boolean;

  @Prop({
    default: ''
  })
  private filtercluster!: string;

  @Prop({
    default: ''
  })
  private opuserRule!: string;
  

   @Prop({
     default: ''
   })
  private filterproject!: string;

   @Prop({
     default: ''
   })
  private filterspace!: string;

  @Prop({
    default: false
  })
  private isAdmin!: boolean;

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

  @Prop({
    default: ''
  })
  private jobStatus!: string;

 @Prop({
   default: ''
 })
  private keyword!: string;

  @Prop({
    default: ''
  })
  private runtimeStatus!: string;

  @Watch('opuserRule')
   private onopuserRuleChanged(val: any) {

    const rule:any = val || []

    this.showjobmaintain = rule.includes('rtdev_proj.jobmaintain') || rule.includes('rtdev_proj.jobdecommission');
    localStorage.setItem('sloth_showjobmaintain',JSON.stringify(this.showjobmaintain))
    console.log("结果rule",rule,this.showjobmaintain)

    // // 没有删除的权力 就为false
     this.showjobdecommission = rule.includes('rtdev_proj.jobdecommission');
    //  this.showjobmaintain = val
     this.showjobdecommission = rule.includes('rtdev_proj.jobdecommission');
    // console.log(val,'rule change zi')
  }

  @State('jobCounter', MODULE_NAMESPACE.operation)
  private jobCounter!: IJobCounter;

  // private jobStatus: string = '';
  // private runtimeStatus: string = '';

  private showjobmaintain:Boolean = true
  private showjobdecommission:Boolean = true
  private jobType: string = 'ALL';
  private filters: any[] = [{
    key: 'ALL',
    value: '全部'
  }, {
    key: 'SQL',
    value: 'SQL'
  }, {
    key: 'JAR',
    value: 'JAR'
  }];

  private created() {
  
  }

  private mounted(){
    
    // const rule:any = this.opuserRule || []

    // this.showjobmaintain = rule.includes('rtdev_proj.jobmaintain') || rule.includes('rtdev_proj.jobdecommission');
    // console.log("结果rule",rule,this.showjobmaintain)

    // // // 没有删除的权力 就为false
    // this.showjobdecommission = rule.includes('rtdev_proj.jobdecommission');
  }

  public async refresh() {
    const list = this.$refs.list as MNormalList;
    return list && list.refresh();
  }

  public clearSelected() {
    const list = this.$refs.list as MNormalList;
    return list && list.clearSelected();
  }

  public setJobType(type: string) {
    this.jobType = type;
  }

  // private setFilterStatus(status: string, isRuntime: boolean) {
  //   if (status === '') {
  //     this.jobStatus = '';
  //     this.runtimeStatus = '';
  //     return;
  //   }
  //   if (isRuntime) {
  //     this.jobStatus = '';
  //     this.runtimeStatus = status;
  //     return;
  //   }
  //   this.jobStatus = status;
  //   this.runtimeStatus = '';
  // }

  private onFilterChange(filterValue: any) {
    if (filterValue.jobStatus !== 'STOPPED') {
      this.jobStatus = '';
    }
    if (filterValue.runtimeStatus === 'ALL') {
      this.runtimeStatus = '';
    }
  }

  private onChangeKeyword(result) {
    this.keyword = result.value;
  }
}
</script>

<style lang="scss">
.m-list {
  height: 100%;
  box-sizing: border-box;
  &.simple {
    padding: 0;
  }
  &-content {
    position: relative;
    height: 100%;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    margin-bottom: 16px;
    .m-list-body{
      padding: 16px 24px;
    }
    &.simple {
      border: none;
    }
  }
  &-header {
    flex-shrink: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 50px;
    // border-bottom: $border;
    padding: 0 24px;
    box-sizing: border-box;
    overflow: hidden;
    border-bottom: 1px solid #ddd;
    .header-left {
      height: 42px;
      line-height: 42px;
      padding-left: 20px;
      font-size: 16px;
      color: #222222;
      flex-shrink: 0;
      display: flex;
      align-items: center;
    }
    .header-right {
      display: flex;
      align-items: center;
      height: 100%;
      overflow: hidden;
    }
    .header-search {
      width: 160px;
    }
    .header-status {
      display: flex;
      font-size: 14px;
      color: #262626;
      flex-shrink: 0;
      .icon {
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin: 4px 8px 4px 16px;
        &.normal {
          background: #01d787;
        }
        &.delay {
          background: #ffcc00;
        }
        &.abnormal {
          background: #f04346;
        }
      }
      .count {
        margin-left: 8px;
        &.total {
          margin-right: 8px;
        }
        &.active {
          color: #262626;
        }
      }
    }
  }
  &-body {
    flex: 1;
    height: 0;
    box-sizing: border-box;
    padding: 0;
    &.overview {
      height: auto;
    }
    .ndc-pagination {
      padding-right: 24px;
    }
  }
}
</style>

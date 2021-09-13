<template>
  <div class="m-op-detail">
    <div class="detail-header">
      <div class="detail-header-left g-flex-ac">
        <div class="detail-header-img"> {{jobDetail.jobType === 'SQL'?"S":"J"}}</div>
        <!-- <img v-if="jobDetail.jobType === 'SQL'" src="../../../../assets/images/sql.svg" />
        <img v-else src="../../../../assets/images/jar.svg" /> -->
        <div class="detail-header-name g-mr-32 g-text-nowrap" :title="jobDetail.jobName">{{jobDetail.jobName}}</div>
      </div>
      <!-- <i class="ndc-icon-close" @click="hideDetail" /> -->
    </div>
    <div class="detail-header-tip">
      <div style="display:flex;width:50%">
        <div class="detail-header-time" v-if="jobDetail.jobStatus === 'RUNNING' || jobDetail.jobStatus === 'STARTING'"><span style="color:#aaa">启动时间：</span><span class="g-ml-16">{{jobDetail.startTime}}</span>
        </div>
        <div class="g-split-line" v-if="jobDetail.jobStatus === 'RUNNING' || jobDetail.jobStatus === 'STARTING'"></div>
        <div class="status g-flex-ac" v-if="jobDetail.jobStatus === 'RUNNING'">
          <u-wave-icon></u-wave-icon>
          <span style="color:#4CD79F">
            {{statusMap[jobDetail.jobStatus]}}
          </span>
        </div>
        <div class="status g-flex-ac" v-else-if="jobDetail.jobStatus === 'CRASHED' || jobDetail.jobStatus === 'FAILED'">
          <div class="icon abnormal"></div>
          {{statusMap[jobDetail.jobStatus]}}
        </div>
        <div class="status g-flex-ac" v-else>
          <div class="icon delay"></div>
          {{statusMap[jobDetail.jobStatus]}}
        </div>
      </div>
      <div class="detail-header-right g-flex-ac">
        <div class="detail-header-right-do">
          <img v-if="jobDetail.jobStatus === 'RUNNING'" src="../../../../assets/lanhuicons/icon／停止.png" />
          <span class="g-text-link" :class="{'disabled': stoping.includes(jobDetail.jobId)||!ruleRuning}" v-if="jobDetail.jobStatus === 'RUNNING'" @click="stop">停止</span>
          <span class="g-text-link" :class="{'disabled':!ruleRuning}" v-if="jobRecoverStatus.includes(jobDetail.jobStatus)" @click="recover">恢复</span>
          <span class="g-text-link" :class="{'disabled': starting.includes(jobDetail.jobId)||!ruleRuning}" v-if="jobDetail.jobStatus === 'READY'" @click="start">启动</span>
           <!-- <div v-if="jobDetail.jobStatus !== 'STARTING' && jobDetail.jobStatus !== 'STOPPING'" class="g-split-line"></div> -->
        </div>
        <div class="detail-header-right-do" >
          <img src="../../../../assets/lanhuicons/icon／fink链接.png" />
           <ndc-table-link :disabled="jobDetail.jobStatus !== 'RUNNING'" @click="openFlink">flink链接</ndc-table-link>
           <!-- <span class="g-text-link" :class="{'disabled':!ruleRuning}"  @click="openFlink">flink链接</span> -->
          <!-- <div class="g-split-line"></div> -->
        </div>
        <div class="detail-header-right-do">
          <img src="../../../../assets/lanhuicons/icon／监控.png" />
          <span class="g-text-link" :class="jobDetail.metricUrl ? '' : 'disabled'" @click="openMonitor">监控</span>
          <!-- <div class="g-split-line"></div> -->
        </div>
      </div>

    </div>
    <div class="detail-body">
      <ndc-tabs
        :tabs="tabs"
        :value.sync="activeTab"
      >
        <ndc-tab-panel name="info">
          <m-job-info ref="info" :job-detail="jobDetail"></m-job-info>
        </ndc-tab-panel>
        <ndc-tab-panel name="baseinfo">
          <m-job-base-info ref="baseinfo" :job-detail="jobDetail"></m-job-base-info>
        </ndc-tab-panel>
        <ndc-tab-panel name="params">
          <m-job-params ref="params" :job-detail="jobDetail"></m-job-params>
        </ndc-tab-panel>
        <ndc-tab-panel name="config">
          <m-job-config ref="config" :job-detail="jobDetail"></m-job-config>
        </ndc-tab-panel>
        <ndc-tab-panel name="record">
          <m-job-record ref="record" :recodeupdate='recodeupdate' :job-detail="jobDetail"></m-job-record>
        </ndc-tab-panel>
        <ndc-tab-panel name="option">
          <m-job-option ref="option" :job-detail="jobDetail"></m-job-option>
        </ndc-tab-panel>
        <ndc-tab-panel name="alarm">
          <m-job-alarm ref="alarm" :job-detail="jobDetail"></m-job-alarm>
        </ndc-tab-panel>
        <!-- <ndc-tab-panel name="log" v-if="userConfig.env && userConfig.env !== 'deppon'">
          <m-job-log ref="log" :job-detail="jobDetail"></m-job-log>
        </ndc-tab-panel> -->
        <!-- 之前商业化定制的判断 去掉 -->
        <ndc-tab-panel name="log" >
          <m-job-log ref="log" :job-detail="jobDetail"></m-job-log>
        </ndc-tab-panel>
        <ndc-tab-panel name="diagnosis">
          <m-job-diagnosis ref="diagnosis" :job-detail="jobDetail"></m-job-diagnosis>
        </ndc-tab-panel>
      </ndc-tabs>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch, Inject } from 'vue-property-decorator';
import MJobInfo from './info.vue';
import MJobBaseInfo from './baseinfo.vue';
import MJobParams from './params.vue';
import MJobConfig from './config.vue';
import MJobRecord from './record.vue';
import MJobLog from './log.vue';
import MJobOption from './option.vue';
import MJobAlarm from './alarm.vue';
import MJobDiagnosis from './diagnosis.vue';
import Operation from '../../index.vue';
import Bus from '@/bus';
import { ITab, IJob, IUserConfig } from '@utils/types';
import { STATUS_MAP } from '../../constant';
import { State } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';

@Component({
  components: {
    MJobBaseInfo,
    MJobInfo,
    MJobParams,
    MJobConfig,
    MJobRecord,
    MJobLog,
    MJobOption,
    MJobAlarm,
    MJobDiagnosis
  }
})
export default class MOperationDetail extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private jobDetail!: IJob;

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

  @Inject('operation')
  private operation!: Operation;

  private jobRecoverStatus: string[] = ['STOPPED', 'FINISHED', 'CRASHED', 'FAILED'];
  private activeTab: string = '';
  private statusMap: any = STATUS_MAP;
  private ruleRuning:boolean = false;
  private recodeupdate:boolean = false;
  private tabs: ITab[] = [
    {
      name: 'info',
      label: '任务信息'
    }, {
      name: 'baseinfo',
      label: '基本信息'
    }, {
      name: 'params',
      label: '运行参数'
    }, {
      name: 'config',
      label: '高级配置'
    }, {
      name: 'record',
      label: '运行记录'
    }, {
      name: 'option',
      label: '操作记录'
    }, {
      name: 'alarm',
      label: '告警历史',
      newicon: true
    },
    {
      name: 'log',
      label: '运行日志'
    }

  ];

  @State('userConfig', MODULE_NAMESPACE.global)
  private userConfig!: IUserConfig;

  private created() {
    // if(window.location.href.indexOf('alarm')!==-1){
    // this.activeTab = 'alarm';
    // }else{
    //   this.activeTab = 'info';
    // }
    this.activeTab = "";
    const rule :any = localStorage.getItem('sloth_roleRtdev');
    this.ruleRuning = rule.includes('rtdev_proj.jobmaintain') || rule.includes('rtdev_proj.devdeploy');
    console.log(this.ruleRuning, 'this.ruleRuning');
  }

  @Watch('activeTab')
  private onActiveTabChanged(val: string) {
    this.refresh(val);
  }

  @Watch('jobDetail')
  private onJobDetailChanged(val: IJob) {
    console.log(val, 'jobDetailjobDetail');
    if (val.health || val.waste) {
      this.tabs.length !== 9 && this.tabs.push({
        name: 'diagnosis',
        label: '智能诊断'
      });
    } else {
      this.tabs.length === 9 && this.tabs.splice(this.tabs.length - 1, 1);
      if (window.location.href.indexOf('alarm') != -1) {
        this.activeTab === 'diagnosis' && this.setActiveTab('alarm');
        console.log('setActive alarm');
      } else {
        this.activeTab === 'diagnosis' && this.setActiveTab('info');
        console.log('setActive info');
      }
    }

    this.recodeupdate = !this.recodeupdate;
  }

  public setActiveTab(tab: string) {
    this.activeTab = tab;
    console.log('setActive tab bus', tab);
  }

  public refresh(tab: string = '') {
    tab = tab || this.activeTab;
    if (this.jobDetail.health || this.jobDetail.waste) {
      this.tabs.length !== 9 && this.tabs.push({
        name: 'diagnosis',
        label: '智能诊断'
      });
    } else {
      this.tabs.length === 9 && this.tabs.splice(this.tabs.length - 1, 1);
      tab === 'diagnosis' && (tab = 'info');
    }
    this.$nextTick(() => {
      if (tab === 'info') {
        const info = this.$refs.info as MJobInfo;
        info && info.resize();
      } else if (tab === 'baseinfo') {
        const baseinfo = this.$refs.baseinfo as MJobBaseInfo;
        // baseinfo && baseinfo.getJobDetail();
      } else if (tab === 'config') {
        const config = this.$refs.config as MJobConfig;
        config && config.resize();
      } else if (tab === 'params') {
        const params = this.$refs.params as MJobParams;
        params && params.search();
      }else if (tab === 'record') {
        const record = this.$refs.record as MJobRecord;
        record && record.refresh();
      } else if (tab === 'log') {
        const log = this.$refs.log as MJobLog;
        log && log.refresh();
        // console.log("log",log,this.$refs.log)
      } else if (tab === 'option') {
        const option = this.$refs.option as MJobOption;
        option && option.search();
      } else if (tab === 'alarm') {
        const alarm = this.$refs.alarm as MJobAlarm;
        alarm && alarm.refresh();
      } else if (tab === 'diagnosis') {
        const diagnosis = this.$refs.diagnosis as MJobDiagnosis;
        diagnosis && diagnosis.refresh();
      }
    });
  }

  public resize() {
    if (this.activeTab === 'info') {
      const info = this.$refs.info as MJobInfo;
      info && info.resize();
    } else if (this.activeTab === 'diagnosis') {
      const diagnosis = this.$refs.diagnosis as MJobDiagnosis;
      diagnosis && diagnosis.resize();
    }
  }

  private stop() {
    if (this.stoping.includes(this.jobDetail.jobId)) {
      return;
    }
    this.operation.stop(this.jobDetail, true);
  }

  private recover() {
    this.operation.recover(this.jobDetail, true);
  }

  private start() {
    if (this.starting.includes(this.jobDetail.jobId)) {
      return;
    }
    this.operation.start(this.jobDetail, true);
  }

  private openFlink() {
    const url = this.jobDetail.flinkWebUrl;
    url && window.open(url, '_blank');
  }

  private openMonitor() {
    const url = this.jobDetail.metricUrl;
    url && window.open(url, '_blank');
  }

  private hideDetail() {
    this.operation && this.operation.hideJobDetail();
  }
}
</script>

<style lang="scss">
.m-op-detail {
  width: 100%;
  height: 100%;
  background: #f4f4f9;
  display: flex;
  flex-direction: column;
  .detail-header-tip{
    height: 50px;
    display: flex;
    background: #fff;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    .status {
      .icon {
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin: 4px 12px 4px 4px;
        &.delay {
          background: #ffcc00;
        }
        &.abnormal {
          background: #f04346;
        }
      }
    }
  }
  .detail-header {
    background: #fff;
    height: 50px;
    line-height: 50px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24px;
    // img {
    //   width: 24px;
    //   height: 24px;
    //   margin-right: 16px;
    // }
    &-right-do{
      margin-left: 11px;
      span{
        margin:0 5px;
      }
      .g-text-link{
      color: #3B68B7;
      // line-height: 18px;
    }
    }

    &-img{
      width: 20px;
      height: 20px;
      font-size: 18px;
      margin-right:16px;
      line-height: 20px;
      border-radius: 2px;
      text-align: center;
      // padding:0 5px;
      color: #3B68B7;
      border: 1px solid #3B68B7;
    }
    &-left {
      flex: 1;
      width: 0;
    }
    &-name {
      font-size: 18px;
      color: #222;
      font-weight: 400;
      min-width: 120px;
      max-width: calc(100% - 450px);
    }
    &-time {
      color: #666;
    }
    .status {
      .icon {
        width: 8px;
        height: 8px;
        border-radius: 100%;
        margin: 4px 12px 4px 4px;
        &.delay {
          background: #ffcc00;
        }
        &.abnormal {
          background: #f04346;
        }
      }
    }
    .ndc-icon-close {
      cursor: pointer;
      font-weight: 600;
      font-size: 12px;
      color: #868f9e;
    }
  }
  .detail-body {
    background: #fff;
    flex: 1;
    height: 0;

    //样式修改
    .ndc-tabs-header{
      border-top: 1px solid #eee;
      background: #f3f3f3;
    }

    .ndc-tabs-common .tab:hover, .ndc-tabs-common .tab.active{
      color: #3B68B7;
      border: 1px solid #ddd;
      border-top: 2px solid #3B68B7;
      background-color: #fff;
      border-bottom: none;
      &:before {
        height: 3px;
      }
      &:after {
        display: none;
      }
    }
    .ndc-tabs-common .tab{
      box-sizing: border-box;
      padding: 0 20px;
      margin: 0;
      border-bottom: 1px solid #ddd;
    }
    .ndc-tabs-common:after {
      display: none;
    }
    .ndc-tabs-common .tab:after{
      background: #3B68B7;
      height: 2px;
    }

    .ndc-tabs-common {
      height: 41px;
      // padding-left: 12px;
    }
    .info-desc {
      display: flex;
      line-height: 40px;
      & + .info-desc {
        margin-top: 4px;
      }
      .label {
        display: block;
        color: #999;
        width: 100px;
        flex-shrink: 0;
      }
      .content {
        color: #333;
      }
    }
  }
}
</style>

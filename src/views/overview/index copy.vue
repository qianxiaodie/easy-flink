<template>
  <div class="m-overview">
    <div class="m-overview-top">
      <div class="left">
        <div class="title">
          <img src="../../assets/images/icon_memory.svg" />
          任务名称
        </div>
        <!-- <div class="avatar">
          <img src="../../assets/images/avatar.svg" />
        </div>
        <div class="name">
          <div class="title">欢迎，{{userName}}</div>
          <div class="g-flex-ac">
            <ndc-select
              name="clusterId"
              value-key="id"
              label-key="clusterName"
              placeholder="集群版本"
              :options="clusterList"
              v-model="clusterId"
              @change="onChangeCluster"
            ></ndc-select>
            <ndc-select
              class="g-ml-16"
              name="queueId"
              value-key="id"
              label-key="queueName"
              placeholder="队列"
              :disabled="clusterId === 0"
              :options="queueList"
              v-model="queueId"
              @change="onChangeQueue"
            ></ndc-select>
          </div>
          <div class="g-flex-ac g-mt-32">
            <div>
              <div class="label">产品CPU用量</div>
              <div class="g-flex-ac g-mt-16">
                <img src="../../assets/images/icon_cpu.svg" />
                <div class="content">
                  {{overviewInfo.productCoreUsed}}
                  <span class="unit">核</span>
                </div>
              </div>
            </div>
            <div class="name-split-line"></div>
            <div>
              <div class="label">产品内存用量</div>
              <div class="g-flex-ac g-mt-16">
                <img src="../../assets/images/icon_memory.svg" />
                <div class="content">
                  {{overviewInfo.productMemUsed}}
                  <span class="unit">G</span>
                </div>
              </div>
            </div>
          </div>
        </div> -->
      </div>
      <div class="right">
        <u-ring-chart
          ref="cpuChart"
          :title="queueId === 0 ? '产品CPU' : '队列CPU'"
          :used="cpuUsed" used-legend="使用"
          unused-legend="闲置"
          :used-color="cpuUsedColor"
          :unused-color="cpuUnusedColor"
          :used-num="overviewInfo.clusterCoreUsed"
          :total-num="overviewInfo.clusterCoreTotal"
          unit="核"
          used-num-color="#0577FF"
          unused-num-color="#CED3DB"
        ></u-ring-chart>
        <u-ring-chart
          ref="memoryChart"
          :title="queueId === 0 ? '产品内存' : '队列内存'"
          :used="memoryUsed"
          used-legend="使用"
          unused-legend="闲置"
          :used-color="memoryUsedColor"
          :unused-color="memoryUnusedColor"
          :used-num="overviewInfo.clusterMemUsed"
          :total-num="overviewInfo.clusterMemTotal"
          unit="G"
          used-num-color="#10E48A"
          unused-num-color="#CED3DB"
        ></u-ring-chart>
      </div>
    </div>
    <div class="m-overview-list">
      <m-operation-list :is-overview="true"></m-operation-list>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from 'vue-property-decorator';
import { ICluster, IQueue } from '@utils/types';
import MOperationList from '../operation/components/list/index.vue';
import URingChart from '../components/chart/ring-chart.vue';
import { Action, State } from 'vuex-class';

import { MODULE_NAMESPACE } from '@utils/constant';
import Bus from '@/bus';

@Component({
  components: {
    MOperationList,
    URingChart
  }
})
export default class Overview extends Vue {
  @Provide()
  private operation = null; // 只用于hack

  @State('userName', MODULE_NAMESPACE.global)
  private userName!: string;
  private clusterList: ICluster[] = [];
  private clusterId: number = 0;
  private queueList: IQueue[] = [];
  private queueId: number = 0;
  private overviewInfo: any = {};
  private cpuUsed: number = 0;
  private cpuUsedColor: any = {
    chart: ['#0075FF', '#5392FF'],
    legend: "#0577FF"
  };
  private cpuUnusedColor: any = {
    legend: "#CED3DB"
  };
  private memoryUsed: number= 0;
  private memoryUsedColor: any = {
    chart: ['#05E28A', '#9DFF86'],
    legend: '#10E48A'
  };
  private memoryUnusedColor: any = {
    legend: "#CED3DB"
  };

  private async created() {
    try {
      this.clusterId = 0;
      this.queueId = 0;
      this.getClusterList();
      this.getQueueList();
      this.getOverviewDetail();
      this.getTagList();
      const result = await this.getOperationJobList();
      Bus.$emit('job_list_refresh', result);
    } catch (e) {
      this.$handleException(e);
    }
  }

  @Action('getOperationJobList', MODULE_NAMESPACE.operation)
  private getOperationJobList!: any;

  @Action('getTagList', MODULE_NAMESPACE.develop)
  private getTagList!: any;

  private async getClusterList() {
    try {
      const list: ICluster[] = await this.$request('getClusterList');
      this.clusterList = [{
        id: 0,
        clusterName: '全部集群'
      }].concat(list);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getQueueList() {
    if (this.clusterId === 0) {
      this.queueList = [{
        id: 0,
        queueName: '全部队列'
      }];
      this.queueId = 0;
      return this.getOverviewDetail();
    }
    try {
      const list: IQueue[] = await this.$request('getQueueList', {
        clusterId: this.clusterId
      });
      this.queueList = [{
        id: 0,
        queueName: '全部队列'
      }].concat(list);
      this.queueId = 0;
      return this.getOverviewDetail();
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async onChangeCluster() {
    return this.getQueueList();
  }

  private async onChangeQueue() {
    return this.getOverviewDetail();
  }

  private async getOverviewDetail() {
    try {
      const info = this.overviewInfo = await this.$request('getResourceDetail', {
        clusterId: this.clusterId,
        queueId: this.queueId
      });
      const cpuUsed = Math.ceil(info.clusterCoreUsed / info.clusterCoreTotal * 100);
      this.cpuUsed = isNaN(cpuUsed) ? 0 : cpuUsed;
      const memoryUsed = Math.ceil(info.clusterMemUsed / info.clusterMemTotal * 100);
      this.memoryUsed = isNaN(memoryUsed) ? 0 : memoryUsed;
      this.$nextTick(() => {
        this.resize();
      });
    } catch (e) {
      this.$handleException(e);
    }
  }

  private resize() {
    const cpuChart = this.$refs.cpuChart as URingChart;
    cpuChart && cpuChart.setOptions();
    const memoryChart = this.$refs.memoryChart as URingChart;
    memoryChart && memoryChart.setOptions();
  }
}
</script>

<style lang="scss">
.m-overview {
  width: 100%;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  background: #f4f4f9;
  overflow: auto;
  &-top {
    display: flex;
    justify-content: space-between;
    height: 280px;
    .left {
      background: #fff;
      width: 49%;
      height: 100%;
      padding: 32px;
      box-sizing: border-box;
      border: $border;
      border-radius: 3px;
      display: flex;
      .avatar {
        width: 96px;
        height: 96px;
        flex-shrink: 0;
      }
      .name {
        margin-left: 32px;
        flex: 1;
        width: 0;
        .title {
          font-size: 20px;
          color: #262626;
          margin-top: 8px;
        }
        .ndc-select {
          margin-top: 24px;
          width: 200px;
        }
        .label {
          font-size: 12px;
          color: #687381;
        }
        .unit {
          font-size: 12px;
          color: #333;
          margin-left: 4px;
          line-height: 26px;
        }
        .content {
          font-size: 22px;
          color: #333;
          margin-left: 16px;
          height: 32px;
          display: flex;
          align-items: flex-end;
        }
        &-split-line {
          width: 1px;
          height: 68px;
          background: #e2e7f0;
          margin: 0 32px;
        }
      }
    }
    .right {
      background: #fff;
      width: 0;
      flex: 1;
      margin-left: 16px;
      height: 100%;
      padding: 16px 24px;
      box-sizing: border-box;
      border: $border;
      border-radius: 3px;
      display: flex;
      align-items: center;
      .u-ring-chart {
        width: 50%;
      }
    }
  }
  &-list {
    margin-top: 16px;
    border: $border;
    box-sizing: border-box;
    background: #fff;
  }
}
</style>

<template>
  <div class="m-statistics-resource">
    <div class="header g-flex-ac">
      <ndc-select
        style="width: 200px;height: 36px;"
        placeholder="请选择集群"
        value-key="id"
        label-key="clusterName"
        :options="clusterList"
        v-model="clusterId"
        @change="refresh"
      ></ndc-select>
      <ndc-select
        style="width: 200px;height: 36px;"
        class="g-ml-16"
        placeholder="请选择排序字段"
        value-key="key"
        label-key="label"
        :options="options"
        v-model="orderBy"
        @change="refresh"
      ></ndc-select>
      <div class="datepicker g-flex-ac g-ml-16" v-show="datePickerVisible">
        <a-range-picker
          format="YYYY-MM-DD"
          :allow-clear="false"
          v-model="date"
          :placeholder="['开始日期', '结束日期']"
          :disabled-date="disabledDate"
          :default-picker-value="defaultPickerValue"
          @change="onChangeDate"
        >
        </a-range-picker>
        <div class="g-text-link g-ml-16" @click="datePickerVisible = false">返回</div>
      </div>
      <div class="time g-flex-ac g-ml-16" v-show="!datePickerVisible">
        <div class="time-tag g-ml-16" :class="{'active': time === 7}" @click="onChangeTime(7)">最近7天</div>
        <div class="time-tag g-ml-16" :class="{'active': time === 30}" @click="onChangeTime(30)">最近30天</div>
        <div class="g-text-link g-ml-16" @click="switchToCustom">自定义</div>
      </div>
    </div>
    <div class="body" ref="chart"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { ICluster } from '@utils/types';

import moment from 'moment';
import { debounce } from 'lodash';
import echarts from 'echarts';

interface IResourceStatistics {
  product: string;
  vcore: number;
  mem: number;
};

@Component
export default class MStatisticsResource extends Vue {
  private clusterList: ICluster[] = [];
  private clusterId: number | null = null;
  private orderBy: string = 'vcore';
  private options: any[] = [{
    key: 'vcore',
    label: 'vcore'
  }, {
    key: 'mem',
    label: 'mem'
  }];
  private time: number = 7;
  private date: any[] = [];
  private datePickerVisible: boolean = false;
  private chart: any;
  private debounceResize: any;
  private defaultPickerValue: any[] = [moment().subtract(1, 'month'), moment()];

  private async created() {
    try {
      this.clusterList = await this.$request('getClusterList', { ignoreProduct: true });
      this.clusterId = this.clusterList && this.clusterList.length ? this.clusterList[0].id : null;
      this.clusterId && this.refresh();
    } catch (e) {
      this.$handleException(e, '获取集群列表失败');
    }
  }

  private mounted() {
    this.init();
    this.debounceResize = debounce(this.resize.bind(this), 100);
    window.addEventListener('resize', this.debounceResize);
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.debounceResize);
  }

  private disabledDate(args: any) {
    if (!args) {
      return false;
    }
    const date1 = new Date(args.format('YYYY-MM-DD'));
    const date2 = new Date(new Date().format('YYYY-MM-DD'));
    return date2.getTime() < date1.getTime();
  }

  private async refresh() {
    if (!this.clusterId) {
      return this.$ndcconfirm({
        content: '请先选择集群',
        cancelButton: ''
      });
    }
    if (!this.chart) {
      return;
    }
    if (!this.date.length) {
      this.time2Date();
    }
    try {
      const result: IResourceStatistics[] = await this.$request('getResourceStatistics', {
        clusterId: this.clusterId,
        orderBy: this.orderBy,
        from: this.date.length ? this.date[0].format('YYYY-MM-DD') : moment().subtract(7, 'days').format('YYYY-MM-DD'),
        end: this.date.length > 1 ? this.date[1].format('YYYY-MM-DD') : moment().format('YYYY-MM-DD')
      });
      this.chart.setOption(this.getOptions((result || []).reverse()));
    } catch (e) {
      this.$handleException(e, '任务资源统计失败');
    }
  }

  private resize() {
    this.chart && this.chart.resize();
  }

  private init() {
    const dom = this.$refs.chart as any;
    this.chart = echarts.init(dom);
    this.chart.setOption(this.getOptions([]));
  }

  private getOptions(data: IResourceStatistics[]) {
    const yData: string[] = [];
    const vcoreData: number[] = [];
    const memData: number[] = [];
    data.forEach(d => {
      if (d.product) {
        yData.push(d.product);
        vcoreData.push(d.vcore);
        memData.push(d.mem);
      }
    });
    return {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['vcore', 'mem']
      },
      xAxis: [{
        type: 'value'
      }],
      yAxis: [{
        type: 'category',
        axisTick: {
          show: false
        },
        data: yData
      }],
      series: [{
        name: 'vcore',
        type: 'bar',
        barMaxWidth: 24,
        itemStyle: {
          normal: {
            color: '#3274e6'
          }
        },
        label: {
          normal: {
            show: true
          }
        },
        data: vcoreData
      }, {
        name: 'mem',
        type: 'bar',
        barMaxWidth: 24,
        label: {
          normal: {
            show: true
          }
        },
        data: memData
      }]
    };
  }

  private switchToCustom() {
    this.time2Date();
    this.datePickerVisible = true;
  }

  private time2Date() {
    const endDate = moment();
    const startDate = this.time === 1 ? moment() : (this.time === 7 ? moment().subtract(7, 'days') : moment().subtract(30, 'days'));
    this.date = [startDate, endDate];
  }

  private onChangeTime(time: number) {
    this.time = time;
    this.time2Date();
    this.refresh();
  }

  private onChangeDate() {
    this.refresh();
  }
}
</script>

<style lang="scss">
.m-statistics-resource {
  width: 100%;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  .body {
    width: 100%;
    height: 0;
    flex: 1;
    padding: 24px 0;
    box-sizing: border-box;
  }
  .ndc-select-label {
    line-height: 36px !important;
  }
  .time {
    &-tag {
      border-radius: 3px;
      background: #fff;
      border: 1px solid #dae1f2;
      color: #333;
      height: 36px;
      line-height: 36px;
      text-align: center;
      padding: 0 12px;
      min-width: 80px;
      cursor: pointer;
      &:hover {
        background: #2888fb;
        border-color: #2888fb;
        color: #fff;
      }
      &.active {
        background: #0073fb;
        border-color: #0073fb;
        color: #fff;
      }
    }
  }
}
</style>

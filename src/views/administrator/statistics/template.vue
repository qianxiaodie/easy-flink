<template>
  <div class="m-statistics-template">
    <div class="header g-flex-ac">
      <ndc-select
        style="width: 200px;height: 36px;"
        placeholder="请选择产品"
        value-key="product"
        label-key="product"
        searchable
        :options="productList"
        v-model="product"
        @change="refresh"
      ></ndc-select>
      <ndc-select
        v-if="type === 'job'"
        style="width: 200px;height: 36px;"
        class="g-ml-16"
        placeholder="请选择类型"
        value-key="key"
        label-key="label"
        :options="config.options"
        v-model="failType"
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
        <!-- <div class="time-tag" :class="{'active': time === 1}" @click="onChangeTime(1)">今天</div> -->
        <div class="time-tag g-ml-16" :class="{'active': time === 7}" @click="onChangeTime(7)">最近7天</div>
        <div class="time-tag g-ml-16" :class="{'active': time === 30}" @click="onChangeTime(30)">最近30天</div>
        <div class="g-text-link g-ml-16" @click="switchToCustom">自定义</div>
      </div>
    </div>
    <div class="body" ref="chart"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IProduct, IPageInfo } from '@utils/types';

import { config, IStatisticsConfig } from './config';
import moment from 'moment';
import { debounce } from 'lodash';
import echarts from 'echarts';
import { isNotEmpty } from '@/utils';

interface IStatistics {
  id: number;
  product: string;
  statistic_type: string;
  statisticDate: string;
  totalCount: number;
}

@Component
export default class MStatisticsTemplate extends Vue {
  @Prop({
    default: ''
  })
  private type!: string;

  private productList: IProduct[] = [];
  private product: string | null = null;
  private failType: string = 'NEWTASK';
  private time: number = 7;
  private date: any[] = [];
  private datePickerVisible: boolean = false;
  private chart: any;
  private debounceResize: any;
  private defaultPickerValue: any[] = [moment().subtract(1, 'month'), moment()];

  private get config(): IStatisticsConfig {
    return config[this.type];
  }

  private async created() {
    try {
      this.productList = await this.$request('getAdminProducts');
      this.product = this.productList && this.productList.length ? this.productList[0].product : null;
      this.product && this.refresh();
    } catch (e) {
      this.$handleException(e, '获取产品列表失败');
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
    if (!this.product) {
      return this.$ndcconfirm({
        content: '请先选择产品',
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
      const result: IStatistics[] = await this.$request('getTaskStatistics', {
        product: this.product,
        statistic_type: this.failType,
        from: this.date.length ? this.date[0].format('YYYYMMDD') : moment().subtract(7, 'days').format('YYYYMMDD'),
        end: this.date.length > 1 ? this.date[1].format('YYYYMMDD') : moment().format('YYYYMMDD')
      });
      this.chart.setOption(this.getOptions(result || []));
    } catch (e) {
      this.$handleException(e, '统计失败');
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

  private getOptions(data: IStatistics[]) {
    const xData: string[] = [];
    const sData: number[] = [];
    data.forEach(d => {
      if (isNotEmpty(d.statisticDate) && isNotEmpty(d.totalCount)) {
        xData.push(d.statisticDate);
        sData.push(d.totalCount);
      }
    });
    return {
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['任务数']
      },
      xAxis: {
        type: 'category',
        data: xData,
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        }
      },
      yAxis: {
        type: 'value',
        axisLine: {
          lineStyle: {
            color: '#666'
          }
        },
        minInterval: 1
      },
      series: [{
        data: sData,
        type: 'line',
        name: '任务数',
        color: ['#3274e6']
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
.m-statistics-template {
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

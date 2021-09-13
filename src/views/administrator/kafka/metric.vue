<template>
  <div class="m-metric">
    <div class="header">
      <div class="g-flex-ac g-mr-32 g-mb-16">
        <div class="g-mr-16">产品:</div>
        <ndc-select
          style="background: #fff;margin-right: 16px;width: 200px;"
          value-key="product"
          label-key="product"
          placeholder="请选择产品"
          searchable
          :options="productList"
          v-model="product"
        ></ndc-select>
      </div>
      <div class="g-flex-ac g-mr-32 g-mb-16">
        <div class="g-mr-16">任务名称:</div>
        <input type="text" style="width: 200px;" class="ndc-input" autocomplete="off" placeholder="请输入任务名称" v-model="jobName" />
      </div>
      <div class="g-flex-ac g-mr-32 g-mb-16">
        <div class="g-mr-16">Topic:</div>
        <input type="text" style="width: 200px;" class="ndc-input" autocomplete="off" placeholder="请输入 Topic" v-model="topic" />
      </div>
      <div class="g-flex-ac g-mr-32 g-mb-16">
        <div class="g-mr-16">启动时间范围:</div>
        <a-range-picker
          ref="datePicker"
          showTime
          format="YYYY-MM-DD HH:mm:ss"
          v-model="time"
          :placeholder="['开始时间', '结束时间']"
          :disabled-date="disabledDate"
          :default-picker-value="defaultPickerValue"
        >
        </a-range-picker>
      </div>
      <div class="g-flex-ac g-mr-32 g-mb-16">
        <div class="g-mr-16">集群名称:</div>
        <input type="text" style="width: 200px;" class="ndc-input" autocomplete="off" placeholder="请输入集群名称" v-model="clusterName" />
      </div>
      <ndc-button theme="primary" @click="search">查询</ndc-button>
    </div>
    <div class="body">
      <ndc-table :columns="columns" :data="metricList.list" :header-fixed="true" :order-value="orderValue" @order="handleOrder"></ndc-table>
    </div>
    <div class="footer">
      <ndc-pagination :total="metricList.total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
    </div>

    <u-loading v-if="loading" loading-text="查询中..."></u-loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import moment from 'moment';
import { IColumn } from '../constant';
import { paginationSimulator } from '@/utils';
import { IProduct } from '@/utils/types';

@Component
export default class MMetric extends Vue {
  private jobName: string = '';
  private topic: string = '';
  private productList: IProduct[] = [];
  private product: string | null = null;
  private clusterName: string = '';
  private time: any[] = [];
  private page: number = 1;
  private pageSize: number = 25;
  private total: number = 0;
  private defaultPickerValue: any[] = [moment().subtract(1, 'month'), moment()];
  private list: any[] = [];
  private orderValue: any = {
    startTime: 'desc',
    inputBand: '',
    intps: '',
    outtps: '',
    delay: '',
    lag: ''
  };
  private orderName: string = 'startTime';
  private columns: IColumn[] = [{
    name: 'jobName',
    title: '任务名称'
  }, {
    name: 'topic',
    title: 'Topic'
  }, {
    name: 'groupid',
    title: 'GroupID'
  }, {
    name: 'clusterName',
    title: '所属集群'
  }, {
    name: 'startTime',
    title: '启动时间',
    orderable: true
  }, {
    name: 'inputBand',
    title: '输入带宽',
    orderable: true
  }, {
    name: 'intps',
    title: 'InTPS',
    orderable: true
  }, {
    name: 'outtps',
    title: 'OutTPS',
    orderable: true
  }, {
    name: 'delay',
    title: '消费延迟',
    orderable: true
  }, {
    name: 'lag',
    title: 'Lag',
    orderable: true
  }];
  private loading: boolean = false;

  private async created() {
    try {
      this.productList = await this.$request('getAdminProducts');
      this.product = this.productList.length ? this.productList[0].product : null;
      this.search();
    } catch (e) {
      this.$handleException(e, '获取指标监控列表失败');
    }
  }

  private get metricList() {
    return paginationSimulator(this.list, {
      orderKey: this.orderName,
      orderValue: this.orderValue,
      page: this.page,
      pageSize: this.pageSize
    });
  }

  private disabledDate(args: any) {
    if (!args) {
      return false;
    }
    const date1 = new Date(args.format('YYYY-MM-DD'));
    const date2 = new Date(new Date().format('YYYY-MM-DD'));
    return date2.getTime() < date1.getTime();
  }

  private async search() {
    if (!this.product) {
      return this.$ndcconfirm({
        content: '请先选择产品',
        cancelButton: ''
      });
    }
    const metricSpecs = await this.getMetricList();
    const list: any[] = [];
    metricSpecs.forEach(l => {
      if (this.jobName && (!l.jobName || (l.jobName && !l.jobName.includes(this.jobName)))) {
        return;
      }
      if (this.time.length > 1 && (moment(l.startTime).diff(moment(this.time[0])) < 0 || moment(l.startTime).diff(moment(this.time[1])) > 0)) {
        return;
      }
      (l.kafkaInfos || []).forEach(info => {
        if (this.topic && (!info.kafkaTopic || (info.kafkaTopic && !info.kafkaTopic.includes(this.topic)))) {
          return;
        }
        if (this.clusterName && (!info.bootStrapName || (info.bootStrapName && !info.bootStrapName.includes(this.clusterName)))) {
          return;
        }
        list.push({
          jobName: l.jobName,
          topic: info.kafkaTopic,
          groupid: info.kafkaGroupId,
          clusterName: info.bootStrapName,
          startTime: l.startTime,
          intps: Number(l.numRecordsInPerSecond),
          outtps: Number(l.numRecordsOutPerSecond),
          lag: Number(l.lagMax)
        });
      });
    });
    this.list = list;
  }

  private async getMetricList() {
    try {
      this.loading = true;
      const endTime = Math.floor(moment().valueOf() / 1000);
      const startTime = endTime - 60;
      const result = await this.$request('getMetricList', {
        startTime,
        endTime,
        product: this.product || ''
      });
      return (result && result.metricSpecs) || [];
    } catch (e) {
      this.$handleException(e, '获取指标监控列表失败');
    } finally {
      this.loading = false;
    }
  }

  private handleOrder({ order, column }) {
    this.orderValue = {
      startTime: '',
      inputBand: '',
      intps: '',
      outtps: '',
      delay: '',
      lag: ''
    };
    this.orderValue[column.name] = order;
    this.orderName = column.name;
  }
}
</script>
<style lang="scss">
.m-metric {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  .header {
    display: flex;
    flex-wrap: wrap;
  }
  .body {
    height: 0;
    flex: 1;
    .ndc-table {
      height: 100%;
      td {
        white-space: normal !important;
        word-break: break-all;
      }
    }
  }
  .footer {
    padding-top: 16px;
  }
}
</style>

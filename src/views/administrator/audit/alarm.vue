<template>
  <list :searchable="true" placeholder="请输入任务名" @search="jobName = arguments[0]">
    <ndc-table :columns="columns" :data="list" :header-fixed="true" :filter-value="filterValue" @filter="onFilter">
      <template v-slot:td="scope">
        <div style="white-space: normal;line-height: 24px;word-break: break-all;">{{scope.row[scope.column.name]}}</div>
      </template>
    </ndc-table>
    <template v-slot:footer>
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
    </template>
  </list>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import list from '../../components/list/index.vue';

import { ALARM_COLUMNS, IColumn } from '../constant';
import { cloneDeep } from 'lodash';
import { IProduct, IPageInfo } from '@utils/types';

interface IAlarm {
  id: number;
  type: string;
  content: string;
  alarmUsers: string;
  alarmTime: string;
}

interface IAlarmResult {
  page: IPageInfo;
  info: IAlarm[];
}

@Component({
  components: {
    list
  }
})
export default class MAuditAlarm extends Vue {
  private list: IAlarm[] = [];
  private productList: IProduct[] = [];
  private alarmTypeList: any[] = [];
  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private filterValue: any = {
    product: 'ALL',
    type: 'ALL'
  };
  private jobName: string = '';

  private get columns(): IColumn[] {
    const columns = cloneDeep(ALARM_COLUMNS);
    columns[1].filters = this.productFilters;
    columns[3].filters = this.alarmTypeFilters;
    return columns;
  }

  private get productFilters() {
    const result: any[] = [{
      key: 'ALL',
      value: '全部'
    }];
    this.productList.forEach(t => {
      if (t.product && !result.some(r => r.key === t.product)) {
        result.push({
          key: t.product,
          value: t.product
        });
      }
    });
    return result;
  }

  private get alarmTypeFilters() {
    const result: any[] = [{
      key: 'ALL',
      value: '全部'
    }];
    this.alarmTypeList.forEach(t => {
      if (t && !result.some(r => r.key === t)) {
        result.push({
          key: t,
          value: t
        });
      }
    });
    return result;
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

  @Watch('jobName')
  private onJobNameChanged(val: string) {
    this.page = 1;
    this.refresh();
  }

  private async created() {
    try {
      const productsRequest = this.$request('getAdminProducts');
      const alarmTypesRequest = this.$request('getAlarmTypes');
      this.productList = await productsRequest;
      this.alarmTypeList = await alarmTypesRequest;
      this.refresh();
    } catch (e) {
      this.$handleException(e, '获取报警列表失败');
    }
  }

  private async refresh() {
    try {
      const params: any = {
        pageIndex: this.page,
        pageSize: this.pageSize,
        jobName: this.jobName
      };
      if (this.filterValue.product && this.filterValue.product !== 'ALL') {
        params.product = this.filterValue.product;
      }
      if (this.filterValue.type && this.filterValue.type !== 'ALL') {
        params.alarmType = this.filterValue.type;
      }
      const result: IAlarmResult = await this.$request('getAlarmList', params);
      this.list = result.info || [];
      const pageInfo = result.page;
      this.page = pageInfo.pageIndex;
      this.total = pageInfo.objTotal;
    } catch (e) {
      this.$handleException(e, '获取报警列表失败');
    }
  }

  private onFilter(args: any) {
    this.filterValue[args.column.name] = args.filter.key;
    this.page = 1;
    this.refresh();
  }
}
</script>

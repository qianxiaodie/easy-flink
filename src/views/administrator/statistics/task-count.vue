<template>
  <list>
    <template v-slot:header>
      <div class="g-flex-ac">
        <span>
          总任务数：
          <span class="g-text-bold g-text-28">{{taskCount}}</span>
        </span>
        <span class="g-ml-16">
          总运行态任务数：
          <span class="g-text-bold g-text-28">{{runningTaskCount}}</span>
        </span>
      </div>
    </template>
    <ndc-table :columns="columns" :data="taskList" :header-fixed="true" :filter-value="filterValue" @filter="onFilter"></ndc-table>
    <template v-slot:footer>
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
    </template>
  </list>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import list from '../../components/list/index.vue';

import { IColumn } from '../constant';
import { cloneDeep } from 'lodash';
import { IProduct, IPageInfo } from '@utils/types';

const COLUMNS = [{
  name: 'id',
  title: '序号'
}, {
  name: 'product',
  title: '产品名',
  filters: [{
    key: 'ALL',
    value: '全部'
  }]
}, {
  name: 'total',
  title: '总任务数'
}, {
  name: 'totalRunning',
  title: '运行态任务总数'
}, {
  name: 'totalVcore',
  title: 'vcore（核）'
}, {
  name: 'totalMem',
  title: '内存（G）'
}];

interface ITask {
  id: number;
  product: string;
  total: number;
  totalRunning: number;
};

interface ITaskResult {
  total: number;
  totalRunning: number;
  page: IPageInfo;
  info: ITask[];
}

@Component({
  components: {
    list
  }
})
export default class MTaskCount extends Vue {
  private taskList: ITask[] = [];
  private productList: IProduct[] = [];
  private taskCount: number = 0;
  private runningTaskCount: number = 0;
  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private filterValue: any = {
    product: 'ALL'
  }

  private get columns(): IColumn[] {
    const columns = cloneDeep(COLUMNS);
    columns[1].filters = this.productFilters;
    return columns;
  }

  private get productFilters() {
    const result: any[] = [{
      key: 'ALL',
      value: '全部'
    }];
    this.productList.forEach(p => {
      if (p.product && !result.some(r => r.key === p.product)) {
        result.push({
          key: p.product,
          value: p.product
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

  private async created() {
    try {
      this.productList = await this.$request('getAdminProducts');
      this.refresh();
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async refresh() {
    try {
      const params: any = {
        pageIndex: this.page,
        pageSize: this.pageSize
      };
      if (this.filterValue.product !== 'ALL') {
        params.product = this.filterValue.product;
      }
      const result: ITaskResult = await this.$request('getTaskList', params);
      this.taskList = (result.info || []).map((r, index) => {
        r.id = index + 1;
        return r;
      });
      this.taskCount = result.total || 0;
      this.runningTaskCount = result.totalRunning || 0;
      const pageInfo = result.page;
      this.page = pageInfo.pageIndex;
      this.total = pageInfo.objTotal;
    } catch (e) {
      this.$handleException(e, '任务列表获取失败');
    }
  }

  private onFilter(args: any) {
    this.filterValue = {
      product: args.filter.key
    };
    this.page = 1;
    this.refresh();
  }
}
</script>

<template>
  <list class="m-audit-record">
    <template v-slot:header>
      <ndc-select
        style="background: #fff;margin-right: 16px;width: 200px;"
        value-key="product"
        label-key="product"
        placeholder="请选择产品"
        searchable
        :options="productList"
        v-model="product"
        @change="page = 1"
      ></ndc-select>
      <a-range-picker
        format="YYYY-MM-DD HH:mm:ss"
        v-model="time"
        show-time
        :default-picker-value="defaultPickerValue"
        :placeholder="['开始时间', '结束时间']"
        :disabled-date="disabledDate"
        @change="page = 1"
      >
      </a-range-picker>
      <input class="g-ml-16 ndc-input" style="width: 200px;" placeholder="请输入JobId" v-model="jobId" />
      <ndc-button class="g-ml-16" theme="primary" @click="search">查询</ndc-button>
    </template>
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
            <img @click="visible = true" v-if="!!operator" src="../../../assets/lanhuicons/filternormal.svg" alt="">
            <img @click="visible = true" v-else src="../../../assets/lanhuicons/漏斗已筛.svg" alt="">
            <!-- <i class="g-ml-8 ndc-icon-filter2" :class="{'active': !!operator}" @click="visible = true"></i> -->
          </a-popover>
        </div>
        <span v-else>{{scope.column.title}}</span>
      </template>
      <template v-slot:td="scope">
        <span v-if="scope.column.name === 'options'">
          <ndc-table-link @click="view(scope.row)">查看</ndc-table-link>
        </span>
        <span v-else>{{scope.row[scope.column.name]}}</span>
      </template>
    </ndc-table>
    <template v-slot:footer>
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
    </template>
    <u-loading v-if="loading" loading-text="查询中..."></u-loading>
  </list>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import list from '../../components/list/index.vue';

import { RECORD_COLUMNS, IColumn } from '../constant';
import { IProduct, IPageInfo } from '@utils/types';
import ModalMixin from '../../components/modal/mixin';
import { MODAL_TYPE } from '../../components/modal/constant';
import moment from 'moment';

interface IRecord {
  id: number;
  method: string;
  methodDesc: string;
  operator: string;
  product: string;
  opTime: string;
  opContent: string;
}

interface IRecordResult {
  page: IPageInfo;
  info: IRecord[];
}

@Component({
  components: {
    list
  }
})
export default class MAuditRecord extends Vue {
  private columns: IColumn[] = RECORD_COLUMNS;
  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private recordList: IRecord[] = [];
  private productList: IProduct[] = [];
  private product: string | null = null;
  private time: any[] = [];
  private recordModalInstance: ModalMixin | null = null;
  private operator: string = '';
  private visible: boolean = false;
  private defaultPickerValue: any[] = [moment().subtract(1, 'month'), moment()];
  private jobId: string = '';
  private loading: boolean = false;

  private async created() {
    try {
      this.productList = await this.$request('getAdminProducts');
      this.product = this.productList.length ? this.productList[0].product : null;
      this.refresh();
    } catch (e) {
      this.$handleException(e, '获取操作记录列表失败');
    }
  }

  private mounted() {
    this.time = [moment().subtract(7, 'days'), moment()];
  }

  private beforeDestroy() {
    this.recordModalInstance && this.recordModalInstance.hide();
    this.recordModalInstance = null;
  }

  private disabledDate(args: any) {
    if (!args) {
      return false;
    }
    const date1 = new Date(args.format('YYYY-MM-DD'));
    const date2 = new Date(new Date().format('YYYY-MM-DD'));
    return date2.getTime() < date1.getTime();
  }

  @Watch('page')
  private onPageChanged(val: number) {
    this.refresh();
  }

  @Watch('pageSize')
  private onPageSizeChanged(val: number) {
    this.search();
  }

  private search() {
    this.page = 1;
    this.refresh();
  }

  private async refresh() {
    try {
      if (!this.product || this.time.length < 2) {
        return this.$ndcconfirm({
          content: '请选择完整筛选条件',
          cancelButton: ''
        });
      }
      const params: any = {
        pageIndex: this.page,
        pageSize: this.pageSize,
        product: this.product || '',
        from: this.time.length ? this.time[0].format('YYYY-MM-DD HH:mm:ss') : moment().subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'),
        end: this.time.length > 1 ? this.time[1].format('YYYY-MM-DD HH:mm:ss') : moment().format('YYYY-MM-DD HH:mm:ss')
      };
      if (this.operator) {
        params.caller = this.operator;
      }
      if (this.jobId) {
        params.jobId = this.jobId;
      }
      this.loading = true;
      const result: IRecordResult = await this.$request('getOperationRecordList', params);
      this.recordList = result.info || [];
      const pageInfo = result.page;
      this.page = pageInfo.pageIndex;
      this.total = pageInfo.objTotal;
    } catch (e) {
      this.$handleException(e, '获取操作记录列表失败');
    } finally {
      this.loading = false;
    }
  }

  private view(item) {
    if (!this.recordModalInstance) {
      this.recordModalInstance = this.$createModalInstance(MODAL_TYPE.record);
    }
    this.recordModalInstance && this.recordModalInstance.show(item, () => true);
  }

  private onChange() {
    this.visible = false;
    this.search();
  }
}
</script>

<style lang="scss">
.m-audit-record {
  .ant-calendar-picker-input {
    height: 32px !important;
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

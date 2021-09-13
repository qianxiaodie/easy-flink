<template>
  <div class="m-recovery-job">
    <list>
      <template v-slot:header>
        <ndc-select
          style="background: #fff;margin-right: 16px;width: 200px;z-index: 99;"
          value-key="product"
          label-key="product"
          placeholder="请选择产品"
          searchable
          :options="productList"
          v-model="product"
          @change="onChangeProduct"
        ></ndc-select>
      </template>
      <m-operation ref="operation" :is-admin="true"></m-operation>
    </list>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import list from '../../components/list/index.vue';
import MOperation from '../../operation/index.vue';
import { IProduct, IJob } from '@utils/types';
import { Action, Mutation } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';
import Bus from '@/bus';

@Component({
  components: {
    list,
    MOperation
  }
})
export default class MRecoveryJob extends Vue {
  private productList: IProduct[] = [];
  private product: string | null = null;

  @Action('getOperationJobList', MODULE_NAMESPACE.operation)
  private getOperationJobList!: any;

  @Mutation('SET_OPERATIONLIST', MODULE_NAMESPACE.operation)
  private setOperationList!: any;

  private async created() {
    try {
      this.setOperationList([]);
      Bus.$on('admin_job_refresh', this.refresh);
      Bus.$on('admin_job_jump', this.jumpToDetail);
      const list: IProduct[] = await this.$request('getAdminProducts');
      this.productList = [{
        productId: -1,
        product: '全部'
      }].concat(list);
      this.product = this.productList.length ? this.productList[0].product : null;
      this.product && this.onChangeProduct();
    } catch (e) {
      this.$handleException(e, '获取任务列表失败');
    }
  }

  private beforeDestroy() {
    Bus.$off('admin_job_refresh', this.refresh);
    Bus.$off('admin_job_jump', this.jumpToDetail);
  }

  private async refresh(params) {
    if (!this.product) {
      return this.$ndcconfirm({
        content: '请先选择产品',
        cancelButton: ''
      });
    }
    const result = await this.getOperationJobList(Object.assign({
      product: this.product === '全部' ? '' : this.product,
      isAdmin: true
    }, params));
    Bus.$emit('job_list_refresh', result);
  }

  private jumpToDetail(job: IJob) {
    const url = `#/sloth/operation?jobId=${job.jobId || -1}&product=${job.product}&from=admin`;
    window.open(url, '_blank');
  }

  private onChangeProduct() {
    Bus.$emit('job_list_reset');
  }
}
</script>

<style lang="scss">
.m-recovery-job {
  width: 100%;
  height: 100%;
  .m-admin-list {
    position: relative;
    .list-header {
      padding: 0;
      position: absolute;
      left: 24px;
      top: 34px;
    }
    .list-footer {
      padding: 0;
    }
    .pagination {
      padding-bottom: 0;
    }
  }
  .m-list-header {
    padding: 0;
    justify-content: flex-end;
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

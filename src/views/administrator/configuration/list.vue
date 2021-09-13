<template>
  <list>
    <template v-slot:header>
      <ndc-button theme="primary" @click="showModal()" v-if="config.create && config.create.visible">{{config.create && config.create.title || '添加'}}</ndc-button>
      <ndc-button class="g-ml-16" @click="refresh" v-if="config.list && config.list.visible">{{config.list && config.list.title || '刷新'}}</ndc-button>
    </template>
    <ndc-table :columns="config.columns" :data="list" :header-fixed="true">
      <template v-slot:td="scope">
        <span v-if="scope.column.name === 'options'">
          <ndc-table-link class="g-mr-16" @click="showModal(Object.assign({ isView: true }, scope.row))" v-if="config.view && config.view.visible">{{config.view && config.view.title || '查看'}}</ndc-table-link>
          <ndc-table-link class="g-mr-16" @click="showModal(Object.assign({ isEdit: true }, scope.row))" v-if="config.edit && config.edit.visible">{{config.edit && config.edit.title || '编辑'}}</ndc-table-link>
          <ndc-table-link @click="remove(scope.row)" v-if="config.remove && config.remove.visible">{{config.remove && config.remove.title || '删除'}}</ndc-table-link>
          <ndc-table-link class="g-ml-16" @click="submit(scope.row)" v-if="config.submit && config.submit.visible">{{config.submit && config.submit.title || '提交'}}</ndc-table-link>
        </span>
        <span v-else-if="scope.column.format && typeof scope.column.format === 'function'">{{scope.column.format(scope.row[scope.column.name])}}</span>
        <span v-else :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</span>
      </template>
    </ndc-table>
    <template v-slot:footer>
      <ndc-pagination :total="total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
    </template>
  </list>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import list from '../../components/list/index.vue';

import ModalMixin from '../../components/modal/mixin';
import { MODAL_TYPE } from '../../components/modal/constant';
import { IColumn } from '../constant';
import { config, IConfig } from './config';
import { IPageInfo } from '@utils/types';
import { cloneDeep } from 'lodash';

interface IResult {
  page: IPageInfo;
  info: any[];
}

@Component({
  components: {
    list
  }
})
export default class MConfigList extends Vue {
  @Prop({
    default: 'token'
  })
  private type!: string;

  private list: any[] = [];
  private total: number = 1;
  private page: number = 1;
  private pageSize: number = 25;
  private modalInstance: ModalMixin | null = null;

  private get config(): IConfig {
    return config[this.type];
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

  private created() {
    this.refresh();
  }

  private beforeDestroy() {
    this.modalInstance && this.modalInstance.hide();
    this.modalInstance = null;
  }

  private showModal(args) {
    args = cloneDeep(args || this.config.modalData);
    if (!this.modalInstance) {
      this.modalInstance = this.$createModalInstance(this.config.modalType);
    }
    this.modalInstance && this.modalInstance.show(args, async (params: any) => {
      if (args.isView) {
        return true;
      }
      try {
        const api = args.isEdit ? this.config.edit.api : this.config.create.api;
        if (!api) {
          throw new Error('接口未定义');
        }
        await this.$request(api, params);
        await this.refresh();
        this.$ndcmessage.success(args.isEdit ? `${this.config.edit.title}${this.config.name}成功` : `${this.config.create.title}${this.config.name}成功`);
        return true;
      } catch (e) {
        this.modalInstance && this.modalInstance.setError(e.message);
      }
    });
  }

  private remove(args: any) {
    this.$ndcconfirm({
      content: `确认要${this.config.remove.title}该${this.config.name}吗？`,
      onConfirm: async () => {
        try {
          const api = this.config.remove.api;
          if (!api) {
            throw new Error('接口未定义');
          }
          await this.$request(api, args);
          await this.refresh();
          this.$ndcmessage.success(`${this.config.remove.title}${this.config.name}成功`);
        } catch (e) {
          this.$handleException(e, `${this.config.remove.title}${this.config.name}失败`);
        }
      }
    });
  }

  private async refresh() {
    console.log('log list info')
    try {
      const api = this.config.list.api || '';
      if (!api) {
        throw new Error('接口未定义');
      }
      const result: IResult = await this.$request(api, {
        pageIndex: this.page,
        pageSize: this.pageSize
      });
      this.list = result.info || [];
      const pageInfo = result.page;
      this.page = pageInfo.pageIndex;
      this.total = pageInfo.objTotal;
    } catch (e) {
      this.$handleException(e, `${this.config.name}列表获取失败`);
    }
  }

  private submit(args: any) {
    const parent = this.$parent as any;
    parent && parent.submit(args);
  }
}
</script>

<template>
  <list>
    <template v-slot:header>
      <ndc-button theme="primary" @click="add">批量添加</ndc-button>
    </template>
    <ndc-table :columns="columns" :data="userList" :header-fixed="true">
      <template v-slot:td="scope">
        <span v-if="scope.column.name === 'options'">
          <ndc-table-link @click="remove(scope.row)">删除</ndc-table-link>
        </span>
        <span v-else>{{scope.row[scope.column.name]}}</span>
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

import ModalMixin from '../../components/modal/mixin';
import { MODAL_TYPE } from '../../components/modal/constant';
import { USER_COLUMNS, IColumn } from '../constant';
import { IPageInfo } from '@utils/types';
import { cloneDeep } from 'lodash';

interface IAdminUser {
  id: number;
  email: string;
}

interface IUserResult {
  page: IPageInfo;
  info: IAdminUser[];
}

@Component({
  components: {
    list
  }
})
export default class MUserList extends Vue {
  private columns: IColumn[] = USER_COLUMNS;
  private userList: IAdminUser[] = [];
  private total: number = 0;
  private page: number = 1;
  private pageSize: number = 25;
  private userModalInstance: ModalMixin | null = null;

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
    this.userModalInstance && this.userModalInstance.hide();
    this.userModalInstance = null;
  }

  private add() {
    if (!this.userModalInstance) {
      this.userModalInstance = this.$createModalInstance(MODAL_TYPE.user);
    }
    this.userModalInstance && this.userModalInstance.show({
      username: ''
    }, async (args: any) => {
      try {
        args.userList = (args.userList || '').split('\n').filter(Boolean);
        await this.$request('addUser', cloneDeep(args));
        await this.refresh();
        this.$ndcmessage.success('添加用户成功');
        return true;
      } catch (e) {
        this.userModalInstance && this.userModalInstance.setError(e.message);
      }
    });
  }

  private remove(user: IAdminUser) {
    this.$ndcconfirm({
      content: '确认要删除该用户吗？',
      desc: `用户名：${user.email}`,
      onConfirm: async () => {
        try {
          await this.$request('removeUser', {
            userId: user.email
          });
          await this.refresh();
        } catch (e) {
          this.$handleException(e, '删除用户失败');
        }
      }
    });
  }

  private async refresh() {
    try {
      const result: IUserResult = await this.$request('getUserList', {
        pageIndex: this.page,
        pageSize: this.pageSize
      });
      this.userList = result.info || [];
      const pageInfo = result.page;
      this.page = pageInfo.pageIndex;
      this.total = pageInfo.objTotal;
    } catch (e) {
      this.$handleException(e, '用户列表获取失败');
    }
  }
}
</script>

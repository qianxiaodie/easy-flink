<template>
  <ndc-modal class="m-container-modal " title="Container选择" :width="1100" :height="700" :visible="visible" :footer-visible="false" @hide="onHide">
    <div class="left">
      <div class="left-title">TaskName</div>
      <div
        class="list-item"
        v-for="(item, index) in taskList"
        :key="index"
        :class="{'active': item === selectedTask}"
        @click="selectTask(item)"
      >
        {{item}}
      </div>
    </div>
    <div class="right">
      <ndc-table :columns="columns" :data="actualSubTask.list">
        <template v-slot:td="scope">
          <span v-if="scope.column.name === 'options'">
            <ndc-table-link @click="selectSubTask(scope.row)">选择</ndc-table-link>
          </span>
          <div v-else-if="scope.column.name === 'containerId'" class="g-text-nowrap" style="direction: rtl;text-align: left;" :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</div>
          <span v-else :title="scope.row[scope.column.name]">{{scope.row[scope.column.name]}}</span>
        </template>
      </ndc-table>
      <div class="pagination">
        <ndc-pagination :total="actualSubTask.total" :page.sync="page" :page-size.sync="pageSize" :total-visible="true" :size-visible="true" :jump-visible="true" :small="true"></ndc-pagination>
      </div>
    </div>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from '../mixin';

import { TASK_COLUMNS } from '../../../operation/constant';
import { paginationSimulator } from '@/utils';

@Component
export default class MContainerModal extends Mixins(ModalMixin) {
  private columns: any = TASK_COLUMNS;
  private page: number = 1;
  private pageSize: number = 25;
  private taskList: any[] = [];
  private subTaskList: any[] = [];
  private selectedTask: string = '';

  private get actualSubTask() {
    return paginationSimulator(this.subTaskList, {
      page: this.page,
      pageSize: this.pageSize
    });
  }

  mounted() {
    console.log('进入container');
  }

  public async show(data: any, callback?: any) {
    this.modalData = data;
    this.page = 1;
    this.pageSize = 25;
    this.taskList = [];
    this.subTaskList = [];
    this.showModal(data, callback);

    try {
      const list = this.taskList = await this.$request('getTaskName', {
        clusterId: data.clusterId,
        applicationId: data.applicationId
      });
      console.log(this.taskList, 'taskList');
      list.length && this.selectTask(list[0]);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getSubTaskList(taskName: string) {
    try {
      this.subTaskList = await this.$request('getSubTask', {
        taskName,
        clusterId: this.modalData.clusterId,
        applicationId: this.modalData.applicationId
      });
      console.log(this.subTaskList, 'this.subTaskList');
    } catch (e) {
      this.$handleException(e);
    }
  }

  private selectTask(item: any) {
    this.selectedTask = item;
    this.getSubTaskList(item);
  }

  private selectSubTask(args) {
    this.onConfirm(args, false).then(() => this.onHide());
  }
}
</script>

<style lang="scss">
.m-container-modal {
  .ndc-modal-content{
    display: flex;
    padding: 0;
    margin: 16px;
    border: $border;
  }
  .left {
    width: 250px;
    overflow-y: auto;
    flex-shrink: 0;
    border-right: $border;
    background: #fff;
    &-title {
      height: 32px;
      line-height: 32px;
      padding: 0 16px;
      font-size: 12px;
      border-bottom: $border;
      margin-bottom: 4px;
    }
    .list-item {
      margin: 4px 10px;
      padding: 8px;
      cursor: default;
      font-size: 12px;
      word-break: break-all;
      &:hover,
      &.active {
        background-color: #f5f7fa;
        color: #3B68B7;
      }
    }
  }
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 16px;
    .ndc-table {
      flex: 1;
      overflow-y: auto;
      thead tr {
        height: 32px;
        th {
          font-size: 12px;
          padding: 4px 0 4px 16px;
        }
      }
      tbody tr {
        height: 40px;
        td {
          font-size: 12px;
          padding: 4px 0 4px 16px;
        }
      }
    }
  }
  .pagination {
    flex-shrink: 0;
    padding-top: 16px;
  }
}
</style>

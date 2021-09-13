<template>
  <div class="m-surrounding">
    <div class="g-flex-ac header">
      <!-- <input class="ndc-input" v-number="{'min': 1, 'max': 200}" v-model="preSize" /> -->
      <ndc-button class="g-ml-16" theme="primary" @click="search('pre')">查询</ndc-button>
    </div>
    <div class="list" v-for="(log, index) in logList" :key="index">
      <div class="item" style="color: #333;flex: 1;">
        <div :class="{'indent': log.indent}">
          {{log.message}}
          <span v-if="log.canExpand" class="g-text-link" @click="toggleMessage(log, index)">{{log.expanded ? '收起' : '展开'}}</span>
        </div>
      </div>
    </div>
    <div class="g-flex-ac footer">
      <!-- <input class="ndc-input" v-number="{'min': 1, 'max': 200}" v-model="nextSize" /> -->
      <ndc-button class="g-ml-16" theme="primary" @click="search('next')">查询</ndc-button>
    </div>
    <u-loading v-if="isLoading" loading-text="加载中，请稍候..."></u-loading>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { isNotEmpty } from '@/utils';
import { IElkLog } from '@utils/types';
import { cloneDeep } from 'lodash';
import moment from 'moment';

@Component
export default class MSurrounding extends Vue {
  private log: IElkLog | null = null;
  private logList: IElkLog[] = [];
  private originLogList: IElkLog[] = [];
  private isLoading: boolean = false;
  private preSize: number = 5;
  private nextSize: number = 5;
  private clusterId: number = -1;
  private applicationId: string = '';
  private timeStart: any = '';
  private timeEnd: any = '';

  private created() {
    let urlobj:any = {};
    if (window.location.href.indexOf('?') !== -1) {
      const url = window.location.href.split("?")[1];

      const urlarr = url.split("&");

      urlarr.forEach(v => {
        urlobj[v.split("=")[0]] = v.split('=')[1];
      });
    }
    const { id, clusterId = '', applicationId = '' } = urlobj || {};
    this.clusterId = Number(clusterId || '');
    this.applicationId = applicationId as string;
    console.log(clusterId, applicationId, 'applicationId');
    if (isNotEmpty(id)) {
      const key = `sloth_surrounding_${id}`;
      let result = localStorage.getItem(key);
      if (result) {
        sessionStorage.setItem(key, result);
        localStorage.removeItem(key);
      } else {
        result = sessionStorage.getItem(key);
      }
      if (result) {
        this.log = JSON.parse(result);
        if (this.log) {
          this.timeStart = this.timeEnd = this.log.timestamp;
          this.originLogList.push(this.log);
          this.logList = [this.log].map(l => {
            const msg = (l.message || '').trim();
            if (/^.{3} \d+ more$/.test(msg) || /^at /.test(msg)) {
              l.indent = true;
            }
            if (msg && msg.length > 500) {
              l.canExpand = true;
              l.expanded = false;
              l.message = msg.slice(0, 500) + '...';
            }
            return l;
          });
        }
      }
    }
  }

  private async search(type: string) {
    try {
      this.isLoading = true;
      const params: any = Object.assign({
        clusterId: this.clusterId,
        applicationId: this.applicationId,
        from: 0,
        size: 50,
        timeStart: type === 'next' ? moment(this.timeEnd).format('YYYY-MM-DD HH:mm:ss.SSS') : moment(this.timeStart).startOf('day').format('YYYY-MM-DD HH:mm:ss.SSS'),
        timeEnd: type === 'next' ? moment(this.timeEnd).endOf('day').format('YYYY-MM-DD HH:mm:ss.SSS') : moment(this.timeStart).format('YYYY-MM-DD HH:mm:ss.SSS'),
        querySurrounding: type === 'next' ? 2 : 1
      }, this.log);
      delete params.id;
      const result = await this.$request('getOperationJobElkLog', params);
      const list: IElkLog[] = cloneDeep(result.logList || []);
      this.originLogList = type === 'next' ? this.originLogList.concat(cloneDeep(list)) : cloneDeep(list).concat(this.originLogList);
      const newList = list.map(l => {
        const msg = (l.message || '').trim();
        if (/^.{3} \d+ more$/.test(msg) || /^at /.test(msg)) {
          l.indent = true;
        }
        if (msg && msg.length > 500) {
          l.canExpand = true;
          l.expanded = false;
          l.message = msg.slice(0, 500) + '...';
        }
        return l;
      });
      this.logList = type === 'next' ? this.logList.concat(newList) : newList.concat(this.logList);
      this.timeStart = moment(this.logList[0].timestamp).valueOf() - 1;
      this.timeEnd = moment(this.logList[this.logList.length - 1].timestamp).valueOf() + 1;
    } catch (e) {
      this.$handleException(e);
    } finally {
      this.isLoading = false;
    }
  }

  private toggleMessage(log: IElkLog, index: number) {
    const item = cloneDeep(this.originLogList[index]);
    item.canExpand = true;
    item.expanded = !log.expanded;
    if (!item.expanded) {
      item.message = item.message.slice(0, 500) + '...';
    }
    this.logList.splice(index, 1, item);
  }
}
</script>

<style lang="scss">
.m-surrounding {
  width: 100%;
  height: 100%;
  padding: 24px;
  box-sizing: border-box;
  overflow: auto;
  .header {
    margin-bottom: 16px;
  }
  .footer {
    margin-top: 16px;
  }
  .list {
    min-height: 48px;
    border-bottom: 1px solid #ebf0f5;
    box-sizing: border-box;
    &:hover {
      background: #edf8ff;
    }
    .item {
      padding: 12px 10px 12px 24px;
      box-sizing: border-box;
      flex-shrink: 0;
      word-break: break-all;
      .indent {
        padding-left: 54px;
      }
    }
  }
}
</style>

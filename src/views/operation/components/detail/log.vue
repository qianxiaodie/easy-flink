<template>
  <div class="m-job-log">
    <div class="search-panel">
      <div class="left">
        <div class="row g-flex-ac">
          <span class="label">ContainerId</span>
          <u-validator name="containerid" :validate="errors">
            <ndc-select :disabled="disabled" :options="containerIds" v-model="containerId" @change="onConditionChange('containerid')"></ndc-select>
          </u-validator>
        </div>
        <div class="row g-flex-ac">
          <span class="label">日志类别</span>
          <u-validator class="g-flex-ac" name="logtype" :validate="errors">
            <ndc-checkbox :value="types.includes('taskmanager')" @change="onChangeTypes(arguments[0], 'taskmanager')">TaskManager</ndc-checkbox>
            <ndc-checkbox class="g-ml-16" :value="types.includes('jobmanager')" @change="onChangeTypes(arguments[0], 'jobmanager')">JobManager</ndc-checkbox>
          </u-validator>
        </div>
        <div class="row g-flex-ac">
          <span class="label">关键词</span>
          <input class="ndc-input" placeholder="请输入关键词" v-model="keyword" @change="from = 0" />
        </div>
      </div>
      <div class="right">
        <div class="row g-flex-ac">
          <span class="label">时间范围</span>
          <u-validator name="time" :validate="errors">
            <a-range-picker
              ref="datePicker"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              v-model="time"
              :placeholder="['开始时间', '结束时间']"
              :disabled-date="disabledDate"
              :default-picker-value="defaultPickerValue"
              :ranges="{'当前时间': getCurrentTime}"
              @change="onConditionChange('time')"
              @focus="onFocus"
            >
            </a-range-picker>
          </u-validator>
        </div>
        <div class="row g-flex-ac">
          <span class="label">日志级别</span>
          <u-validator class="g-flex-ac" name="loglevel" :validate="errors">
            <!-- <ndc-checkbox :value="levels.includes('log.debug')" @change="onChangeLevels(arguments[0], 'log.debug')">debug</ndc-checkbox> -->
            <ndc-checkbox class="g-ml-16" :value="levels.includes('log')" @change="onChangeLevels(arguments[0], 'log')">info</ndc-checkbox>
            <ndc-checkbox class="g-ml-16" :value="levels.includes('log.error')" @change="onChangeLevels(arguments[0], 'log.error')">error</ndc-checkbox>
            <!-- <ndc-checkbox class="g-ml-16" :value="levels.includes('out')" @change="onChangeLevels(arguments[0], 'out')">out</ndc-checkbox> -->
          </u-validator>
        </div>
        <div class="row g-flex-ac">
          <ndc-button theme="primary" @click="search(false)" :disabled="disabled">搜索</ndc-button>
          <ndc-button class="g-ml-16" theme="primary" @click="querySubtask" :disabled="disabled">查询Subtask</ndc-button>
        </div>
      </div>
    </div>
    <div class="log-panel">
      <div class="log-panel-header g-flex-ac">
        <div class="header-item" style="width: 24%;">ContainerId</div>
        <div class="header-item" style="width: 12%;">日志类别</div>
        <div class="header-item">Message</div>
        <span v-if="inPage" class="fullscreen">
            <a-icon  style="color:#3B68B7;" @click="handleFullScreen" type="arrows-alt" />
        </span>
        <!-- <img v-if="inPage" class="fullscreen" src="../../../../assets/images/full-screen.svg"  /> -->
      </div>
      <div class="log-panel-body" v-if="logList.length">
        <div class="body-info" v-for="(log, index) in logList" :key="index">
          <div class="body-list g-flex-ac">
            <div class="body-item g-text-link" style="width: 24%;" @click="setContainerId(log)">{{log.containerId}}</div>
            <div class="body-item" style="width: 12%;color: #333;">{{log.logType}}</div>
            <div class="body-item" style="color: #333;flex: 1;">
              <div class="g-flex">
                <i class="ndc-icon-next icon-message" :class="{'expand': log.detailVisible}" @click="toggleRow(log)" />
                <div :class="{'indent': log.indent}">
                  <!-- {{replace(log.message)}} -->
                  <span v-html='replace(log.message)'></span>
                  <span v-if="log.canExpand" class="g-text-link" @click="toggleMessage(log, index)">{{log.expanded ? '收起' : '展开'}}</span>
                </div>
              </div>
            </div>
          </div>
          <div class="body-detail" v-if="log.detailVisible">
            <!-- <span class="g-text-link body-link" @click="showSurrounding(log)">view surrounding documents</span> -->
            <ndc-tabs
              is-card
              :tabs="logTabs"
              value="json"
            >
              <ndc-tab-panel name="json">
                <m-json-editor :ref="'jsoneditor_' + index" :json="log.json"></m-json-editor>
              </ndc-tab-panel>
            </ndc-tabs>
          </div>
        </div>
        <div class="log-panel-more g-text-link" v-if="showMore" @click="search(true)">加载更多</div>
      </div>
      <div class="log-panel-empty" v-else>暂无日志</div>
      <u-loading v-if="isLoading" loading-text="加载中，请稍候..."></u-loading>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IJob, ICluster, ILogLevel, ITab, IElkLog } from '@utils/types';

import { cloneDeep } from 'lodash';
import moment from 'moment';
import ModalMixin from '../../../components/modal/mixin';
import { MODAL_TYPE } from '../../../components/modal/constant';
import MJsonEditor from '../json-editor/index.vue';

@Component({
  components: {
    MJsonEditor
  }
})
export default class MJobLog extends Vue {
  @Prop()
  private jobDetail!: IJob;

  @Prop()
  private conditions!: any;

  @Prop({
    default: true
  })
  private inPage!: boolean;

  private containerId: string = '';
  private containerIds: any[] = [];
  private time: any[] = [];
  private types: string[] = ['jobmanager', 'taskmanager'];
  private levels: string[] = ['log.error', 'log'];
  private actualLevels: string[] = [];
  private esLogLevel: ILogLevel | null = null;
  private keyword: string = '';
  private jobContainerIds: any[] = [];
  private taskContainerIds: any[] = [];
  private from: number = 0;
  private size: number = 200;
  private total: number = 0;
  private logList: IElkLog[] = [];
  private originLogList: IElkLog[] = [];
  private showMore: boolean = false;
  private isLoading: boolean = false;
  private defaultPickerValue: any[] = [moment().subtract(1, 'month'), moment()];
  private containerModalInstance: ModalMixin | null = null;
  private logTabs: ITab[] = [{
    name: 'json',
    label: 'JSON'
  }];

  @Watch('containerId')
  private onContainerIdChanged(val: string) {
    this.onConditionChange('containerid');
  }

  @Watch('types')
  private onTypesChanged(val: string[]) {
    this.handleContainerIds();
    this.from = 0;
  }

  @Watch('levels')
  private onLevelsChanged() {
    this.from = 0;
  }

  private replace(input){
    return input.replace(/\n/g,'<br/>')
  }

  private get disabled() {
    return !this.jobDetail.applicationId;
  }

  private disabledDate(args: any) {
    console.log(args, 'timearg');
    if (!args) {
      return false;
    }
    const date1 = new Date(args.format('YYYY-MM-DD'));
    const date2 = new Date(new Date().format('YYYY-MM-DD'));
    return date2.getTime() < date1.getTime();
  }

  private async mounted() {
    console.log(this.jobDetail.applicationId, this.time, 'thistimem');
    try {
      const clusterList: ICluster[] = await this.$request('getClusterList');
      const cluster = (clusterList || []).find(c => c.id === this.jobDetail.clusterId);
      cluster && (this.esLogLevel = cluster.esLogLevel || null);
    } catch (e) {
      this.$handleException(e);
    }

    let appdom:any = document.getElementById('app');
    if (appdom) {
      appdom.style.height = 0;
      appdom.style.display = 'none';
    }
    console.log(appdom, 'appdom');
  }

  public async refresh() {
    if (this.jobDetail.applicationId) {
      await this.getContainerIds();
      this.time = [moment().hours(0).minutes(0).seconds(0), moment()];
    } else {
      this.containerIds = [];
      this.containerId = '';
      this.time = [];
    }

    console.log(this.jobDetail.applicationId, this.time, 'thistimer');

    this.init();
  }

  private init() {
    console.log(this.time, 'thistime0');
    this.keyword = '';
    this.from = 0;
    this.logList = [];
    this.originLogList = [];
    this.types = ['jobmanager', 'taskmanager'];
    this.levels = ['log.error', 'log'];
    if (this.conditions) {
      const { containerId, startTime, endTime, keyword, types, levels } = this.conditions;
      this.containerId = containerId || 'all';
      this.keyword = decodeURIComponent(keyword) || '';
      startTime && (this.time.splice(0, 1, moment(decodeURIComponent(startTime))));
      endTime && (this.time.splice(1, 1, moment(decodeURIComponent(endTime))));
      types.length && (this.types = types);
      levels.length && (this.levels = levels);
      this.handleContainerIds();
      console.log('keyword', this.keyword, this.logList.length);
    }
    if (!this.inPage) {
      this.search(false);
    }
  }

  private async getContainerIds() {
    try {
      const data = await this.$request('getContainerIds', {
        clusterId: this.jobDetail.clusterId,
        applicationId: this.jobDetail.applicationId
      });
      this.taskContainerIds = (data.taskContainerIds || []).map((v: any) => ({
        label: v,
        value: v
      }));
      this.jobContainerIds = (data.jobContainerIds || []).map((v: any) => ({
        label: v,
        value: v
      }));
      this.handleContainerIds();
    } catch (e) {
      this.$handleException(e);
    }
  }

  private handleContainerIds() {
    const length = this.types.length;
    if (length === 0) {
      this.containerIds = [];
      this.containerId = '';
      return;
    }
    if (length === 1) {
      const type = this.types[0];
      const containerIds = type === 'jobmanager' ? cloneDeep(this.jobContainerIds) : cloneDeep(this.taskContainerIds);
      this.containerIds = [{
        label: '全部',
        value: 'all'
      }].concat(containerIds);
    } else {
      const jobContainerIds = cloneDeep(this.jobContainerIds);
      const taskContainerIds = cloneDeep(this.taskContainerIds);
      this.containerIds = [{
        label: '全部',
        value: 'all'
      }].concat(jobContainerIds).concat(taskContainerIds);
    }
    if (!this.containerId || !this.containerIds.some(c => c.value === this.containerId)) {
      this.containerId = 'all';
    }
  }

  private setContainerId(log: IElkLog) {
    this.containerId = log.containerId;
    this.types = [log.logType];
    this.levels = [log.logLevel];
  }

  private async search(append: boolean) {
    try {
      const valid = this.validate();
      if (!valid) {
        return;
      }
      if (!append) {
        this.from = 0;
      }
      this.isLoading = true;
      this.actualLevels = [];
      if (this.esLogLevel && this.esLogLevel.info && this.esLogLevel.info.length) {
        const index = this.levels.indexOf('log');
        if (index !== -1) {
          this.actualLevels.push(this.esLogLevel.info[0]);
        }
      }
      if (this.esLogLevel && this.esLogLevel.error && this.esLogLevel.error.length) {
        const index = this.levels.indexOf('log.error');
        if (index !== -1) {
          this.actualLevels.push(this.esLogLevel.error[0]);
        }
      }

      const result = await this.$request('getOperationJobElkLog', {
        clusterId: this.jobDetail.clusterId,
        applicationId: this.jobDetail.applicationId,
        containerId: this.containerId,
        timeEnd: this.time && this.time.length > 1 ? this.time[1].format('YYYY-MM-DD HH:mm:ss.SSS') : '',
        timeStart: this.time.length ? this.time[0].format('YYYY-MM-DD HH:mm:ss.SSS') : '',
        logType: (this.types || []).join(','),
        logLevel: (this.actualLevels || []).join(','),
        from: this.from,
        size: this.size,
        keyword: this.keyword
      });
      this.total = result.total;
      const list: IElkLog[] = cloneDeep(result.logList || []);
      this.originLogList = append ? this.originLogList.concat(cloneDeep(list)) : cloneDeep(list);
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
        l.detailVisible = false;
        const arr = ['{', `"containerId": "${l.containerId}",`, `"hostName": "${l.hostName}",`, `"id": "${l.id}",`, `"logLevel": "${l.logLevel}",`, `"logType": "${l.logType}",`, `"offset": ${l.offset},`, `"path": "${l.path}",`, `"timestamp": "${l.timestamp}"`, '}'];
        l.json = arr.join('\n');
        return l;
      });
      this.logList = append ? this.logList.concat(newList) : newList;
      console.log(this.logList, newList, append, 'this.logList');
      if (this.total >= this.from + this.size) {
        this.from = this.from + this.size;
        this.showMore = true;
      } else {
        this.showMore = false;
      }
      if (!append) {
        const elm = this.$el.getElementsByClassName('log-panel-body')[0];
        elm && (elm.scrollTop = 0);
      }
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

  private toggleRow(log: IElkLog, index: number) {
    log.detailVisible = !log.detailVisible;
    if (log.detailVisible) {
      this.$nextTick(() => {
        const key = 'jsoneditor_' + index;
        const comps: any[] = this.$refs[key] as any[];
        if (comps && comps.length) {
          const editor:MJsonEditor = comps[0];
          editor && editor.resize();
        }
      });
    }
  }

  private showSurrounding(log: IElkLog) {
    const key = `sloth_surrounding_${log.id}`;
    localStorage.setItem(key, JSON.stringify(log));
    console.log('go to surrounding?');

    // window.open(`#/sloth_surround?id=${log.id}&clusterId=${this.jobDetail.clusterId}&applicationId=${this.jobDetail.applicationId}`, '_blank');
    window.open(`#/oms/onlineDevelop/surrounding?id=${log.id}&clusterId=${this.jobDetail.clusterId}&applicationId=${this.jobDetail.applicationId}`, '_blank');
  }

  private validate() {
    if (this.containerId) {
      this.removeValidateError('containerid');
    } else {
      this.setValidateError('containerid', 'ContainerId不能为空');
      return false;
    }

    if (this.time && this.time.length > 1) {
      this.removeValidateError('time');
    } else {
      this.setValidateError('time', '时间范围不能为空');
      return false;
    }

    if (this.types && this.types.length) {
      this.removeValidateError('logtype');
    } else {
      this.setValidateError('logtype', '日志类别不能为空');
      return false;
    }

    if (this.levels && this.levels.length) {
      this.removeValidateError('loglevel');
    } else {
      this.setValidateError('loglevel', '日志级别不能为空');
      return false;
    }

    return true;
  }

  private setValidateError(field: string, msg: string) {
    this.errors.add({
      field,
      msg
    });
  }

  private removeValidateError(field: string) {
    this.errors.remove(field);
  }

  private async querySubtask() {
    if (!this.containerModalInstance) {
      this.containerModalInstance = this.$createModalInstance(MODAL_TYPE.container);
    }
    this.containerModalInstance && this.containerModalInstance.show({
      clusterId: this.jobDetail.clusterId,
      applicationId: this.jobDetail.applicationId
    }, (args: any) => {
      this.types = ['taskmanager'];
      this.containerId = args.containerId;
      return true;
    });
  }

  private onChangeTypes(val: boolean, type: string) {
    const index = this.types.findIndex(t => t === type);
    if (val && index === -1) {
      this.types.push(type);
    }
    if (!val && index !== -1) {
      this.types.splice(index, 1);
    }
    if (this.types && this.types.length) {
      this.removeValidateError('logtype');
    }
  }

  private onChangeLevels(val: boolean, level: string) {
    const index = this.levels.findIndex(t => t === level);
    if (val && index === -1) {
      this.levels.push(level);
    }
    if (!val && index !== -1) {
      this.levels.splice(index, 1);
    }
    if (this.levels && this.levels.length) {
      this.removeValidateError('loglevel');
    }
  }

  private onConditionChange(field: string) {
    this.from = 0;
    if ((field === 'containerid' && this.containerId) || (field === 'time' && this.time && this.time.length > 1)) {
      this.removeValidateError(field);
    }
  }

  private onFocus() {
    setTimeout(() => {
      const dom = document.getElementsByClassName('el-time-panel__footer');
      if (dom.length > 1) {
        if (dom[1].getElementsByClassName('el-time-panel__btn current').length) {
          return;
        }
        const button = document.createElement('button');
        button.className = 'el-time-panel__btn current';
        button.textContent = '当前时间';
        button.onclick = () => {
          this.setCurrentTime();
        };
        dom[1].prepend(button);
      }
    }, 0);
  }

  private setCurrentTime() {
    if (this.time.length > 1) {
      const time = this.time[1];
      const now = new Date();
      time.setHours(now.getHours());
      time.setMinutes(now.getMinutes());
      time.setSeconds(now.getSeconds());
      this.time.splice(1, 1, time);
      const datePicker = this.$refs.datePicker as any;
      datePicker && datePicker.picker && (datePicker.picker.maxTimePickerVisible = false);
    }
  }

  private handleFullScreen() {
    const startTime = this.time.length && this.time[0].format('YYYY-MM-DD HH:mm:ss.SSS');
    const endTime = this.time.length > 1 && this.time[1].format('YYYY-MM-DD HH:mm:ss.SSS');
    // window.open(`#/sloth_elk?jobId=${this.jobDetail.jobId}&containerId=${this.containerId}&startTime=${startTime}&endTime=${endTime}&type=${this.types.join(',')}&level=${this.levels.join(',')}&keyword=${this.keyword}`, '_blank');
    window.open(`#/oms/onlineDevelop/elk?jobId=${this.jobDetail.jobId}&containerId=${this.containerId}&startTime=${startTime}&endTime=${endTime}&type=${this.types.join(',')}&level=${this.levels.join(',')}&keyword=${this.keyword}`, '_blank');
  }

  private getCurrentTime(args) {
    console.log(args, 'thistime');
    return this.time.length ? [this.time[0], moment()] : [moment().hours(0).minutes(0).seconds(0), moment()];
  }

  private beforeDestroy() {
    this.containerModalInstance && this.containerModalInstance.hide();
    this.containerModalInstance = null;
  }
}
</script>

<style lang="scss">
.el-time-panel__btn.current {
  color: #409eff;
  float: left;
}
.m-job-log {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .search-panel {
    padding: 16px 24px;
    border-bottom: $border;
    display: flex;
    flex-shrink: 0;
    .right {
      margin-left: 40px;
    }
    .row {
      display: flex;
      align-items: center;
      height: 40px;
      padding: 6px 0;
      color: #333;
      .label {
        margin-right: 12px;
        width: 70px;
      }
      .ndc-select,
      .ndc-input {
        height: 36px;
        line-height: 36px;
        width: 376px;
        &:hover {
          border-color: #2b75f6;
        }
        .ndc-select-label {
          line-height: 34px;
        }
      }
    }
  }
  .log-panel {
    padding: 16px;
    box-sizing: border-box;
    overflow: auto;
    flex: 1;
    // height: 0;
    line-height: 24px;
    display: flex;
    flex-direction: column;
    .g-text-link{
      color: #3B68B7;
    }
    &-header {
      width: 100%;
      height: 40px;
      background: #eee;
      border-bottom: 1px solid #e2e5e9;
      padding-right: 8px;
      box-sizing: border-box;
      position: relative;
      .header-item {
        padding: 8px 0 8px 24px;
        box-sizing: border-box;
        color: #666;
        word-wrap: normal;
      }
      .fullscreen {
        font-size: 20px;
        width: 20px;
        position: absolute;
        right: 8px;
        cursor: pointer;
      }
    }
    &-body {
      width: 100%;
      flex: 1;
      // height: 0;
      overflow-x: hidden;
      overflow-y: auto;
      box-sizing: border-box;
      .body-info {
        min-height: 48px;
        border-bottom: 1px solid #ebf0f5;
        box-sizing: border-box;
        .body-detail {
          height: 250px;
          background-color: #e9ebf0;
          position: relative;
          .body-link {
            position: absolute;
            right: 10px;
            top: 10px;
            z-index: 10;
          }
          .ndc-tabs {
            padding-top: 16px;
            box-sizing: border-box;
          }
        }
        .body-list {
          &:hover {
            background: #edf8ff;
          }
        }
      }
      .body-item {
        padding: 12px 10px 12px 24px;
        box-sizing: border-box;
        flex-shrink: 0;
        word-break: break-all;
        .icon-message {
          margin-right: 8px;
          cursor: pointer;
          height: 14px;
          margin-top: 5px;
          &.expand {
            transform: rotate(90deg);
          }
        }
        .indent {
          padding-left: 54px;
        }
      }
    }
    &-empty {
      text-align: center;
      margin-top: 56px;
      color: #999;
    }
    &-more {
      text-align: center;
      line-height: 32px;
    }
  }
}
</style>

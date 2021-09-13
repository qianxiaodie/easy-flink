<template>
  <ndc-modal title="设置报警" class="m-alarm-modal" :visible="visible" :width="1100" :max-height="900" @hide="onHide" :on-confirm="onModalConfirm">
    <ndc-form>
      <ndc-form-item label="任务名称">
        <span>{{modalData.jobName}}</span>
      </ndc-form-item>
      <ndc-form-item label="规则描述" v-for="type in requiredMetricTypes" :key="type">
        <u-validator :name="'requiredrule_' + type" :validate="errors">
          <u-alarm-rule
            :rule="modalData.rulesMap[type]"
            :alarm="requiredAlarms[type]"
            :column-seq="modalData.columnSeq"
            :metric-types-map="modalData.metricTypesMap"
            :metric-types="modalData.metricTypes"
          ></u-alarm-rule>
        </u-validator>
      </ndc-form-item>
      <div class="alarm-split-line"></div>
      <ndc-form-item label="规则描述" v-for="(alarm, index) in optionalAlarms" :key="index">
         <u-validator :name="'optionalrule_' + index" :validate="errors">
          <u-alarm-rule
            :rule="modalData.rulesMap[alarm.metricType]"
            :alarm="alarm"
            :column-seq="modalData.columnSeq"
            :metric-types-map="modalData.metricTypesMap"
            :metric-types="modalData.metricTypes"
            @change="onChange(arguments[0], index)"
          ></u-alarm-rule>
        </u-validator>
        <i class="ndc-icon-close rule-close" @click="removeRule(index)" />
      </ndc-form-item>
      <ndc-form-item class="alarm-small">
        <span class="g-text-link" @click="addRule">+ 添加报警规则</span>
      </ndc-form-item>
      <div class="alarm-split-line"></div>
      <ndc-form-item class="alarm-small" label="报警接收人">
        <u-validator name="receiverType" :validate="errors">
          <ndc-radio v-model="receiverType" label="person">报警人</ndc-radio>
          <ndc-radio class="g-ml-24 g-mr-32" v-model="receiverType" label="group">报警组</ndc-radio>
          <u-alarm-input v-if="receiverType === 'person'" :users="users" :options="alarmUsers" @insert="onInsert" @remove="onRemove"></u-alarm-input>
          <ndc-select class="group-select" v-if="receiverType === 'group'" :options="alarmGroups" value-key="id" label-key="name" v-model="alarmGroupId"></ndc-select>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item class="alarm-small" label="报警接收方式">
        <u-validator name="receiveType" :validate="errors">
          <ndc-checkbox v-for="type in alarmTypes" :key="type.id" class="g-mr-24" :value="receiveType.includes(type.receiveType)" :label="type.receiveDesc" @change="onChangeType(arguments[0], type.receiveType)"></ndc-checkbox>
        </u-validator>
      </ndc-form-item>
      <ndc-form-item class="alarm-small" label="报警抑制时间">
        <div class="g-flex-ac">
          <a-switch v-model="pausingEnable"></a-switch>
          <div class="g-flex-ac g-ml-32" style="position: relative;" v-show="pausingEnable">
            <input class="ndc-input pausing-input" v-number="{'min': 1}" v-model="pausingInterval" />
            <span class="pausing-unit">分钟</span>
          </div>
          <div class="g-ml-16 g-flex-ac" v-if="remainTime > 0 && pausingEnable">抑制时间剩余<span class="g-text-semi g-ml-8 g-mr-8">{{remainTime}}</span>分钟</div>
        </div>
      </ndc-form-item>
      <!-- <ndc-form-item class="alarm-small" label="是否关闭报警">
        <ndc-checkbox v-model="alarmEnable" label=""></ndc-checkbox>
      </ndc-form-item> -->
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator';
import ModalMixin from '../mixin';
import UAlarmRule from './alarm-rule.vue';
import UAlarmInput from './alarm-input.vue';
import { cloneDeep } from 'lodash';
import dayjs from 'dayjs';
import { IAlarmDetail, IAlarmConfigMeta } from '@utils/types';

@Component({
  components: {
    UAlarmRule,
    UAlarmInput
  }
})
export default class MAlarmModal extends Mixins(ModalMixin) {
  private optionalAlarms: any[] = [];
  private requiredAlarms: any = {};
  private requiredMetricTypes: string[] = [];
  private optionalData: any = {}; // 每次新增规则时默认数据
  private defaultData: any = {}; // 所有类型规则的默认数据
  private receiveType: string[] = [];
  private pausingInterval: number = 30;
  private pausingEnable: boolean = false;
  private receiverType: string = 'person'; // 报警接收人（person,group）
  private alarmGroups: any[] = [];
  private alarmGroupId: number | null = null;
  private users: any[] = [];
  private alarmUsers: any[] = [];
  private remainTime: number = 0;
  private timer: any = null;
  private alarmEnable: boolean = true;
  private alarmTypes: any[] = [];

  @Watch('visible')
  onVisibleChanged(val: boolean) {
    if (!val && this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async show(data: any, callback?: any) {
    this.showModal(data, callback);
    this.initDefaultData(data);
    this.initAlarmData(data);
    await this.initAlarmGroups();
    this.initAlarmArgs(data);
  }

  private initDefaultData(data: any) {
    this.defaultData = {};
    this.requiredAlarms = {};
    const { columnSeq = [], metricTypes = [], requiredMetricTypes = [], rulesMap, alarmTypes = [] } = data;
    this.alarmTypes = alarmTypes;
    this.receiveType = alarmTypes.map(t => t.receiveType);

    const func = (id: string): any => {
      const rule = rulesMap[id];
      if (!rule) {
        return {};
      }
      const data: any = {};
      columnSeq.forEach((col: string) => {
        if (col !== 'id' && col !== 'optional' && col !== 'metricType') {
          const val = rule[col];
          data[col] = !val || val === '-1' || val === -1 ? '-1' : val.default;
        }
        data['metricType'] = id;
      });
      return data;
    };

    metricTypes.forEach((m: any) => {
      const id = m.id;
      this.defaultData[id] = func(id);
    });

    requiredMetricTypes.forEach((m: any) => {
      const id = m.id;
      this.requiredAlarms[id] = func(id);
    });

    this.optionalData = this.defaultData['input_qps'] || {};
  }

  private initAlarmData(data: any) {
    const rules: any[] = data.requiredRules || [];
    this.requiredMetricTypes = [];
    rules.forEach(rule => {
      const metricType = rule.metricType || {};
      this.requiredMetricTypes.push(metricType.id);
    });
    this.optionalAlarms = [];
    const { alarm = {} } = data;
    const alarmData: any[] = alarm.alarmDetail || [];
    alarmData.forEach(d => {
      if (!d.metricName) {
        d.metricName = -1;
      }
      const metricType = d.metricType;
      if (this.requiredMetricTypes.includes(metricType)) {
        this.requiredAlarms[metricType] = d;
      } else {
        this.optionalAlarms.push(d);
      }
    });
  }

  private async initAlarmGroups() {
    try {
      const promiseArr = [
        this.$request('getAlarmGroups').then(data => this.alarmGroups = data || []),
        this.$request('getAlarmUsers').then(data => this.alarmUsers = data || [])
      ];
      return Promise.all(promiseArr);
    } catch (e) {
      this.$handleException(e);
    }
  }

  private initAlarmArgs(data: any) {
    const { alarm } = data;
    if (alarm.alarmGroupId) {
      this.receiverType = 'group';
      this.alarmGroupId = alarm.alarmGroupId;
    } else {
      const users: any[] = [];
      const mailList = (alarm.mailList || '').split(',').filter(Boolean);
      (this.alarmUsers || []).forEach(u => {
        if (mailList.includes(u.email)) {
          users.push(u);
        }
      });
      if (mailList.length !== users.length) {
        const emails = users.map(u => u.email).filter(Boolean);
        mailList.forEach(m => {
          if (!emails.includes(m)) {
            users.push({
              email: m,
              name: m
            });
          }
        });
      }
      this.users = users;
      this.receiverType = 'person';
    }
    this.receiveType = alarm.receiveType || [];
    this.pausingEnable = alarm.isPausingEnable || false;
    this.pausingInterval = (this.pausingEnable && alarm.pausingInterval) || 30;
    if (this.pausingEnable && alarm.pausingEndTime) {
      this.remainTime = dayjs(alarm.pausingEndTime).diff(dayjs(), 'minute');
      if (this.remainTime > 0) {
        this.timer = setInterval(() => {
          this.remainTime--;
          if (this.remainTime <= 0 && this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
        }, 60 * 1000);
      }
    } else {
      this.remainTime = 0;
    }
    this.alarmEnable = alarm.alarmEnable || true;
  }

  private addRule() {
    this.optionalAlarms.push(cloneDeep(this.optionalData));
  }

  private removeRule(index: number) {
    this.optionalAlarms.splice(index, 1);
  }

  private onChange(val: string, index: number) {
    const data = cloneDeep(this.defaultData[val]);
    this.optionalAlarms.splice(index, 1, data);
  }

  private onInsert(user: any) {
    this.users.push(user);
  }

  private onRemove(user: any) {
    const index = this.users.findIndex(u => u.email === user.email);
    if (index !== -1) {
      this.users.splice(index, 1);
    }
  }

  private onChangeType(val: boolean, type: string) {
    const index = this.receiveType.findIndex(t => t === type);
    if (index === -1 && val) {
      this.receiveType.push(type);
    }
    if (index !== -1 && !val) {
      this.receiveType.splice(index, 1);
    }
  }

  private onModalConfirm() {
    const valid = this.validate();
    if (!valid) {
      return false;
    }
    const params = this.genParams();
    return this.onConfirm(params);
  }

  private genParams() {
    const alarmDetail: any[] = [];
    const keys = Object.keys(this.requiredAlarms);
    keys.forEach(key => {
      const data = this.requiredAlarms[key];
      alarmDetail.push(data);
    });
    this.optionalAlarms.forEach(alarm => alarmDetail.push(alarm));
    return {
      alarmDetail,
      alarmGroupId: this.receiverType === 'group' ? this.alarmGroupId : 0,
      emails: this.receiverType === 'group' ? [] : this.users.map(user => user.email),
      receiveType: this.receiveType,
      pausingEnable: this.pausingEnable,
      pausingInterval: this.pausingInterval,
      alarmEnable: this.alarmEnable
    };
  }

  private validate(): boolean {
    let valid = true;
    const keys = Object.keys(this.requiredAlarms);
    keys.forEach(key => {
      const data = this.requiredAlarms[key];
      const val = this.compareRuleData(data, key, 'requiredrule_' + key);
      if (!val) {
        valid = false;
      }
    });
    this.optionalAlarms.forEach((alarm, index) => {
      const val = this.compareRuleData(alarm, alarm.metricType, 'optionalrule_' + index);
      if (!val) {
        valid = false;
      }
    });
    if ((this.receiverType === 'person' && !(this.users && this.users.length)) || (this.receiverType === 'group' && !this.alarmGroupId)) {
      valid = false;
      this.addValidatorError('receiverType', '报警接收人不能为空');
    } else {
      this.removeValidatorError('receiverType');
    }
    if (!this.receiveType.length) {
      valid = false;
      this.addValidatorError('receiveType', '请至少选择一项报警接收方式');
    } else {
      this.removeValidatorError('receiveType');
    }
    return valid;
  }

  private compareRuleData(data: any, type: string, field: string) {
    const rule: any = this.modalData.rulesMap[type];
    const keys = Object.keys(rule);
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (key === 'id' || key === 'optional' || (rule[key] === '-1' || rule[key] === -1)) {
        continue;
      }
      if (!data[key]) {
        this.addValidatorError(field, '规则描述不完整');
        return false;
      }
    }
    this.removeValidatorError(field);
    return true;
  }
}
</script>

<style lang="scss">
.m-alarm-modal {
  .ndc-modal-content {
    padding: 0 40px;
    .alarm-small {
      padding: 4px 0;
      .u-validator .error {
        top: calc(100% - 2px);
      }
    }
  }
  .ndc-form .ndc-form-item .content {
    .rule-close {
      position: absolute;
      right: 0;
      cursor: pointer;
    }
    .ndc-select {
      width: 98px;
      padding-left: 8px;
      padding-right: 24px;
      &.cycleTime {
        width: 118px;
      }
      &.cycleNum {
        width: 128px;
      }
      &.operator {
        width: 62px;
      }
      &.metricType {
        width: 158px;
      }
    }
    .ndc-input {
      width: 78px;
      padding-left: 8px;
      padding-right: 24px;
      &.alarmInterval {
        padding-right: 40px;
      }
      &.threshold.qps {
        width: 96px;
        padding-right: 40px;
      }
    }
    .pausing-input {
      width: 80px;
      padding-right: 40px;
    }
    .pausing-unit {
      position: absolute;
      right: 8px;
      color: #637881;
      user-select: none;
    }
    .group-select {
      width: 464px;
    }
    .u-validator {
      display: flex;
      align-items: center;
    }
  }
  .u-alarm-rule {
    flex-shrink: 0;
    width: 100%;
    .hidden {
      display: none;
    }
    .u-alarm-item {
      margin-right: 8px;
      position: relative;
      .unit {
        color: #687381;
        position: absolute;
        right: 8px;
        user-select: none;
      }
    }
    .rule.alarmInterval {
      margin-left: auto;
      margin-right: 24px;
      .u-alarm-item {
        margin-right: 0;
      }
    }
    &.record_lag .ndc-input.threshold {
      width: 120px;
    }
  }
  .alarm-split-line {
    height: 1px;
    background: #e2e7f0;
    margin: 8px 0;
  }
}
</style>

<template>
  <ndc-modal
    title="设置报警"
    class="m-alarm-modal"
    :visible="visible"
    :top="90"
    :width="1100"
    :max-height="900"
    @hide="onHide"
    :on-confirm="onModalConfirm"
  >
    <div class="m-alarm-detail">
      <img src="@assets/images/icon_warn.png" alt />
      您可前往运维详情页面查看
      <ndc-table-link @click="toalarm(modalData.jobId)">告警历史</ndc-table-link>
    </div>
    <ndc-form label-align="right" label-width="98px">
      <div class="m-alarm-title">
        <div class="m-alarm-num">1</div>报警配置
        <div class="m-alarm-line"></div>
      </div>
      <div class="m-alarm-one" style="margin-left:25px">
        <ndc-form-item label="任务名称：">
          <span>{{modalData.jobName}}</span>
        </ndc-form-item>
        <!-- <div style="margin-left:60px"> -->
        <ndc-form-item label="规则描述：" class="alarm-small">
          <ndc-select
            style="width:250px"
            :options="modalData.metricTypes"
            value-key="id"
            label-key="value"
            v-model="selectalarm"
          ></ndc-select>
          <ndc-button
            disabled
            theme="primary"
            style="width:60px;margin-left:20px;padding:0"
            @click="addRule"
          >添加</ndc-button>
        </ndc-form-item>
        <!-- </div>  -->
        <!-- <ndc-form-item label="规则描述:">
          <ndc-select style="width:250px" :options="selealarm" value-key="id" label-key="name" v-model="selectalarm"></ndc-select>
          <div class="m-alarm-add" @click="addRule">添加</div>
          <span>{{modalData.jobName}}</span>
        </ndc-form-item>-->
        <!-- 原本已有的规则 -->
        <ndc-form-item label v-for="type in requiredMetricTypes" :key="type">
          <u-validator :name="'requiredrule_' + type" :validate="errors">
            <u-alarm-rule
              :rule="modalData.rulesMap[type]"
              :alarm="requiredAlarms[type]"
              :column-seq="modalData.columnSeq"
              :metric-types-map="modalData.metricTypesMap"
              :metric-types="modalData.metricTypes"
              @inputchange="inputchange"
              @change="onChange(arguments[0], index)"
            ></u-alarm-rule>
          </u-validator>
        </ndc-form-item>
        <!-- <div class="alarm-split-line"></div> -->
        <!-- 添加的规则 -->
        <!-- <ndc-form-item label="" v-for="(alarm, index) in optionalAlarms" :key="index">
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
        </ndc-form-item>-->
      </div>
      <!-- <div class="m-alarm-title">
        <div class="m-alarm-num">
          2
        </div>
        添加规则
      </div>
      <div style="margin-left:60px">
        <ndc-form-item label="规则描述:" class="alarm-small">
          <ndc-select style="width:250px" :options="modalData.metricTypes" value-key="id" label-key="value" v-model="selectalarm"></ndc-select>
          <span class="g-text-link" @click="addRule"> + 添加报警规则</span>
        </ndc-form-item>
      </div>-->
      <!-- <div class="alarm-split-line"></div> -->
      <div class="m-alarm-title">
        <div class="m-alarm-num">2</div>报警接收
        <div class="m-alarm-line"></div>
      </div>
      <div style="margin-left:25px">
        <ndc-form-item class="alarm-small" label="报警接收方式：">
          <u-validator name="receiveType" :validate="errors">
            <ndc-checkbox
              v-for="type in alarmTypes"
              :key="type.id"
              class="g-mr-24"
              :value="receiveType.includes(type.receiveType)"
              :label="type.receiveDesc"
              @change="onChangeType(arguments[0], type.receiveType)"
            ></ndc-checkbox>
          </u-validator>
        </ndc-form-item>
        <ndc-form-item class="alarm-small" label="报警接收人：">
          <!-- operations/alarm/receiveType 接口获取报警方式 -->
          <u-validator name="receiverType" :validate="errors">
            <a-radio-group v-model="receiverType">
              <a-radio value="person" style="font-family: MicrosoftYaHei;color: #222222;">
                <span style="padding-left:8px">报警人</span>
              </a-radio>
              <!-- <a-radio disabled value="group">
              报警组
              </a-radio>-->
            </a-radio-group>
            <!-- <a-radio v-model="receiverType" label="person">报警人</a-radio>
            <a-radio class="g-ml-24 g-mr-32" v-model="receiverType" label="group">报警组</a-radio>-->
          </u-validator>
        </ndc-form-item>
        <ndc-form-item class="alarm-small">
          <u-alarm-input
            v-if="receiverType === 'person'"
            :users="users"
            :options="alarmUsers"
            @insert="onInsert"
            @remove="onRemove"
          ></u-alarm-input>
          <!-- <ndc-select class="group-select" v-if="receiverType === 'group'" :options="alarmGroups" value-key="id" label-key="name" v-model="alarmGroupId"></ndc-select> -->
        </ndc-form-item>
        <!-- <ndc-form-item class="alarm-small" label="报警抑制时间：">
        <div class="g-flex-ac">
          <a-switch v-model="pausingEnable"></a-switch>
          <div class="g-flex-ac g-ml-32" style="position: relative;" v-show="pausingEnable">
            <input class="ndc-input pausing-input" v-number="{'min': 1}" v-model="pausingInterval" />
            <span class="pausing-unit">分钟</span>
          </div>
          <div class="g-ml-16 g-flex-ac" v-if="remainTime > 0 && pausingEnable">抑制时间剩余<span class="g-text-semi g-ml-8 g-mr-8">{{remainTime}}</span>分钟</div>
        </div>
        </ndc-form-item>-->
        <!-- <ndc-form-item class="alarm-small" label="是否关闭报警：">
        <ndc-checkbox v-model="alarmEnable" label=""></ndc-checkbox>
        </ndc-form-item>-->
        <ndc-form-item class="alarm-small" label="关闭报警：">
          <a-switch v-model="alarmEnable"></a-switch>
        </ndc-form-item>
      </div>
    </ndc-form>
    <template v-slot:footer>
      <div class="g-flex-ac" style="flex-direction: row-reverse;">
        <ndc-button @click="onHide">取消</ndc-button>
        <ndc-button class="g-mr-16" theme="primary" @click="onModalConfirm">确定</ndc-button>
      </div>
    </template>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins, Watch } from 'vue-property-decorator'
import ModalMixin from '../mixin'
import UAlarmRule from './alarm-rule.vue'
import UAlarmInput from './alarm-input.vue'
import { cloneDeep } from 'lodash'
import dayjs from 'dayjs'
import { IAlarmDetail, IAlarmConfigMeta } from '@utils/types'
import Axios from 'axios'
import { getUserList } from './user'
import Bus from '@/bus'

@Component({
  components: {
    UAlarmRule,
    UAlarmInput
  }
})
export default class MAlarmModal extends Mixins(ModalMixin) {
  private optionalAlarms: any[] = []
  private requiredAlarms: any = {}
  private requiredMetricTypes: string[] = []
  private optionalData: any = {} // 每次新增规则时默认数据
  private defaultData: any = {} // 所有类型规则的默认数据
  private receiveType: string[] = []
  private pausingInterval: number = 30
  private pausingEnable: boolean = false
  private receiverType: string = 'person' // 报警接收人（person,group）
  private alarmGroups: any[] = []

  private alarmGroupId: number | null = null
  private selectalarm: number | null = null // 添加select

  private users: any[] = []
  private alarmUsers: any[] = []
  private remainTime: number = 0
  private timer: any = null
  private alarmEnable: boolean = false
  private alarmTypes: any[] = []

  @Watch('visible')
  onVisibleChanged(val: boolean) {
    if (!val && this.timer) {
      clearInterval(this.timer)
      this.timer = null
    }
  }

  public async show(data: any, callback?: any) {
    this.showModal(data, callback)
    this.initDefaultData(data)
    this.initAlarmData(data)
    console.log('alarmdata', data, this.requiredAlarms) // requiredMetricTypes 规则描述 alarmTypes 报警接受方式 metricTypes 添加的规则描述
    const params = {
      jobId: data.jobId
    }
    this.users = []

    //原设置的参数
    this.$request('getJobalarmConfig', params).then(async result => {
      console.log('res users', result)
      this.alarmEnable = result.alarmEnable
      this.requiredAlarms.job_failed.alarmInterval = result.sendInterval || '5'

      const Receiver = result.receiver || []

      for (let i = 0; i < Receiver.length; i++) {
        console.log(Receiver[i], 'Receiver users')
        let res = await getUserList(Receiver[i])
        console.log('input users', res)
        this.users.push(res[0])
      }
      console.log(this.users, 'showusers')
    })

    await this.initAlarmGroups()

    this.initAlarmArgs(data)
  }

  private toalarm(id) {
    console.log('to alarm', id)
    Bus.$emit('admin_job_alarm', this.modalData)
    this.onHide()
    // window.open(`#/oms/onlineDevelop/operation?id=${id}&alarm=true`, '_blank');
    // window.open(`#/sloth_opera?id=${id}&alarm=true`, '_blank');
  }

  private initDefaultData(data: any) {
    this.defaultData = {}
    this.requiredAlarms = {}
    const { columnSeq = [], metricTypes = [], requiredMetricTypes = [], rulesMap, alarmTypes = [] } = data
    this.alarmTypes = alarmTypes
    console.log('alarm', alarmTypes)
    this.receiveType = alarmTypes.map(t => t.receiveType)

    const func = (id: string): any => {
      const rule = rulesMap[id]
      if (!rule) {
        return {}
      }
      const data: any = {}
      columnSeq.forEach((col: string) => {
        if (col !== 'id' && col !== 'optional' && col !== 'metricType') {
          const val = rule[col]
          data[col] = !val || val === '-1' || val === -1 ? '-1' : val.default
        }
        data['metricType'] = id
      })
      return data
    }

    metricTypes.forEach((m: any) => {
      const id = m.id
      this.defaultData[id] = func(id)
    })

    requiredMetricTypes.forEach((m: any) => {
      const id = m.id
      this.requiredAlarms[id] = func(id)
    })

    this.optionalData = this.defaultData['input_qps'] || {}
  }

  private initAlarmData(data: any) {
    const rules: any[] = data.requiredRules || []
    this.requiredMetricTypes = []
    rules.forEach(rule => {
      const metricType = rule.metricType || {}
      this.requiredMetricTypes.push(metricType.id)
    })
    this.optionalAlarms = []
    const { alarm = {} } = data
    const alarmData: any[] = alarm.alarmDetail || []
    alarmData.forEach(d => {
      if (!d.metricName) {
        d.metricName = -1
      }
      const metricType = d.metricType
      if (this.requiredMetricTypes.includes(metricType)) {
        this.requiredAlarms[metricType] = d
      } else {
        this.optionalAlarms.push(d)
      }
    })
  }

  private async initAlarmGroups() {
    try {
      const promiseArr = [
        this.$request('getAlarmGroups').then(data => (this.alarmGroups = data || []))
        // 获取报警人(用户)list
        // this.$request('getAlarmUsers').then(data => {
        //   this.alarmUsers = data || [];
        //   console.log(this.alarmUsers, "alarmUser");
        // })
      ]
      return Promise.all(promiseArr)
    } catch (e) {
      this.$handleException(e)
    }
  }

  private seeparams() {
    console.log(this.alarmUsers, 'alarmUsers')
  }

  private inputchange(val: any) {
    // this.pausingInterval = val.alarmInterval
    // console.log(val,this.requiredAlarms,'params222')
  }

  private initAlarmArgs(data: any) {
    const { alarm } = data
    console.log(alarm, 'params1')
    if (alarm.alarmGroupId) {
      this.receiverType = 'group'
      this.alarmGroupId = alarm.alarmGroupId
    } else {
      // const users: any[] = [];
      // const mailList = (alarm.mailList || '').split(',').filter(Boolean);
      // (this.alarmUsers || []).forEach(u => {
      //   if (mailList.includes(u.email)) {
      //     users.push(u);
      //   }
      // });
      // if (mailList.length !== users.length) {
      //   const emails = users.map(u => u.email).filter(Boolean);
      //   mailList.forEach(m => {
      //     if (!emails.includes(m)) {
      //       users.push({
      //         email: m,
      //         name: m
      //       });
      //     }
      //   });
      // }
      // this.users = users; // 默认当前用户的
      console.log(this.users, 'usersusers')
      this.receiverType = 'person'
    }
    this.receiveType = alarm.receiveType || []
    this.pausingEnable = alarm.isPausingEnable || false
    this.pausingInterval = (this.pausingEnable && alarm.pausingInterval) || 30
    if (this.pausingEnable && alarm.pausingEndTime) {
      this.remainTime = dayjs(alarm.pausingEndTime).diff(dayjs(), 'minute')
      if (this.remainTime > 0) {
        this.timer = setInterval(() => {
          this.remainTime--
          if (this.remainTime <= 0 && this.timer) {
            clearInterval(this.timer)
            this.timer = null
          }
        }, 60 * 1000)
      }
    } else {
      this.remainTime = 0
    }
    // this.alarmEnable = alarm.alarmEnable || false;
  }

  private addRule() {
    this.optionalData.metricType = this.selectalarm
    console.log(this.optionalData, 'add', this.selectalarm)
    this.optionalAlarms.push(cloneDeep(this.optionalData))
  }

  private removeRule(index: number) {
    this.optionalAlarms.splice(index, 1)
  }

  private onChange(val: string, index: number) {
    console.log(val, 'params111')
    const data = cloneDeep(this.defaultData[val])
    this.optionalAlarms.splice(index, 1, data)
  }

  private onInsert(user: any) {
    this.users.push(user)
  }

  private onRemove(user: any) {
    const index = this.users.findIndex(u => u.email === user.email)
    if (index !== -1) {
      this.users.splice(index, 1)
    }
  }

  private onChangeType(val: boolean, type: string) {
    const index = this.receiveType.findIndex(t => t === type)
    if (index === -1 && val) {
      this.receiveType.push(type)
    }
    if (index !== -1 && !val) {
      this.receiveType.splice(index, 1)
    }
  }

  private async onModalConfirm() {
    // const valid = this.validate();
    // if (!valid) {
    //   return false;
    // }
    const params = this.genParams()
    console.log('setAlarm params', params)
    // return this.onConfirm(params)
    const result = await this.onConfirm(params)
    console.log(result, 'error')
    result && this.onHide()
  }

  private genParams() {
    const alarmDetail: any[] = []
    const keys = Object.keys(this.requiredAlarms)
    keys.forEach(key => {
      const data = this.requiredAlarms[key]
      alarmDetail.push(data)
    })
    this.optionalAlarms.forEach(alarm => alarmDetail.push(alarm))
    return {
      alarmDetail,
      alarmGroupId: this.receiverType === 'group' ? this.alarmGroupId : 0,
      emails: this.receiverType === 'group' ? [] : this.users.map(user => user.email),
      userNos: this.receiverType === 'group' ? [] : this.users.map(user => user.userNo),
      receiveType: this.receiveType,
      pausingEnable: this.pausingEnable,
      pausingInterval: this.pausingInterval,
      alarmEnable: this.alarmEnable
    }
  }

  private validate(): boolean {
    let valid = true
    const keys = Object.keys(this.requiredAlarms)
    keys.forEach(key => {
      const data = this.requiredAlarms[key]
      const val = this.compareRuleData(data, key, 'requiredrule_' + key)
      if (!val) {
        valid = false
      }
    })
    this.optionalAlarms.forEach((alarm, index) => {
      const val = this.compareRuleData(alarm, alarm.metricType, 'optionalrule_' + index)
      if (!val) {
        valid = false
      }
    })
    if ((this.receiverType === 'person' && !(this.users && this.users.length)) || (this.receiverType === 'group' && !this.alarmGroupId)) {
      valid = false
      this.addValidatorError('receiverType', '报警接收人不能为空')
    } else {
      this.removeValidatorError('receiverType')
    }
    if (!this.receiveType.length) {
      valid = false
      this.addValidatorError('receiveType', '请至少选择一项报警接收方式')
    } else {
      this.removeValidatorError('receiveType')
    }
    return valid
  }

  private compareRuleData(data: any, type: string, field: string) {
    const rule: any = this.modalData.rulesMap[type]
    const keys = Object.keys(rule)
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i]
      if (key === 'id' || key === 'optional' || rule[key] === '-1' || rule[key] === -1) {
        continue
      }
      if (!data[key]) {
        this.addValidatorError(field, '规则描述不完整')
        return false
      }
    }
    this.removeValidatorError(field)
    return true
  }
}
</script>

<style lang="scss">
.m-alarm-modal {
  /deep/ .ant-radio-checked .ant-radio-inner {
    border-color: #3b68b7;
  }
  /deep/ .ant-radio-inner::after {
    background: #3b68b7;
  }
  /deep/span.ant-radio + * {
    padding-left: 0;
  }
  .ndc-modal-header {
    background-color: #eeeeee;
    height: 40px;
  }

  // .ndc-modal-main .ndc-modal-content .ndc-form-item .label{
  //   width: 98px;
  // }

  .m-alarm-detail {
    line-height: 40px;
    background: #fffcfa;
    padding: 0 20px;
    margin-top: 20px;
    border-radius: 3px;
    color: #ff8c19;
    border: 1px solid #ff8c19;
    img {
      width: 16px;
      height: 16px;
    }
  }
  .m-alarm-title {
    display: flex;
    padding-top: 20px;
    line-height: 20px;
    font-weight: bolder;
    .m-alarm-line {
      width: 90%;
      margin-top: 12px;
      margin-left: 8px;
      height: 1px;
      background: #dddddd;
    }
    .m-alarm-num {
      width: 20px;
      font-weight: normal;
      height: 20px;
      color: white;
      text-align: center;
      margin-right: 10px;
      background: #3b68b7;
      border-radius: 10px;
    }
  }
  .m-alarm-add {
    margin-left: 5px;
    width: 60px;
    height: 32px;
    background: #3b68b7;
    border-radius: 3px;
    color: #fff;
    text-align: center;
    line-height: 32px;
    cursor: pointer;
  }
  .ndc-modal-content {
    padding: 0 20px;
    .ant-switch {
      width: 28px;
      height: 18px;
    }
    .ant-switch-checked {
      background-color: #3b68b7;
    }
    .ant-switch-loading-icon,
    .ant-switch::after {
      top: 0px;
      width: 16px;
      height: 16px;
      border-radius: 16px;
    }
    .alarm-small {
      .ndc-checkbox-input.checked {
        border-color: #3b68b7;
        background-color: #3b68b7;
      }
      padding: 4px 0;
      .u-validator .error {
        top: calc(100% - 2px);
      }
    }
  }
  .ndc-form .ndc-form-item .label {
    width: 98px;
  }
  .ndc-form .m-alarm-one .ndc-form-item .content .u-validator {
    padding: 12px;
    background: #fafafa;
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
        padding-right: 20px;
      }
      &.threshold.qps {
        width: 96px;
        padding-right: 20px;
      }
    }
    .pausing-input {
      width: 80px;
      padding-right: 20px;
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

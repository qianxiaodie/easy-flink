<template>
  <div class="deploy-steps">
    <ndc-modal title="测试集群调试" :visible="visible" @hide="onHide" :width="900" :height="820" :maxHeight="820" :top="0" :closable="false">
      <m-steps-modals :currentStepsz="currentSteps"></m-steps-modals>
      <div v-show="currentSteps == 1">
        <el-form :model="ruleForm" :rules="rules" ref="ruleForm" label-width="180px" class="demo-ruleForm">
          <div class="second-steps-style">
            <div>
              <div class="back-hide" @click="showListupFun()">
                <span>
                  <i :class="showListup ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i>
                  <span>运行参数</span>
                </span>
                <span :style="{ color: showListup ? 'rgb(24, 144, 255)' : 'black' }">
                  <i class="el-icon-circle-check"></i>
                </span>
              </div>
              <div v-show="showListup" class="hisdeform">
                <el-form-item label="提交集群：" prop="clusterName">
                  <el-select v-model="ruleForm.clusterName" popper-class="short-size" size="small" placeholder="请选择">
                    <el-option v-for="item in aggregate.typeOptions" :key="item.id" :label="item.clusterName" :value="item.id"></el-option>
                  </el-select>
                </el-form-item>
                <el-form-item label="队列：" prop="queueName" :style="showInformation?{ 'margin-bottom': '20px' }:''">
                  <el-select v-model="ruleForm.queueName" popper-class="short-size" size="small" placeholder="请选择">
                    <el-option v-for="item in aggregate.appSpaceIdList" :key="item.queueId" :label="item.queueName" :value="item.queueId"></el-option>
                  </el-select>
                  <div class="text-informatiom" v-if="showInformation">请在项目设置中绑定指南针系统，否则无法选择有权限资源队列</div>
                </el-form-item>
                <el-form-item label="jm.memory：" prop="jm" v-if="tab === 'JAR'">
                  <el-input v-model="ruleForm.jm"></el-input>
                  <el-tooltip class="item" effect="dark" content="向Yarn申请jobmanager的内存" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="tm.memory：" prop="tm">
                  <el-input v-model="ruleForm.tm"></el-input>
                  <el-tooltip class="item" effect="dark" content="向Yarn申请taskmanager的内存" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="slot：" prop="slot" v-if="tab === 'JAR'">
                  <el-input v-model="ruleForm.slot"></el-input>
                  <el-tooltip class="item" effect="dark" content="每个tm分配的槽数, 对应yarn的vcore" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="trigger.interval：" prop="trigger" v-if="tab === 'SQL'">
                  <el-input v-model="ruleForm.trigger"></el-input>
                  <el-tooltip class="item" effect="dark" content="触发watermark（水位线）计算的间隔" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="checkpoint.interval：" prop="checkpointInterval" v-if="tab === 'SQL'">
                  <el-input v-model="ruleForm.checkpointInterval"></el-input>
                  <el-tooltip class="item" effect="dark" content="触发checkpoint操作间隔" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="state_ttl：" prop="ttl" v-if="tab === 'SQL'">
                  <el-input v-model="ruleForm.ttl"></el-input>
                  <el-tooltip class="item" effect="dark" content="状态的生存周期，单位秒" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="env.parallelism：" prop="env">
                  <el-input v-model="ruleForm.env"></el-input>
                  <el-tooltip class="item" effect="dark" content="任务并行度配置" placement="top">
                    <img class="questionTip" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
                <el-form-item label="checkpoint：" prop="checkoutpoint">
                  <el-select v-model="ruleForm.checkoutpoint" placeholder="请选择" popper-class="short-size" size="small">
                    <el-option v-for="item in aggregate.checkpointsList" :key="item.pathSuffix" :label="getitem(item)" :value="item.pathSuffix"></el-option>
                  </el-select>
                  <el-tooltip class="item" effect="dark" content="可用于恢复的checkpoint" placement="top">
                    <img class="questionTipLast" src="@/assets/images/wenhao.svg" />
                  </el-tooltip>
                </el-form-item>
              </div>
            </div>
            <div>
              <div class="back-hide" @click="showListdownFun()">
                <span>
                  <i :class="showListdown ? 'el-icon-caret-bottom' : 'el-icon-caret-right'"></i>
                  <span>高级配置</span>
                </span>
                <span :style="{ color: showListdown ? 'rgb(24, 144, 255)' : 'black' }">
                  <i class="el-icon-circle-check"></i>
                </span>
              </div>
              <div v-if="showListdown">
                <div class="bottom-contain">
                  <span>
                    高级配置：
                  </span>
                  <textarea class="texthight" v-model="extRunParameter" />
                </div>
              </div>
            </div>
          </div>
        </el-form>
      </div>
      <div v-if="currentSteps == 2" class="thired-steps">
        <div style="padding-left:10px; border-left: 2px solid #3B68B7;">
          <h3>
            <b>版本</b>
          </h3>
        </div>
        <div style="margin-left:20px;">
          <el-row>
            <el-col :span="12"
              ><div class="grid-content bg-purple">
                项目名称：<span>{{ decodeURIComponent(spaceName) }}</span>
              </div></el-col
            >
            <el-col :span="12"
              ><div class="grid-content bg-purple">项目类型：<span>实时计算</span></div></el-col
            >
          </el-row>
          <br />
          <el-row>
            <el-col :span="12"
              ><div class="grid-content bg-purple-light"><span v-if="tab === 'SQL'">任务类型：SQL</span><span v-if="tab === 'JAR'">任务类型：JAR</span></div></el-col
            >
          </el-row>
        </div>
        <br />
        <div style="padding-left:10px; border-left: 2px solid #3B68B7;">
          <h3>
            <b>安装参数</b>
          </h3>
        </div>
        <div>
          <el-form :model="ruleForm" label-width="127px" class="demo-ruleForm">
            <el-form-item label="提交集群：">
              <el-select v-model="ruleForm.clusterName" disabled popper-class="short-size" size="small" placeholder="请选择" v-for="item in aggregate.typeOptions" :key="item.id">
                <el-option :label="item.clusterName" :value="item.id"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="队列：" prop="queueName">
              <el-select v-model="ruleForm.queueName" popper-class="short-size" size="small" placeholder="请选择" disabled>
                <el-option v-for="item in aggregate.appSpaceIdList" :key="item.queueId" :label="item.queueName" :value="item.queueId"></el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="jm.memory：" v-if="tab === 'JAR'">
              <el-input v-model="ruleForm.jm" readonly></el-input>
            </el-form-item>
            <el-form-item label="tm.memory：">
              <el-input v-model="ruleForm.tm" readonly></el-input>
            </el-form-item>
            <el-form-item label="slot：" v-if="tab === 'JAR'">
              <el-input v-model="ruleForm.slot" readonly></el-input>
            </el-form-item>
            <el-form-item label="trigger.interval：" v-if="tab === 'SQL'">
              <el-input v-model="ruleForm.trigger" readonly></el-input>
            </el-form-item>
            <el-form-item label="checkpoint.interval：" v-if="tab === 'SQL'">
              <el-input v-model="ruleForm.checkpointInterval" readonly></el-input>
            </el-form-item>
            <el-form-item label="state_ttl：" v-if="tab === 'SQL'">
              <el-input v-model="ruleForm.ttl" readonly></el-input>
            </el-form-item>
            <el-form-item label="env.parallelism：">
              <el-input v-model="ruleForm.env" readonly></el-input>
            </el-form-item>
            <el-form-item label="checkpoint：">
              <el-input :value="checkpointShow" readonly></el-input>
            </el-form-item>
            <el-form-item label="高级配置：">
              <textarea class="bottom-contain" v-model="extRunParameter" />
            </el-form-item>
          </el-form>
        </div>
      </div>
      <div v-if="currentSteps == 3" class="last-steps">
        <div class="progress-title-p">
          <div class="progress-title">
            进度：
          </div>
          <div class="progress-title-a"><el-progress :percentage="percentage" :status="exception" :stroke-width="12"></el-progress></div>
        </div>
        <div class="progress-box">
          <div v-for="(item, index) in deployInfoDetailsList" :key="index">
            <div class="progress-box-first">
              <span class="progress-box-span" v-if="getWaiting(item, index) === 'SUCCEED'"><i class="el-icon-circle-check"></i></span>
              <span class="progress-box-span-two" v-if="getWaiting(item, index) === 'loading'"> <a-icon type="loading"></a-icon></span>
              <span class="progress-box-span-three" v-if="getWaiting(item, index) === 'FAIL'"> <i class="el-icon-circle-close"></i></span>
              第{{ index + 1 }}步 类型：{{ item.type }}
            </div>
            <div :class="index == deployInfoDetailsList.length - 1 ? 'progress-box-second' : 'progress-box-line'">
              <span>开始时间：</span>{{ getTime(item.startTime) }} <span>结束时间：</span>{{ item.endTime ? getTime(item.endTime) : '' }} <span>执行结果：</span>
              {{ item.status }}
              <span class="progress-box-span-content">{{ getResultMessage(item.resultMessage) }}</span>
            </div>
          </div>
          <div></div>
        </div>
      </div>
      <template v-slot:footer>
        <div class="g-flex-ac">
          <ndc-button @click="onConfirmfun()" class="cancle">关闭</ndc-button>
          <ndc-button class="g-mr-16" v-if="currentSteps == 2" @click="lastSteps()">上一步</ndc-button>
          <ndc-button class="g-mr-16" theme="primary" v-if="currentSteps != 3" @click="nextSteps()">下一步</ndc-button>
          <ndc-button class="g-mr-16" theme="primary" v-if="currentSteps == 3" @click="onConfirmfun()" :disabled="isDisabled">确定</ndc-button>
        </div>
      </template>
    </ndc-modal>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop } from 'vue-property-decorator'
import ModalMixin from './mixin'
import { ITag } from '@utils/types'
import MStepsModals from '@views/develop/components/steps/index.vue'
import Axios from 'axios'
let clearSettimeOut: any
let clearSettime: any
let clearSettimes: any
@Component({
  components: {
    MStepsModals
  }
})
export default class MDeployment extends Mixins(ModalMixin) {
  private currentSteps: number = 1
  private product: string = ''
  private userid: string = ''
  private jobId: string = ''
  private aggregate: any = {
    typeOptions: [],
    checkpointsList: [],
    appSpaceIdList: []
  }
  private checkpointShow: string = ''
  private showListup: boolean = true
  private showListdown: boolean = false
  private spaceName: string = ''
  private percentage: number = 0
  private exception: string = 'exception'
  private deployInfoDetailsList: any[] = []
  private waiting: boolean = false
  private overTime: number = 0
  private tab: string = ''
  private extRunParameter: string = ''
  private isDisabled: boolean = true
  private appSpaceId: string = ''
  private showInformation:boolean=false
  private ruleForm: any = {
    clusterName: '',
    tm: '',
    trigger: '',
    checkpointInterval: '',
    ttl: '',
    env: '',
    checkoutpoint: '',
    jm: '',
    slot: '',
    queueName: ''
  }
  private rules: any = {
    clusterName: [
      {
        required: true,
        message: '请输入提交集群'
      }
    ],
    jm: [
      { required: true, message: '请输入jm.memory' },
      { pattern: /^[0-9]*$/, message: 'jm.memory是Number格式' }
    ],
    slot: [
      { required: true, message: '请输入slot' },
      { pattern: /^[0-9]*$/, message: 'slot是Number格式' }
    ],
    tm: [
      { required: true, message: '请输入tm.memory' },
      { pattern: /^[0-9]*$/, message: 'tm.memory是Number格式' }
    ],
    trigger: [
      { required: true, message: '请输入trigger.interval' },
      { pattern: /^[0-9]*$/, message: 'trigger.interval是Number格式' }
    ],
    checkpointInterval: [
      { required: true, message: '请输入checkpointInterval' },
      { pattern: /^[0-9]*$/, message: 'checkpointInterval是Number格式' }
    ],
    ttl: [
      { required: true, message: '请输入state_ttl' },
      { pattern: /^[0-9]*$/, message: 'state_ttl是Number格式' }
    ],
    env: [
      { required: true, message: '请输入env.parallelism' },
      { pattern: /^[0-9]*$/, message: 'env.parallelism是Number格式' }
    ],
    queueName: [{ required: true, message: '请在项目设置中绑定指南针系统，否则无法选择有权限资源队列' }]
  }

  private typeOptions: any[] = [
    {
      key: 'ALL',
      label: 'ALL'
    },
    {
      key: 'SQL',
      label: 'SQL'
    },
    {
      key: 'JAR',
      label: 'JAR'
    }
  ]
  private taskType: string = 'ALL'
  // 运行参数点击class
  private showListupFun() {
    this.showListup = !this.showListup
    this.showListdown = false
  }
  // 高级配置点击
  private showListdownFun() {
    this.showListdown = !this.showListdown
    this.showListup = false
  }
  // 下一步
  private nextSteps() {
    this.isDisabled = true
    if (this.currentSteps === 1) {
      ;(this.$refs['ruleForm'] as any).validate(valid => {
        if (valid) {
          if (this.aggregate.checkpointsList.length !== 0) {
            this.aggregate.checkpointsList.map(item => {
              if (item.pathSuffix === this.ruleForm.checkoutpoint) {
                let temp = item.pathSuffix && item.pathSuffix.split('flink-checkpoints/')
                this.checkpointShow = `${item.modificationTime ? item.modificationTime : ''},${temp[1]}`
              }
            })
          }
          this.currentSteps = this.currentSteps + 1
        }
      })
    } else {
      let runParameter: any
      if (this.tab === 'SQL') {
        runParameter = {
          checkpointInterval: this.ruleForm.checkpointInterval,
          'env.parallelism': this.ruleForm.env,
          state_ttl: this.ruleForm.ttl,
          'tm.memory': this.ruleForm.tm,
          'trigger.interval': this.ruleForm.trigger
        }
      } else {
        runParameter = {
          parallelism: this.ruleForm.env,
          slot: this.ruleForm.slot,
          'tm.memory': this.ruleForm.tm,
          'jm.memory': this.ruleForm.jm
        }
      }
      this.currentSteps = this.currentSteps + 1
      this.exception = 'exception'
      this.percentage = 0
      const that = this
      clearSettimes = window.setInterval(() => {
        if (that.percentage < 25) {
          that.percentage += 1
        }
      }, 500)
      this.$request('getdeploy', {
        checkpoint: this.ruleForm.checkoutpoint,
        clusterId: this.ruleForm.clusterName,
        queueId: this.ruleForm.queueName,
        description: '',
        extRunParameter: this.extRunParameter,
        jobId: this.jobId,
        projectId: this.product,
        runParameter,
        userId: this.userid,
        appSpaceId: this.appSpaceId,
        action: 'DEBUG'
      }).then(ress => {
        clearInterval(clearSettimes)
        this.percentage = 25
        this.overTime = new Date().getTime()
        if (ress && ress.code == 200) {
          this.getStepsLog(ress.data)
        }
      })
    }
  }
  // 是否展示waiting图标
  private getWaiting(item, index) {
    let waiting = 'loading'
    if (item.status === 'SUCCEED') {
      waiting = 'SUCCEED'
    }
    if (item.status === 'FAIL') {
      waiting = 'FAIL'
    }
    return waiting
  }

  // 开始时间格式化
  private getTime(time) {
    return new Date(+new Date(time) + 8 * 3600 * 1000)
      .toISOString()
      .replace(/T/g, ' ')
      .replace(/\.[\d]{3}Z/, '')
  }
  // 日志后面的url去掉
  private getResultMessage(time) {
    let temp = []
    if (time) {
      temp = time.split('#$$url$$#')[0]
    }

    return temp
  }
  // 获取日志
  private async getStepsLog(param) {
    const temp = param
    const that = this
    await Axios.get(`/HTAI/v2/api/htds_dsw/deploy_service/deploy/${temp}`, {}).then(datas => {
      clearSettime = setInterval(() => {
        if (that.percentage >= 25 && that.percentage < 75) {
          that.percentage += 1
        }
      }, 1000)
      const { data } = datas
      this.deployInfoDetailsList = data.deployInfoDetailsList
      const time = new Date().getTime()
      if (data.status == 'RUNNING' || data.status == 'WAITING') {
        if (time - this.overTime > 6000000) {
          clearInterval(clearSettime)
          clearTimeout(clearSettimeOut)
          this.waiting = true
          this.$message.error('安装超时！')
        } else {
          const that = this
          clearSettimeOut = setTimeout(() => {
            that.getStepsLog(temp)
          }, 2000)
        }
      } else {
        this.isDisabled = false
        clearInterval(clearSettime)
        clearTimeout(clearSettimeOut)
        if (data.status == 'FAIL') {
          this.$ndcmessage.error('啊哦，安装失败！')
          this.percentage = 75
        } else if (data.status == 'SUCCEED') {
          this.percentage = 100
          this.exception = 'success'
          this.$ndcmessage.success('恭喜，安装完成！')
        }
      }
    })
  }

  // 最后一步
  private lastSteps() {
    this.currentSteps = this.currentSteps - 1
  }
  // chekpoint拼接
  private getitem(item) {
    let temp = item.pathSuffix && item.pathSuffix.split('flink-checkpoints/')
    let checkpointShow = `${item.modificationTime ? item.modificationTime : ''},${temp[1]}`
    return checkpointShow
  }

  // 弹框展示时
  public async show(data: any, callback?: any) {
    this.currentSteps = 1
    this.tab = data.tabs
    this.product = localStorage.getItem('sloth_projectId') || ''
    this.userid = localStorage.getItem('tm_user_no') || ''
    this.spaceName = localStorage.getItem('sloth_projectName') || ''
    this.jobId = localStorage.getItem('sloth_activetab') || ''
    this.percentage = 0
    this.deployInfoDetailsList.length = 0
    this.showListup = true
    this.extRunParameter = ''
    this.ruleForm.checkoutpoint = ''
    this.showListdown = false
    this.checkpointShow = ''
    clearInterval(clearSettime)
    this.showModal(data, callback)
    try {
      await // 获取提交集群
      this.$request('getclusters', {
        userId: this.userid,
        product: this.product
      }).then(res => {
        if (res.length) {
          this.aggregate.typeOptions = res || []
          this.ruleForm.clusterName = res[0].id
        }
      })

      await Axios.get(`/HTAI/v2/api/portal/api/infra/project-management/v1/projectInfo`, {
        params: {
          projectId: this.product
        }
      }).then(res => {
        const { data } = res
        this.appSpaceId = data.result[0].compassId || ''
        if (this.appSpaceId) {
          this.showInformation=false
          this.$request('getPaasClusterQueue', {
            userId: this.userid,
            appSpaceId: this.appSpaceId
          }).then(res => {
            if (res.queue.length) {
              this.aggregate.appSpaceIdList = res.queue || []
              this.ruleForm.queueName = res.queue[0].queueId
            }
          })
        }else{
          this.showInformation=true
        }
      })
      // 获取安装参数
      await this.$request('getparameter', {
        projectId: this.product,
        action: 'DEBUG',
        jobId: this.jobId
      }).then(res => {
        if (res) {
          if (data.tabs === 'SQL') {
            this.extRunParameter = res.extRunParameter
            this.ruleForm.checkpointInterval = res.runParameter.checkpointInterval
            this.ruleForm.tm = res.runParameter['tm.memory']
            this.ruleForm.trigger = res.runParameter['trigger.interval']
            this.ruleForm.ttl = res.runParameter.state_ttl
            this.ruleForm.env = res.runParameter['env.parallelism']
          } else {
            this.extRunParameter = res.extRunParameter
            this.ruleForm.jm = res.runParameter['jm.memory']
            this.ruleForm.tm = res.runParameter['tm.memory']
            this.ruleForm.slot = res.runParameter.slot
            this.ruleForm.env = res.runParameter.parallelism
          }
        }
      })
      // 获取checkpoint
      this.$request('getcheckpoints', {
        jobId: this.jobId
      }).then(res => {
        this.aggregate.checkpointsList = res || []
      })
      return true
    } catch (e) {
      // this.modalInstance  && this.modalInstance.setError(e.message)
    }
  }
  // 点击确定时
  public async onConfirmfun() {
    this.onHide()
    clearInterval(clearSettimes)
    clearInterval(clearSettime)
    // this.percentage = 0
    // this.exception = 'exception'
    // this.deployInfoDetailsList.length = 0
    // this.overTime = 0
  }
}
</script>

<style lang="scss">
.deploy-steps {
  .form-style {
    padding-left: 100px;
  }
  .g-flex-ac {
    justify-content: flex-end;
    margin-right: 14px;
    .cancle {
      margin-right: 20px;
    }
  }
  /deep/ .ndc-modal-main {
    .ndc-modal-header {
      height: 40px;
      background: #eeeeee;
      border-radius: 4px 4px 0px 0px;
      padding: unset;
      .content {
        span {
          margin-left: 20px;
          font-size: 16px;
          line-height: 16px;
          font-family: MicrosoftYaHei;
          color: #152038;
        }
        .ndc-icon-close {
          &::before {
            font-size: 8px;
            margin-right: 17px;
          }
        }
      }
    }
    top: 20px !important;
    .ndc-modal-footer {
      padding: 16px 10px 24px 40px;
      margin-top: 40px;
      .ndc-button {
        min-width: 60px;
      }
    }
  }
  .ndc-modal-footer {
    position: relative;
    bottom: 30px;
  }
  .el-form-item__label {
    padding: 0px;
  }
  .second-steps-style {
    margin-top: 20px;
    .back-hide {
      width: 86%;
      height: 20px;
      background-color: #f7f7f7;
      cursor: pointer;
      font-weight: bold;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
    }
    .text-informatiom {
      position: absolute;
      top: 30px;
      font-size: 12px;
      color: #f56c6c;
    }
    .hisdeform {
      padding-left: 20px;
      img {
        width: 16px;
        height: 16px;
        margin-left: 10px;
      }
      input,
      select {
        height: 32px;
      }

      .el-form-item {
        margin-bottom: 15px;
      }
      /deep/ .el-form-item__label:before{
        position: relative;
        top: 2px;
        color: #ff0000;
      }
      .el-input {
        width: 68%;
      }
      .el-select {
        width: 100%;
      }

      .questionTipLast {
        position: absolute;
        top: 12px;
        right: 173px;
      }
    }

    .bottom-contain {
      display: flex;
      margin-left: 131px;
      span {
        padding-top: 7px;
      }
      .texthight {
        width: 420px;
        height: 300px;
        border-color: #d9d9d9;
        padding: 5px;
      }
    }
  }

  .thired-steps {
    margin-top: 20px;
    b {
      font-weight: bold;
    }
    .bottom-contain {
      width: 470px;
      border-color: #d9d9d9;
      height: 110px;
      padding: 5px;
      line-height: 20px;
    }
    .el-form-item {
      margin-bottom: 5px;
    }
    .el-select,
    .el-input {
      width: 470px;
    }
    input {
      height: 32px;
    }
  }
  .last-steps {
    padding-top: 20px;
    .progress-title-p {
      display: flex;
      margin-bottom: 20px;
      width: 104%;
      .progress-title-a {
        width: 95%;
      }
    }
    .progress-box {
      height: 520px;
      border: 1px solid #d2d7e0;
      // background-color: #eee;
      padding: 20px 40px;
      overflow-y: scroll;
      overflow-wrap: break-word;
      .progress-box-first {
        font-size: 16px;
        line-height: 30px;
        height: 30px;
        display: flex;
        .progress-box-span {
          color: #52c41a;
          font-size: 30px;
          margin-left: 10px;
          margin-right: 10px;
        }
        .progress-box-span-two {
          color: #3b68b7;
          font-size: 30px;
          margin-left: 10px;
          margin-right: 10px;
        }
        .progress-box-span-three {
          color: #f56c6c;
          font-size: 30px;
          margin-left: 10px;
          margin-right: 10px;
        }
      }
      .progress-box-second {
        margin: 0px 20px 10px 51px;
        color: rgba(0, 0, 0, 0.45);
      }
      .progress-box-line {
        margin: 4px 20px 11px 22px;
        color: rgba(0, 0, 0, 0.45);
        position: relative;
        padding-left: 25px;
        padding-bottom: 5px;
        border-left: 1px solid rgb(59, 104, 183);
      }
      .progress-box-span-content {
        word-break: break-all;
        white-space: pre-line;
      }
    }
  }
}
.short-size {
  width: 410px !important;
  min-width: 420px !important;
}
</style>

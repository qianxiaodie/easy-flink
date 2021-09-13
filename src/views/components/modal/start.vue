<template>
  <ndc-modal
    class="m-start-modal ndc-message-box"
    :width="800"
    :visible="visible"
    @hide="onHide"
    :header-line="false"
    :footer-line="false"
  >
    <template>
      <div class="ndc-mbox">
        <div class="ndc-mbox-left">
          <i class="ndc-mbox-icon ndc-icon-warn"></i>
        </div>
        <div class="ndc-mbox-right">
          <div class="ndc-mbox-content">确认要启动该任务吗？</div>
          <div class="ndc-mbox-desc" style="display:flex">
            <div style="width:120px;text-align:right;margin-right: 20px;">任务名称：</div>
            {{modalData.jobName}}
          </div>
          <ndc-form>
            <ndc-form-item v-if="isPass" label="关联上线申请：" required>
              <u-validator name="tickets" :validate="errors">
                <div class="ndc-mbox-desc" style="display:flex;align-items: center;">
                  <!-- 关联上线申请： -->
                  <!-- <a-select label-in-value style="width: 250px" v-model="tickets" @change="applychange">
              <a-select-option
                v-for="(item,index) in ticketlist"
                :key="index"
                :value="item.name"
              >{{item.name}} ({{item.createDate}})</a-select-option>
                  </a-select>-->
                  <ndc-select
                    name="tickets"
                    placeholder="请选择门票"
                    style="width:250px"
                    value-key="name"
                    label-key="name"
                    :options="ticketlist"
                    v-model="tickets"
                    @change="ticketsonchange"
                    v-validate="{
                    required: '上线申请'
                  }"
                  ></ndc-select>&nbsp;&nbsp;如果没有有效的上线申请，
                  <ndc-table-link @click="handleToApplyClick()">请前往申请</ndc-table-link>
                </div>
              </u-validator>
            </ndc-form-item>
            <ndc-form-item v-if="showApplyres" label="紧急上线理由：" required>
              <u-validator name="deployresult" :validate="errors">
                <div class="ndc-mbox-desc" style="display:flex;align-items: center;">
                  <a-textarea
                    :placeholder="placeholder"
                    name="deployresult"
                    :auto-size="{ minRows: 2, maxRows: 5}"
                    style="width: 500px"
                    v-maxlength="200"
                    v-model="deployresult"
                    v-validate="{
                    required: '紧急上线理由'
                  }"
                  />
                  <img
                    class="questionTip"
                    @mouseover="onMouseover"
                    @mouseout="onMouseout"
                    src="@/assets/images/wenhao.svg"
                  />
                  <div
                    class="el-tooltip__popper is-dark"
                    style="right: -20px;top: -15px;"
                    v-show="down"
                  >
                    周一至周五（08点-16点）为紧急上线时间，请输入上线理由用于留痕
                    <div class="popperdown"></div>
                  </div>
                  <!-- </el-tooltip> -->
                </div>
              </u-validator>
            </ndc-form-item>
          </ndc-form>
        </div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="g-flex-ac" style="flex-direction: row-reverse;">
        <ndc-button @click="onHide">取消</ndc-button>
        <ndc-button class="g-mr-16" theme="primary" :disabled="starting" @click="start">确定</ndc-button>
      </div>
    </template>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import ModalMixin from './mixin'
import Axios from 'axios'

@Component
export default class MStartModal extends Mixins(ModalMixin) {
  private starting: boolean = false
  private tickets: any = ''
  private jobparams: any = {}
  private appSpaceId: string = '' //指南针id

  private ticketlist: any[] = [
    {
      createDate: '2021-09-01 10:42:00',
      name: '实时开发上线申请测试',
      endTime: '2021-09-03 14:22:00',
      createBy: '015322',
      id: '7230da0375624874ba7dd103b4011413'
    }
  ]
  // private ticketlist: any = []
  private isApply: boolean = false
  private showApplyres: boolean = false
  private isPass: boolean = true //白名单 不是白名单/uat 页面展示
  private placeholder: string = ''
  private deployresult: string = ''
  private down: boolean = false

  public async show(data: any, callback?: any) {
    console.log(data, 'startdata')
    this.jobparams = data
    this.showApplyres = false
    this.isPass = true
    this.starting = false
    this.deployresult = ''
    this.tickets = ''
    this.showModal(data, callback)
    this.$nextTick(() => {
      this.errors.clear()
    })
    // let passres = await this.$request('getConfigParam', { projectId: data.projectId })
    // this.isPass = this.isPrd() && passres !== 'true'

    // if (this.getDate() && this.isPass) {
    //能打开必定不是白名单和prd
    if (this.getDate()) {
      //是开市时间 紧急上线
      let res = await this.$request('getJobDeployState', {
        //查询是否可以上线
        jobId: data.jobId
      })
      console.log(res, 'State')
      // depolyState是false当前任务不可紧急上线，提醒用户。返回true当前任务可以紧急上线展示上次申请原因applyReason
      // this.showApplyres = true
      this.isApply = true
      if (!res.depolyState) {
        this.placeholder = '请填写紧急上线理由'
      }
      this.deployresult = res.applyReason
      await this.queryDeployToken(data.projectId) //获取门票
      await this.getOneProjectInfo(data.projectId) //获取指南针id
    } else {
      this.isApply = false
    }

    console.log(this.isPass, this.isApply, this.isPrd(), 'pass')
  }

  private getDate() {
    var now = new Date()
    var day = now.getDay()
    var weeks = new Array('星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六')
    var flagweek = ['星期日', '星期六']
    var week = weeks[day]
    var h = now.getHours()

    if (flagweek.indexOf(week) == -1 && h > 16 && h < 22) {
      return true
    } else {
      return false
    }
    console.log(week, now, h, 'date')
  }

  private handleToApplyClick() {
    //?name=实时开发&projectId=16833b9c7eff42759cf497a982ab1689&spaceId=386739b8440e463d99dc5cf093a51e21&spaceName=实时开发测试空间
    window.open(`/HTAI/v2/#/htds_dsw/product/apply?projectId=${this.jobparams.projectId}&spaceId=${this.jobparams.spaceId}&pop=true`)
    // window.open(`/HTAI/v2/#/htds_dsw/apply?projectId=${this.jobparams.projectId}&spaceId=${this.jobparams.spaceId}&pop=true`)
  }

  private async queryDeployToken(data) {
    //获取门票
    await Axios.get(`/HTAI/v2/api/htds_dsw/deploy_service/deploy_token/all?project_id=${data}&status=valid`, {
      headers: { API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9' }
    })
      .then(res => {
        console.log(res)
        this.ticketlist = res.data
      })
      .catch(err => {
        console.log(err)
      })
  }

  private async getOneProjectInfo(data) {
    await Axios.get(`/HTAI/v2/api/portal/api/infra/project-management/v1/projectInfo?projectId=${data}`, {
      headers: { API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9' }
    })
      .then(res => {
        this.appSpaceId = res.data.result[0].compassId || ''
        console.log(res, res.data, this.appSpaceId)
      })
      .catch(err => {
        console.log(err)
      })
  }

  private ticketsonchange() {
    this.showApplyres = this.getDate() && true
  }

  private async start() {
    const ticketsparams = this.ticketlist.find(l => l.name == this.tickets) || {}
    let params = {}
    var time = ticketsparams.endTime
    // var time = '2021-09-03 14:22:00'
    var times = new Date(time).getTime()
    var hour = times - new Date().getTime()
    var expires = Math.ceil(hour / (3600 * 1000))
    console.log(expires)
    if (this.isApply && this.isPass) {
      //是紧急上线
      params = {
        applyId: ticketsparams.id, //门票工单id
        appSpaceId: this.appSpaceId, //指南针id
        expires: expires, //门票有效时间
        applyUser: ticketsparams.createBy, //申请人
        applyReason: this.deployresult, //紧急上线申请原因
        isApply: this.isApply
      }
    } else {
      params = {
        isApply: this.isApply
      }
    }

    console.log(this.isApply, ticketsparams, params, 'params')

    this.starting = true
    const result = await this.onConfirm(params)
    result && this.onHide()
    this.starting = false
  }

  private onMouseover() {
    this.down = true
  }
  private onMouseout() {
    setTimeout(() => {
      if (this.down) {
        this.down = false
      }
    }, 1000)
  }
}
</script>

<style lang="scss">
.m-start-modal {
  &.ndc-message-box {
    .ndc-mbox {
      padding-bottom: 24px;
    }
    .ndc-select {
      width: 400px;
    }
    .ndc-mbox-desc {
      line-height: 40px;
      color: #262626;
      &.checkpoint {
        margin-top: 0;
      }
    }
    .popperdown {
      position: absolute;
      bottom: -4px;
      // left: 50%;
      // right: 85px;
      right: 65px;
      border-top: solid 4px #303133;
      border-left: transparent 3px solid;
      border-right: transparent 3px solid;
    }
    .ndc-modal-main {
      .ndc-modal-footer {
        padding: 0 24px 24px 24px;
      }
      .m-modal-error {
        // max-width: 180px;
        color: #f04346;
        margin-left: 5px;
      }
    }
    .ndc-form-item .label {
      width: 0;
      padding-right: 0;
    }
    .ndc-form-item {
      // align-items: center;
      .questionTip {
        position: absolute;
        top: 25px;
        // right: 60px;
        right: 45px;
      }
    }

    .ndc-form-item .label-2 {
      width: 120px;
      padding-left: 20px;
      color: #262626;
      line-height: 58px;
    }
  }
  .g-text-link {
    color: #3b68b7;
    cursor: pointer;
  }
}
</style>

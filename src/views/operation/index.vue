<template>
  <div style="width:100%;height:100%;overflow:hidden">
    <div @click="hideJobDetail" v-if="detailVisible" class="m-operation-back">
      <img src="../../assets/lanhuicons/返回-2.png" alt />
      <span>返回</span>
    </div>
    <div class="m-operation">
      <div class="m-operation-list" :class="{'border': detailVisible}" :style="listStyle">
        <m-operation-list
          :opuserRule="opuserRule"
          :filterspace="filterspace"
          :filterproject="filterproject"
          :filtercluster="filtercluster"
          :job-status="jobStatus"
          :keyword="keyword"
          :runtime-status="runtimeStatus"
          ref="list"
          :is-admin="isAdmin"
          :selected-job-id="selected"
          :is-simple="detailVisible"
          :starting="starting"
          :stoping="stoping"
        ></m-operation-list>
      </div>
      <div
        v-show="detailVisible"
        class="m-operation-line"
        :class="{'active': lineVisible}"
        :style="lineStyle"
        @mousedown="onMouseDown"
      >
        <img src="../../assets/images/slide.svg" />
      </div>
      <div class="m-operation-detail" v-if="detailVisible">
        <m-operation-detail
          ref="detail"
          :job-detail="jobDetail"
          :starting="starting"
          :stoping="stoping"
        ></m-operation-detail>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop, Inject, Watch } from 'vue-property-decorator'
import { Action, State, Mutation } from 'vuex-class'

import MOperationList from './components/list/index.vue'
import MOperationDetail from './components/detail/index.vue'

import { MODULE_NAMESPACE } from '@utils/constant'
import { IJob, IProduct, IElkLog } from '@utils/types'
import ModalMixin from '../components/modal/mixin'
import { MODAL_TYPE } from '../components/modal/constant'
import Bus from '@/bus'
import { trackEvent } from '@/utils/trackEvent'

@Component({
  components: {
    MOperationList,
    MOperationDetail
  }
})
export default class Operation extends Vue {
  @Prop({
    default: false
  })
  private isAdmin!: boolean

  @Prop({
    default: ''
  })
  private jobStatus!: string

  @Prop({
    default: ''
  })
  private keyword!: string

  @Prop({
    default: ''
  })
  private runtimeStatus!: string

  @Prop({
    default: ''
  })
  private filtercluster!: string

  @Prop({
    default: ''
  })
  private opuserRule!: any

  @Prop({
    default: ''
  })
  private filterproject!: string

  @Prop({
    default: ''
  })
  private filterspace!: string

  @Watch('opuserRule')
  private onopuserRuleChanged(val: any) {
    // console.log(val,'rule change fu')
  }

  @State('product', MODULE_NAMESPACE.global)
  private product!: string

  @State('productList', MODULE_NAMESPACE.global)
  private productList!: IProduct[]

  @State('userId', MODULE_NAMESPACE.global)
  private userId!: string

  @Mutation('SET_PRODUCT', MODULE_NAMESPACE.global)
  private setProject: any

  @Provide()
  private operation = this

  private jobId: number | null = null
  private jobDetail: IJob = {} as IJob
  private selected: number = -1
  private detailVisible: boolean = false
  private lineVisible: boolean = false
  private listWidth: number = 350
  private recoverModalInstance: ModalMixin | null = null
  private startModalInstance: ModalMixin | null = null
  private starting: number[] = []
  private stoping: number[] = []
  private timer: number | null = null

  private get listStyle() {
    const width = this.listWidth + 'px'
    return {
      width: this.detailVisible ? width : '100%',
      flexShrink: 0
    }
  }

  private get lineStyle() {
    return {
      left: this.listWidth + 'px'
    }
  }

  public async showJobDetail(jobId: number, active) {
    try {
      this.jobId = jobId

      await this.getJobDetail()

      this.timer && clearInterval(this.timer)
      this.timer = setInterval(this.getJobDetail, 5000)

      if (!this.detailVisible) {
        this.detailVisible = true
        this.$emit('Visible', this.detailVisible)
        this.$nextTick(() => {
          setTimeout(() => {
            const detail = this.$refs.detail as MOperationDetail
            if (active) {
              detail && detail.setActiveTab('alarm')
              console.log('setActive alarm')
            } else {
              detail && detail.setActiveTab('info')
              // console.log('setActive info');
            }
            // if(window.location.href.indexOf('alarm')!=-1){
            //   detail && detail.setActiveTab('alarm');
            //   console.log('setActive alarm')
            // }else{
            //   detail && detail.setActiveTab('info');
            //   console.log('setActive info')
            // }
          }, 300)
        })
      } else {
        const detail = this.$refs.detail as MOperationDetail
        detail && detail.refresh()
      }
    } catch (e) {
      this.$handleException(e, '获取任务详情失败')
    }
  }

  public hideJobDetail() {
    this.detailVisible = false
    this.$emit('Visible', this.detailVisible)

    this.timer && clearInterval(this.timer)
    this.timer = null
    const list = this.$refs.list as MOperationList
    list && list.clearSelected()
    // window.location.href=`${window.location.origin}${window.location.pathname}#/sloth_opera`
    window.location.href = `${window.location.origin}${window.location.pathname}#/oms/onlineDevelop/operation`
    // this.$router.push({
    //   name: 'Operation'
    // });
  }

  private async mounted() {}
  private async created() {
    console.log(this.opuserRule, 'operations rule')

    try {
      if (this.isAdmin) {
        return
      }

      // let query:any = {};
      // const url:any = window.location.href.split("?")[1];
      // const urlarr = url.split("&")
      // urlarr.forEach(v=>{
      //   query[v.split("=")[0]] = v.split('=')[1]
      // })
      // const product: string = query.product;
      // if (product && product !== this.product) {
      //   const p = (this.productList || []).find(p => p.product === product);
      //   if (p) {
      //     this.setProject(p);
      //     // 项目切换时，清空缓存的任务列表
      //     localStorage.removeItem('sloth_tabs');
      //     localStorage.removeItem('sloth_activetab');
      //   }
      // }
      const params: any = {
        pageSize: 25,
        pageNo: 1,
        order: 'desc',
        orderBy: 'startTime'
      }

      // const { from = '' } = this.$route.params || {};
      const from = {}
      if (from === 'develop') {
        const arr = (this.userId || '').split('@')
        params.creator = arr.length ? arr[0] : ''
        params.orderBy = 'deployTime'
        this.$nextTick(() => {
          Bus.$emit('job_list_init')
        })
      }
      await this.getTagList()
      const result = await this.getOperationJobList(params)
      Bus.$emit('job_list_refresh', result)
      // 与normal-list逻辑重复
      // const jobId = (query.jobId && Number(query.jobId)) || -1;
      // if (jobId !== -1) {
      //   this.showJobDetail(jobId, '');
      //   this.selected = jobId;
      //   console.log('selected',this.selected)

      // }
    } catch (e) {
      this.$handleException(e)
    }
  }

  private beforeDestroy() {
    this.recoverModalInstance && this.recoverModalInstance.hide()
    this.recoverModalInstance = null
    this.startModalInstance && this.startModalInstance.hide()
    this.startModalInstance = null
    this.timer && clearInterval(this.timer)
    this.timer = null
  }

  @Action('getOperationJobList', MODULE_NAMESPACE.operation)
  private getOperationJobList!: any

  @Action('getTagList', MODULE_NAMESPACE.develop)
  private getTagList!: any

  private async getJobDetail() {
    this.jobDetail = await this.$request('getOperationJobDetail', {
      jobId: this.jobId
    })
  }

  private async refresh(isDetail: boolean) {
    const promiseArr = [this.refreshList()]
    if (isDetail) {
      promiseArr.push(this.getJobDetail())
    }
    return Promise.all(promiseArr)
  }

  private async refreshList() {
    const list = this.$refs.list as MOperationList
    return list && list.refresh()
  }

  public recover(job: IJob, isDetail: boolean = false) {
    if (!this.recoverModalInstance) {
      this.recoverModalInstance = this.$createModalInstance(MODAL_TYPE.recover)
    }
    this.recoverModalInstance &&
      this.recoverModalInstance.show(
        {
          jobName: job.jobName,
          jobId: job.jobId,
          name: this.filterproject,
          projectId: this.filterproject,
          spaceId: this.filterspace
        },
        async (args: any) => {
          try {
            // applyId: this.ticketsparams.id, //门票工单id
            // appSpaceId: this.appSpaceId,//指南针id
            // expires:this.ticketsparams.endTime, //门票有效时间
            // applyUser:this.ticketsparams.createBy, //申请人
            // applyReason:this.deployresult, //紧急上线申请原因
            await this.$request('operateJob', {
              jobId: job.jobId,
              op: 'HTSTART',
              keepState: args.keepState,
              cpkPath: args.cpkPath,
              applyId: args.applyId, //门票工单id
              appSpaceId: args.appSpaceId, //指南针id
              expires: args.expires, //门票有效时间
              applyUser: args.applyUser, //申请人
              applyReason: args.applyReason, //紧急上线申请原因
              isApply: args.isApply
            })
            // if (res.code == 200) {
            //   this.$ndcmessage.success('')
            // }

            trackEvent({ btn_title: '恢复任务按钮', btn_id: 'recoverbtn', page_id: '/HTAI/v2/#/oms/onlineDevelop', page_title: '运维监控_实时开发' }, 'btn_click')
            await this.refresh(isDetail)

            return true
          } catch (e) {
            this.recoverModalInstance && this.recoverModalInstance.setError(e.message)
          }
        }
      )
  }

  private isPrd() {
    const arr = ['env', 'sit', 'prd']
    // return false
    if (arr.indexOf((window as any).prduct_env) !== -1) {
      return true
    } else {
      return false
    }
  }

  public async start(job: IJob, isDetail: boolean = false) {
    let passres = await this.$request('getConfigParam', { projectId: job.product })
    console.log(this.isPrd(), passres, 'this.isPrd()')
    if (!this.isPrd() || passres == 'true') {
      this.startpass(job)
    } else {
      if (!this.startModalInstance) {
        this.startModalInstance = this.$createModalInstance(MODAL_TYPE.start)
      }
      this.startModalInstance &&
        this.startModalInstance.show(
          {
            jobName: job.jobName,
            jobId: job.jobId,
            name: this.filterproject,
            projectId: this.filterproject,
            spaceId: this.filterspace
          },
          async (args: any) => {
            try {
              // applyId: this.ticketsparams.id, //门票工单id
              // appSpaceId: this.appSpaceId,//指南针id
              // expires:this.ticketsparams.endTime, //门票有效时间
              // applyUser:this.ticketsparams.createBy, //申请人
              // applyReason:this.deployresult, //紧急上线申请原因
              const index = this.starting.findIndex(s => s === job.jobId)
              index === -1 && this.starting.push(job.jobId)
              await this.$request('operateJob', {
                jobId: job.jobId,
                op: 'HTSTART',
                cpkPath: args.cpkPath,
                applyId: args.applyId, //门票工单id
                appSpaceId: args.appSpaceId, //指南针id
                expires: args.expires, //门票有效时间
                applyUser: args.applyUser, //申请人
                applyReason: args.applyReason, //紧急上线申请原因
                isApply: args.isApply
              })
              trackEvent({ btn_title: '启动任务按钮', btn_id: 'startbtn', page_id: '/HTAI/v2/#/oms/onlineDevelop', page_title: '运维监控_实时开发' }, 'btn_click')
              await this.refresh(isDetail)

              return true
            } catch (e) {
              this.startModalInstance && this.startModalInstance.setError(e.message)
            } finally {
              const index = this.starting.findIndex(s => s === job.jobId)
              index !== -1 && this.starting.splice(index, 1)
            }
          }
        )
    }
  }

  public startpass(job: IJob, isDetail: boolean = false) {
    this.$ndcconfirm({
      content: '确认要启动该任务吗？',
      desc: `任务名称：${job.jobName}`,
      onConfirm: async () => {
        try {
          const index = this.starting.findIndex(s => s === job.jobId)
          index === -1 && this.starting.push(job.jobId)
          await this.$request('operateJob', {
            jobId: job.jobId,
            op: 'HTSTART'
          })
          trackEvent({ btn_title: '启动任务按钮', btn_id: 'startbtn', page_id: '/HTAI/v2/#/oms/onlineDevelop', page_title: '运维监控_实时开发' }, 'btn_click')
          await this.refresh(isDetail)
        } catch (e) {
          this.$handleException(e)
        } finally {
          const index = this.starting.findIndex(s => s === job.jobId)
          index !== -1 && this.starting.splice(index, 1)
        }
      }
    })
  }

  public stop(job: IJob, isDetail: boolean = false) {
    this.$ndcconfirm({
      content: '确认要停止该任务吗？',
      desc: `任务名称：${job.jobName}`,
      onConfirm: async () => {
        try {
          const index = this.stoping.findIndex(s => s === job.jobId)
          index === -1 && this.stoping.push(job.jobId)
          await this.$request('operateJob', {
            jobId: job.jobId,
            op: 'HTSTOP'
          })
          trackEvent({ btn_title: '停止任务按钮', btn_id: 'stopbtn', page_id: '/HTAI/v2/#/oms/onlineDevelop', page_title: '运维监控_实时开发' }, 'btn_click')
          await this.refresh(isDetail)
        } catch (e) {
          this.$handleException(e)
        } finally {
          const index = this.stoping.findIndex(s => s === job.jobId)
          index !== -1 && this.stoping.splice(index, 1)
        }
      }
    })
  }

  public down(job: IJob) {
    this.$ndcconfirm({
      content: '确认要下线该任务吗？',
      desc: `任务名称：${job.jobName}`,
      onConfirm: async () => {
        try {
          await this.$request('operateJob', {
            jobId: job.jobId,
            op: 'HTGOOFFLINE'
          })
          trackEvent({ btn_title: '下线任务按钮', btn_id: 'downbtn', page_id: '/HTAI/v2/#/oms/onlineDevelop', page_title: '运维监控_实时开发' }, 'btn_click')
          await this.refreshList()
        } catch (e) {
          this.$handleException(e)
        }
      }
    })
  }

  private onMouseDown(e: MouseEvent) {
    e.preventDefault()
    this.lineVisible = true
    console.log('dianji ')
    document.addEventListener('mouseup', this.onMouseUp)
    document.addEventListener('mousemove', this.onMouseMove)
  }

  private onMouseUp(e: MouseEvent) {
    e.preventDefault()
    this.lineVisible = false
    this.$nextTick(() => {
      const detail = this.$refs.detail as MOperationDetail
      detail && detail.resize()
    })
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  private onMouseMove(e: MouseEvent) {
    e.preventDefault()
    const clientX = e.clientX
    const elWidth = this.$el.clientWidth
    this.listWidth = clientX < 350 ? 350 : clientX > Math.ceil(elWidth * 0.4) ? Math.ceil(elWidth * 0.4) : clientX
  }
}
</script>

<style lang="scss">
.m-operation-back {
  height: 50px;
  border-bottom: 1px solid #ddd;
  padding-left: 20px;
  display: flex;
  cursor: pointer;
  align-items: center;
  span {
    margin-left: 8px;
    font-size: 14px;
    margin-top: 1px;
    line-height: 14px;
  }
}
.m-operation {
  width: 100%;
  height: 94%;
  display: flex;
  position: relative;
  padding-bottom: 16px;
  &-list {
    height: 85%;
    border-radius: 3px;
    &.border {
      border-right: $border;
      box-sizing: border-box;
    }
    transition: width 0.2s;
  }
  &-detail {
    height: 85%;
    transition: width 0.2s;
    flex: 1;
    width: 0;
    z-index: 9;
  }
  &-line {
    position: absolute;
    z-index: 10;
    box-sizing: border-box;
    width: 6px;
    height: 85%;
    cursor: ew-resize;
    &.active {
      border-left: $border_dot;
    }
    img {
      display: block;
      position: absolute;
      left: -5px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
}
</style>

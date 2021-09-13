<template>
  <div class="m-normal-list">
    <!-- <div v-show="!operationList.length" style="height:500px;text-align:center">
      <img style='width:80px' src="@/assets/images/空.svg" alt="" />
      <div style="font-size:14px;color:#555">{{emptyText}}</div>
    </div>-->

    <el-table
      height="500"
      ref="table"
      :data="operationList"
      row-key="jobId"
      style="width: 100%;flex: 1;"
      highlight-current-row
      @row-click="onClickRow"
      :current-row-key="834"
    >
      <el-table-column prop="jobName" label="名称" min-width="100" v-if="isSimple">
        <template slot-scope="{ row }">
          <span v-if="isSimple" class="detail-title" :title="row.jobName">{{row.jobName}}</span>
          <!-- <ndc-table-link v-else-if="isoverview" @click="jump(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>-->
          <ndc-table-link v-else-if="isAdmin" @click="jumpToDetail(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
          <ndc-table-link v-else @click="view(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
        </template>
      </el-table-column>
      <el-table-column prop="jobName" label="名称" :width="jobNameWidth" fixed="left" v-else>
        <template slot-scope="{ row }">
          <span v-if="isSimple" :title="row.jobName">{{row.jobName}}</span>
          <!-- <ndc-table-link v-else-if="isOverview" @click="jump(row)">
            <span :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>-->
          <ndc-table-link v-else-if="isAdmin" @click="jumpToDetail(row)">
            <span style="color: #3b68b7;" :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
          <ndc-table-link v-else @click="view(row)">
            <span style="color: #3b68b7;" :title="row.jobName">{{row.jobName}}</span>
          </ndc-table-link>
        </template>
      </el-table-column>
      <el-table-column prop="jobStatus" label="任务状态" width="100" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            任务状态
            <!-- <img src="../../../../assets/fonts/sloth-icons.svg" alt=""> -->
            <ndc-table-filter
              class="g-ml-4"
              :filters="jobStatusFilters"
              :value="filterValue.jobStatus"
              @select="onFilter(arguments[0], 'jobStatus')"
            ></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          <span
            style="color: #f04346;"
            v-if="row.jobStatus === 'CRASHED' || row.jobStatus === 'FAILED'"
          >{{statusMap[row.jobStatus]}}</span>
          <span v-else>{{statusMap[row.jobStatus]}}</span>
        </template>
      </el-table-column>
      <el-table-column prop="runtimeStatus" label="运行状态" width="100" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            运行状态
            <ndc-table-filter
              class="g-ml-4"
              :filters="runtimeStatusFilters"
              :value="filterValue.runtimeStatus"
              @select="onFilter(arguments[0], 'runtimeStatus')"
            ></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          <div>
            <div class="status g-flex-ac" v-if="row.runtimeStatus === 'NORMAL'">
              <u-wave-icon></u-wave-icon>
              {{runtimeStatusMap[row.runtimeStatus]}}
            </div>
            <div class="status g-flex-ac" v-else-if="row.runtimeStatus === 'ABNORMAL'">
              <div class="icon abnormal"></div>
              {{runtimeStatusMap[row.runtimeStatus]}}
            </div>
            <div class="status g-flex-ac" v-else-if="row.runtimeStatus === 'FAILED'">
              <div class="icon failed"></div>
              {{runtimeStatusMap[row.runtimeStatus]}}
            </div>

            <span style="margin-left: 4px;" v-else>-</span>
          </div>
        </template>
      </el-table-column>
      <!-- <el-table-column v-if="!isSimple && !isAdmin" prop="tagIds" label="标签" min-width="100" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            标签
            <ndc-table-filter class="g-ml-4" :filters="tagFilters" :value="filterValue.tagIds" :multiple="true" @select="onFilter(arguments[0], 'tagIds')"></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">
          <span :title="parseTagNames(row.tagIds)">
            {{parseTagNames(row.tagIds)}}
          </span>
        </template>
      </el-table-column>-->
      <el-table-column
        v-if="!isSimple"
        prop="startTime"
        label="启动时间"
        width="170"
        :resizable="false"
      >
        <template v-slot:header>
          <div class="g-flex-ac">
            启动时间
            <ndc-table-order
              ref="columnOrder"
              class="g-ml-4"
              :order="orderValue.startTime"
              @order="onOrder(arguments[0], 'startTime')"
            ></ndc-table-order>
          </div>
        </template>
        <template slot-scope="{ row }">{{row.jobStatus === 'READY' ? '-' : row.startTime}}</template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="clusterId" label="集群" min-width="136">
        <template v-slot:header>
          <div class="g-flex-ac">
            集群
            <ndc-table-filter
              class="g-ml-4"
              :filters="clusterFilters"
              :value="filterValue.clusterId"
              @select="onFilter(arguments[0], 'clusterId')"
            ></ndc-table-filter>
          </div>
        </template>
        <template slot-scope="{ row }">{{clusterMap[row.clusterId]}}</template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="jobType" label="类型" width="80" :resizable="false">
        <template v-slot:header>
          <div class="g-flex-ac">
            类型
            <ndc-table-filter
              class="g-ml-4"
              :filters="jobTypeFilters"
              :value="filterValue.jobType"
              @select="onFilter(arguments[0], 'jobType')"
            ></ndc-table-filter>
          </div>
        </template>
      </el-table-column>
      <el-table-column v-if="!isSimple" prop="editor" label="最近发布人" min-width="136">
        <template v-slot:header>
          <div class="g-flex-ac">
            最近发布人
            <a-popover class="list-popover" title trigger="click" :value="visible">
              <template v-slot:content>
                <input
                  class="ndc-input input-editor"
                  type="text"
                  :placeholder="isAdmin ? '请输入操作人' : '请输入最近发布人'"
                  v-model="editor"
                  @change="onCreatorChange"
                  @keydown.enter="onCreatorChange"
                />
              </template>
              <img
                @click="onClickCreator"
                v-if="!editor"
                src="../../../../assets/lanhuicons/filternormal.svg"
                alt
              />
              <img @click="onClickCreator" v-else src="../../../../assets/lanhuicons/漏斗已筛.svg" alt />
            </a-popover>
          </div>
        </template>
        <template slot-scope="{ row }">
          <span :title="handleCreator(row.editor)">{{handleCreator(row.editor)}}</span>
        </template>
      </el-table-column>
      <el-table-column
        v-if="!isSimple"
        prop="resourceUse"
        label="资源用量"
        width="100"
        :resizable="false"
      ></el-table-column>
      <el-table-column
        v-if="!isSimple "
        prop="options"
        label="操作"
        width="200"
        fixed="right"
        :resizable="false"
      >
        <template slot-scope="{ row }">
          <div class="g-flex-ac">
            <ndc-table-link
              :disabled="starting.includes(row.jobId)"
              v-if="startButtonStatus.includes(row.jobStatus)"
              @click="start(row)"
            >启动</ndc-table-link>
            <ndc-table-link
              v-else
              :disabled="recoverDisabledStatus.includes(row.jobStatus) || starting.includes(row.jobId)"
              @click="recover(row)"
            >恢复</ndc-table-link>
            <ndc-table-link
              :disabled="stopDisabledStatus.includes(row.jobStatus) || stoping.includes(row.jobId)"
              class="g-ml-8"
              @click="stop(row)"
            >停止</ndc-table-link>
            <ndc-table-link
              v-if="!isAdmin"
              :disabled="!showjobdecommission ? true : downDisabledStatus.includes(row.jobStatus)"
              class="g-ml-8"
              @click="down(row)"
            >下线</ndc-table-link>
            <ndc-table-link
              v-if="!isAdmin"
              :disabled="alarmDisabledStatus.includes(row.jobStatus)"
              class="g-ml-8"
              @click="setAlarm(row)"
            >设置报警</ndc-table-link>
            <!-- <ndc-table-link v-if="isAdmin" class="g-ml-8" @click="editJobStatus(row)">修改任务状态</ndc-table-link> -->
          </div>
        </template>
      </el-table-column>

      <!-- 不及时更新 已解决-->
      <template>
        <div slot="empty" style="text-align:center">
          <img style="width:80px" src="@/assets/images/null.svg" alt />
          <div style="font-size:14px;color:#555">{{emptyText}}</div>
        </div>
      </template>
    </el-table>

    <div
      class="m-table-line"
      v-if="!isSimple"
      :class="{'active': lineVisible}"
      :style="lineStyle"
      @mousedown="onMouseDown"
      @mouseover="onMouseOver"
    ></div>
    <!-- <a-spin :spinning="loading" tip="Loading..."> -->

    <div class="pagination">
      <ndc-pagination
        :total="total"
        :loading="loading"
        :page.sync="page"
        :page-size.sync="pageSize"
        :total-visible="!isSimple"
        :size-visible="!isSimple"
        :jump-visible="!isSimple"
        :small="true"
      ></ndc-pagination>
    </div>

    <!-- </a-spin> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject, Watch } from 'vue-property-decorator'
import { State, Action, Mutation } from 'vuex-class'
import uWaveIcon from '@components/wave-icon/index.vue'
import { IJob, ITag, IAlarmConfigMeta, IAlarmConfigMetaItem, ICluster, IPageInfo } from '@utils/types'
import { STATUS_MAP, RUNTIME_STATUS_MAP, NORMAL_LIST_COLUMNS, STATUS_OPTIONS, JOB_STATUS_FILTERS, RUNTIME_STATUS_FILTERS, JOB_TYPE_FILTERS } from '../../constant'
import { MODULE_NAMESPACE } from '@utils/constant'
// import { debounce, set } from 'lodash';
import { debounce } from 'lodash'
import Operation from '../../index.vue'
import ModalMixin from '../../../components/modal/mixin'
import { MODAL_TYPE } from '../../../components/modal/constant'
// import MRecoveryJob from '../../../administrator/recovery/job.vue';
import Bus from '@/bus'
import MOperationList from './index.vue'
import { Table, TableColumn } from 'element-ui'
import 'element-ui/lib/theme-chalk/index.css'

let timer = 0
// import { config } from '../../../administrator/configuration/config';

@Component({
  components: {
    ElTable: Table,
    ElTableColumn: TableColumn,
    uWaveIcon
  }
})
export default class MNormalList extends Vue {
  @Prop({
    default: false
  })
  private isSimple!: boolean

  @Prop({
    default: false
  })
  // private isOverview!: boolean;
  @Prop({
    default: false
  })
  private isAdmin!: boolean

  @Prop({
    default: 'ALL'
  })
  private jobType!: string

  @Prop({
    default: false
  })
  private showjobdecommission!: Boolean

  @Prop({
    default: localStorage.getItem('sloth_searchkeyword') || ''
  })
  private keyword!: string

  @Prop({
    default: ''
  })
  private jobStatus!: string

  // 集群
  @Prop({
    default: ''
  })
  private filtercluster!: string

  @Prop({
    default: ''
  })
  private filterproject!: string

  @Prop({
    default: ''
  })
  private filterspace!: string

  @Prop({
    default: ''
  })
  private runtimeStatus!: string

  @Prop({
    default: -1
  })
  private selectedJobId!: number

  @Prop({
    default() {
      return []
    }
  })
  private starting!: number[]

  @Prop({
    default() {
      return []
    }
  })
  private stoping!: number[]

  @State('operationList', MODULE_NAMESPACE.operation)
  private operationList!: IJob[]

  @State('tagList', MODULE_NAMESPACE.develop)
  private tagList!: ITag[]

  @State('product', MODULE_NAMESPACE.global)
  private product!: string

  @State('userId', MODULE_NAMESPACE.global)
  private userId!: string

  @Inject('operation')
  private operation!: Operation

  @Watch('filtercluster') // 传入集群数据筛选
  private async onFilterclusterChanged(val: string) {
    let cluster = {}
    this.clusterFilters.forEach(v => {
      if (v.value === val) {
        cluster = v
      }
    })
    this.onFilter(cluster, 'clusterId')
  }

  @Watch('filterproject') // 传入项目数据筛选
  private async onFilterprojectChanged(val: string) {
    console.log(val, 'urljob444444')
    this.page = 1
    this.refresh()
  }

  @Watch('filterspace') // 传入空间数据筛选
  private async onFilterspaceChanged(val: string) {
    console.log(val, '66666')
    this.page = 1
    this.refresh()
  }

  @Watch('keyword')
  private onKeywordChanged(val: string) {
    this.page = 1

    // timer && window.clearInterval(timer);
    // this.timer = setInterval(()=>{
    //   this.refresh()
    // },5000)
    this.refresh()
  }

  @Watch('jobType')
  private onJobTypeChanged(val: string) {
    this.filterValue['jobType'] = val || 'ALL'
    this.page = 1
    this.refresh()
  }

  @Watch('jobStatus')
  private onJobStatusChanged(val: string) {
    this.filterValue['jobStatus'] = val || 'ALL'
    this.page = 1
    this.refresh()
  }

  @Watch('runtimeStatus')
  private onRuntimeStatusChanged(val: string) {
    this.filterValue['runtimeStatus'] = val || 'ALL'
    this.page = 1
    this.refresh()
  }

  @Watch('selectedJobId')
  private onSelectedJobIdChanged(val: number) {
    if (val !== -1) {
      this.selected = val
    }
  }

  @Watch('selected')
  private onSelectedChanged(val: number) {
    console.log(val, 'selected')
  }

  @Watch('page')
  private async onPageChanged(val: number) {
    console.log('page改变', val)

    await this.refresh()
  }

  @Watch('pageSize')
  private onPageSizeChanged(val: number) {
    this.page = 1
    console.log('pagesize改变', val)
    this.refresh()
  }

  @Watch('operationList')
  private onOperationListChanged(val) {}

  @Mutation('SET_PRODUCT', MODULE_NAMESPACE.global)
  private setProduct: any

  private total: number = 0
  private isFilter: boolean = false
  private isstop: boolean = false
  private page: number = 1
  private pageSize: number = 10
  private filterValue: any = {
    clusterId: 'ALL',
    jobStatus: 'ALL',
    runtimeStatus: 'ALL',
    tagIds: ['ALL'],
    jobType: 'ALL'
  }
  private orderKey: string = 'startTime'
  private orderValue: any = {
    startTime: 'desc'
  }
  private statusMap: any = STATUS_MAP
  private runtimeStatusMap: any = RUNTIME_STATUS_MAP
  private jobStatusFilters: any[] = JOB_STATUS_FILTERS
  private runtimeStatusFilters: any[] = RUNTIME_STATUS_FILTERS
  private jobTypeFilters: any[] = JOB_TYPE_FILTERS
  private startButtonStatus: string[] = ['CRASHED', 'FAILED', 'READY']
  private recoverDisabledStatus: string[] = ['RUNNING', 'STARTING', 'STOPPING']
  private stopDisabledStatus: string[] = ['STOPPED', 'FINISHED', 'READY', 'STARTING', 'STOPPING', 'CRASHED', 'FAILED']
  private downDisabledStatus: string[] = ['RUNNING', 'STARTING', 'STOPPING']
  private alarmDisabledStatus: string[] = ['STARTING', 'STOPPING']
  private alarmModalInstance: ModalMixin | null = null
  private statusModalInstance: ModalMixin | null = null
  private selected: number = -1
  private alarmConfig: any = {}
  private clusterList: ICluster[] = []
  private clusterMap: any = {}
  private timer: any = null
  private timerr: any = null
  private editor: string = ''
  private visible: boolean = false
  private lineVisible: boolean = false
  private jobNameWidth: number = 200
  private tableHeight: number = 0
  private lineLeftWidth: number = 200
  private debounceResize: any
  private alarmTypes: any[] = []
  private mouparams: any = {
    jobName: this.keyword
  }
  private loading: boolean = true

  private get emptyText(): string {
    if (this.keyword) {
      return '搜索结果为空'
    } else {
      this.isFilter = false
      Object.keys(this.filterValue).forEach(filter => {
        if (this.filterValue[filter] !== 'ALL') {
          this.isFilter = true
        }
      })
      return this.isFilter ? '筛选结果为空' : '暂无数据'
    }
  }

  private get clusterFilters(): any[] {
    const result: any[] = [
      {
        key: 'ALL',
        value: '全部'
      }
    ]
    this.clusterList.forEach(cluster =>
      result.push({
        key: cluster.id,
        value: cluster.clusterName
      })
    )
    return result
  }

  private get tagFilters(): any[] {
    const result: any[] = [
      {
        key: 'ALL',
        value: '全部'
      }
    ]
    this.tagList.forEach(tag => {
      result.push({
        key: tag.id,
        value: tag.name
      })
    })
    return result
  }

  private get lineStyle() {
    return {
      left: this.lineLeftWidth + 'px',
      height: this.tableHeight + 'px'
    }
  }

  private get zIndex() {
    return {
      zIndex: 3
    }
  }

  @Action('getOperationJobList', MODULE_NAMESPACE.operation)
  private getOperationJobList!: any

  public setClusterList(list: ICluster[]) {
    this.clusterList = list
  }

  public async refresh() {
    // console.log('refresh执行--')
    try {
      this.loading = true
      const params = await this.genParams()
      if (this.isAdmin) {
        Bus.$emit('admin_job_refresh', params)
        return
      }
      // if (this.isFilter) { return; }
      // if (this.isstop) { return; }

      const result = await this.getOperationJobList(params)
      // console.log(params,result, 'refresh===');
      // this.operationList = result.info

      this.refreshList(result)
    } catch (e) {
    } finally {
      this.loading = false
    }
  }

  public clearSelected() {
    this.selected = -1
  }

  private interval() {
    console.log('setinterval', timer, 99999)
    // if(!this.keyword){
    window.clearInterval(timer)
    console.log('setinterval', timer, 99999)

    timer = window.setInterval(() => {
      // console.log('setinterval-refresh')
      this.refresh()
    }, 5000)
    // }
  }

  private created() {
    Bus.$on('job_list_init', this.init)
    Bus.$on('admin_job_alarm', this.alarm)
    Bus.$on('job_list_refresh', this.refreshList)
    Bus.$on('job_list_reset', this.reset)
  }

  private async mounted() {
    try {
      this.handleClusterList()

      const alarmConfig = await this.$request('getAlarmRulesMeta')
      this.handleAlarmConfig(alarmConfig)
      this.alarmTypes = await this.$request('getAlarmTypes')

      this.debounceResize = debounce(this.resize.bind(this), 100)
      window.addEventListener('resize', this.debounceResize)
      this.$nextTick(async () => {
        const dom = this.$el.getElementsByClassName('el-table')[0]
        dom && (this.tableHeight = dom.clientHeight - 24 - 16)
        if (window.location.href.indexOf('jobId') !== -1 || window.location.href.indexOf('id') !== -1) {
          // await this.refresh()
          let params = {
            pageNo: 1,
            pageSize: 1000,
            order: this.orderValue.startTime || 'desc',
            orderBy: this.orderValue.startTime ? 'startTime' : 'deployTime',
            jobName: this.keyword
          }
          const result = await this.getOperationJobList(params)

          const url: any = window.location.href.split('?')[1]
          const urlarr = url.split('&')
          let urlobj: any = {}
          urlarr.forEach(v => {
            urlobj[v.split('=')[0]] = v.split('=')[1]
          })
          urlobj.jobId = urlobj.jobId || urlobj.id //打开上一次的 和离线跳转过来的
          this.selected = urlobj.jobId
          // this.page, 改变
          // this.pageSize, 改变
          result.info.forEach((v, i) => {
            if (v.jobId == urlobj.jobId) {
              this.page = Math.floor(i / 10) + 1
              console.log(v, i, this.page, i % 10, urlobj.jobId, 'result selectedlist')
              this.pageSize = 10
            }
          })
          await this.refresh()
          this.operationList.forEach((v, i) => {
            if (v.jobId == urlobj.jobId) {
              const table = this.$refs.table as any
              table.setCurrentRow(this.operationList[i])
              this.operation.showJobDetail(this.selected, '')
              console.log(v.jobId, i, urlobj.jobId, this.page, 'result refresh list')

              return
            }
            console.log(v.jobId, i, urlobj.jobId, this.page, 'result refresh list')
          })

          console.log(this.operationList, result, 'result operationList')
          // this.operationList.forEach((v, i) => {
          //   if (v.jobId == urlobj.jobId) {
          //     const table = this.$refs.table as any;
          //     table.setCurrentRow(this.operationList[i]);
          //     this.operation.showJobDetail(this.selected, '');

          //     return;
          //   }
          //   console.log(v.jobId, i, urlobj.jobId,this.page, 'selectedlist');
          // });
        } else {
          this.refresh()
        }

        this.interval()
      })
    } catch (e) {
      this.$handleException(e)
    }
  }

  private beforeDestroy() {
    this.alarmModalInstance && this.alarmModalInstance.hide()
    this.alarmModalInstance = null
    this.statusModalInstance && this.statusModalInstance.hide()
    this.statusModalInstance = null
    timer && window.clearInterval(timer)
    timer = 0
    window.removeEventListener('resize', this.debounceResize)
    Bus.$off('job_list_init', this.init)
    Bus.$off('admin_job_alarm', this.alarm)
    Bus.$off('job_list_refresh', this.refreshList)
    Bus.$off('job_list_reset', this.reset)
  }

  private resize() {
    const dom = this.$el.getElementsByClassName('el-table')[0]
    dom && (this.tableHeight = dom.clientHeight)
  }

  private reset() {
    this.page = 1
    this.pageSize = 10
    this.filterValue = {
      clusterId: 'ALL',
      jobStatus: 'ALL',
      runtimeStatus: 'ALL',
      tagIds: ['ALL'],
      jobType: 'ALL'
    }
    this.orderValue = {
      startTime: 'desc'
    }
    this.editor = ''
    this.refresh()
  }

  private refreshList(result) {
    const pageInfo = result && (result.page as IPageInfo)
    this.page = (pageInfo && pageInfo.pageIndex) || 1
    this.total = (pageInfo && pageInfo.objTotal) || 0
  }

  private init() {
    const arr = (this.userId || '').split('@')
    this.editor = arr.length ? arr[0] : ''
    this.orderValue = {
      startTime: ''
    }
    const comp = this.$refs.columnOrder[0] as any
    comp && comp.setValue && comp.setValue('')
  }

  private async genParams() {
    // this.keyword = localStorage.getItem('sloth_searchkeyword') || this.keyword
    // console.log(this.keyword,'搜索值')
    let params = this.mouparams
    params = {
      pageNo: this.page,
      pageSize: this.pageSize,
      order: this.orderValue.startTime || 'desc',
      orderBy: this.orderValue.startTime ? 'startTime' : 'deployTime',
      jobName: this.keyword
    }
    // debugger
    if (this.keyword) {
      params.jobName = this.keyword
    }
    if (this.filterproject) {
      params.team = this.filterproject //当前页面下的项目 不被develop影响
      params.product = this.filterproject //当前页面下的项目 不被develop影响
      // this.setProduct(' this.filterproject')
    }

    if (this.editor) {
      params.editor = this.editor
    }
    if (this.filterValue.jobType && this.filterValue.jobType !== 'ALL') {
      params.jobType = this.filterValue.jobType
    }
    if (this.filterValue.jobStatus && this.filterValue.jobStatus !== 'ALL') {
      params.jobStatus = this.filterValue.jobStatus
    }
    if (this.filterValue.runtimeStatus && this.filterValue.runtimeStatus !== 'ALL') {
      params.runtimeStatus = this.filterValue.runtimeStatus === 'OTHERS' ? 'IDLE' : this.filterValue.runtimeStatus
    }
    // 集群
    if (this.filterValue.clusterId && this.filterValue.clusterId !== 'ALL') {
      params.clusterId = this.filterValue.clusterId
    }
    if (!this.isAdmin && this.filterValue.tagIds.length && !this.filterValue.tagIds.includes('ALL')) {
      params.tagIds = this.filterValue.tagIds
    }
    this.mouparams = params

    return params
  }

  private async handleClusterList() {
    this.clusterList = await this.$request('getClusterList')
    this.clusterMap = {}
    this.clusterList.forEach(cluster => {
      if (!this.clusterMap[cluster.id]) {
        this.clusterMap[cluster.id] = cluster.clusterName
      }
    })
  }

  private handleCreator(email: string) {
    const arr = email.split('@')
    return arr.length ? arr[0] : ''
  }

  private handleAlarmConfig(config: any) {
    const columnSeq = config.columnSeq
    const alarmConfig = config.data || []

    const requiredRules: IAlarmConfigMeta[] = []
    const optionalRules: any[] = []
    const rulesMap: any = {}
    const requiredMetricTypes: any[] = []
    const metricTypes: any[] = []
    const metricTypesMap: any = {}
    for (let i = 0, len = alarmConfig.length; i < len; i++) {
      const rule = alarmConfig[i]
      const keys = Object.keys(rule)
      keys.forEach(key => {
        const value = rule[key]
        if (key !== 'id' && key !== 'optional' && (value !== '-1' || value !== -1)) {
          rule[key] = value
        }
      })
      const metricType = rule.metricType
      if (rule.optional) {
        optionalRules.push(rule)
        metricTypes.push(metricType)
      } else {
        requiredRules.push(rule)
        requiredMetricTypes.push(metricType)
      }
      const id = metricType.id
      if (!rulesMap[id]) {
        rulesMap[id] = rule
      }
      metricTypesMap[id] = metricType.value
    }

    this.alarmConfig = {
      columnSeq,
      metricTypes,
      metricTypesMap,
      requiredMetricTypes,
      rulesMap,
      requiredRules,
      optionalRules
    }
  }

  private parseTagNames(ids: number[] = []) {
    if (!ids || !ids.length) {
      return ''
    }
    const names: string[] = []
    for (let i = 0, len = this.tagList.length; i < len; i++) {
      const tag = this.tagList[i]
      if (ids.includes(tag.id)) {
        names.push(tag.name)
      }
      if (names.length === ids.length) {
        return names.join(',')
      }
    }
    return names.join(',')
  }

  private view(job: IJob) {
    console.log(job, 'seletedviewjob urljob', this.filterspace, this.filterproject)
    if (this.selected === job.jobId) {
      return
    }
    this.selected = job.jobId || -1
    // this.$router.push({
    //   path: '/sloth/operation',
    //   query: {
    //     jobId: this.selected.toString(),
    //     product: this.product
    //   }
    // });
    // window.location.href=`${window.location.origin}${window.location.pathname}#/sloth_opera?jobId=${job.jobId}&jobSpace=${this.filterspace}&jobProject=${this.filterproject}`
    window.location.href = `${window.location.origin}${window.location.pathname}#/oms/onlineDevelop/operation?jobId=${job.jobId}&jobSpace=${this.filterspace}&jobProject=${this.filterproject}`

    this.operation.showJobDetail(this.selected, '')
  }

  private jump(job: IJob) {
    // this.$router.push({
    //   path: '/sloth/operation',
    //   query: {
    //     jobId: (job.jobId || -1).toString(),
    //     product: this.product
    //   }
    // });
  }

  private alarm(job: IJob) {
    console.log(job, 'bus')
    this.operation.showJobDetail(job.jobId, 'alarm')
  }

  private jumpToDetail(job: IJob) {
    Bus.$emit('admin_job_jump', job)
  }

  private recover(job: IJob) {
    this.operation.recover(job)
  }

  private start(job: IJob) {
    this.operation.start(job)
  }

  private stop(job: IJob) {
    this.operation.stop(job)
  }

  private down(job: IJob) {
    this.operation.down(job)
  }

  private async setAlarm(job: IJob) {
    try {
      // 设置报警接口
      const alarm = await this.$request('getOperationJobAlarm', {
        jobId: job.jobId
      })
      if (!this.alarmModalInstance) {
        this.alarmModalInstance = this.$createModalInstance(MODAL_TYPE.alarm)
      }
      this.alarmModalInstance &&
        this.alarmModalInstance.show(
          Object.assign({}, this.alarmConfig, {
            jobName: job.jobName,
            jobId: job.jobId,
            alarm,
            alarmTypes: this.alarmTypes
          }),
          async (args: any) => {
            console.log(args, 'setAlarm')
            try {
              await this.$request('setOperationJobAlarm', {
                ...args,
                jobId: job.jobId
              })
              this.$ndcmessage.success('报警设置成功')
              return true
            } catch (e) {
              this.alarmModalInstance && this.alarmModalInstance.setError(e.message)
            }
          }
        )
    } catch (e) {
      this.$handleException(e)
    }
  }

  private editJobStatus(job: IJob) {
    if (!this.statusModalInstance) {
      this.statusModalInstance = this.$createModalInstance(MODAL_TYPE.status)
    }
    this.statusModalInstance &&
      this.statusModalInstance.show(
        {
          statusOptions: STATUS_OPTIONS,
          status: job.jobStatus
        },
        async (args: any) => {
          try {
            await this.$request('modifyJobStatus', {
              jobId: job.jobId,
              newTaskStatus: args.status
            })
            await this.refresh()
            this.$ndcmessage.success('任务状态修改成功')
            return true
          } catch (e) {
            this.statusModalInstance && this.statusModalInstance.setError(e.message)
          }
        }
      )
  }

  private onClickRow(job: IJob) {
    console.log(this.isSimple, job, 'selectedlistonClickRow')
    this.isSimple && this.view(job)
  }

  private onFilter(filter: any, name: string) {
    if (name === 'tagIds') {
      return this.onFilterTagIds(filter)
    }
    this.filterValue = Object.assign({}, this.filterValue, {
      [name]: filter.key
    })
    if (name === 'runtimeStatus' || name === 'jobStatus') {
      this.$emit('filter-change', this.filterValue)
    }
    if (name === 'jobType') {
      const parent = this.$parent as MOperationList
      parent && parent.setJobType(this.filterValue['jobType'])
    }
    this.page = 1
    this.refresh()
  }

  private onFilterTagIds(filter: any) {
    const val = filter.key
    if (val === 'ALL') {
      this.filterValue.tagIds = ['ALL']
    } else {
      let index = this.filterValue.tagIds.indexOf('ALL')
      if (index !== -1) {
        this.filterValue.tagIds.splice(index, 1)
      }
      index = this.filterValue.tagIds.indexOf(val)
      if (index === -1) {
        this.filterValue.tagIds.push(val)
      } else {
        this.filterValue.tagIds.splice(index, 1)
      }
      if (this.filterValue.tagIds.length === 0) {
        this.filterValue.tagIds.push('ALL')
      }
    }
    // if (this.isOverview) {
    //   this.$emit('filter-change', this.filterValue);
    // }
    this.page = 1
    this.refresh()
  }

  private onOrder(order: any, name: string) {
    this.orderValue[name] = order
    this.page = 1
    this.refresh()
  }

  private onClickCreator() {
    this.visible = true
    const arr = this.userId.split('@')
    arr.length && !this.editor && (this.editor = arr[0])
    setTimeout(() => {
      const dom = document.getElementsByClassName('input-editor')[0] as any
      dom && dom.select()
    }, 100)
  }

  private onCreatorChange() {
    this.visible = false
    this.page = 1
    this.refresh()
  }

  private onMouseOver(e: MouseEvent) {
    e.preventDefault()
    this.lineVisible = true
    document.addEventListener('mouseout', this.onMouseOut)
  }

  private onMouseOut(e: MouseEvent) {
    e.preventDefault()
    this.lineVisible = false
    document.removeEventListener('mouseout', this.onMouseOut)
  }

  private onMouseDown(e: MouseEvent) {
    e.preventDefault()
    this.lineVisible = true
    document.addEventListener('mouseup', this.onMouseUp)
    document.addEventListener('mousemove', this.onMouseMove)
  }

  private onMouseUp(e: MouseEvent) {
    e.preventDefault()
    this.lineVisible = false
    this.$nextTick(() => {
      this.jobNameWidth = this.lineLeftWidth
    })
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  private onMouseMove(e: MouseEvent) {
    e.preventDefault()
    const clientX = e.clientX
    this.lineLeftWidth = clientX < 200 ? 200 : clientX > 500 ? 500 : clientX
  }
}
</script>

<style lang="scss">
.m-normal-list {
  // min-height: 600px;
  // overflow-y: auto;
  display: flex;
  flex-direction: column;
  .detail-title {
    color: #3b68b7;
    cursor: pointer;
  }
  .ndc-input {
    margin-top: -8px;
  }
  .list-popover {
    top: 112px;
    left: 142px;
  }
  .ant-popover {
    z-index: 3;
  }
  .el-table {
    thead tr {
      background: #f4f6fa;
      height: 40px;
      th {
        background-color: #f4f6fa;
        padding: 8px 0;
        color: #888;
        word-wrap: normal;
      }
    }
    th.is-leaf {
      background: #eee;
      border-color: #e2e5e9;
      box-sizing: border-box;
    }

    tbody tr td {
      color: #222;

      .g-flex-ac {
        .g-text-link {
          color: #3b68b7;
        }
        .g-text-link.disabled,
        .g-text-link.disabled:hover {
          color: #999;
        }
      }

      border-color: #ebf0f5;
    }

    tbody tr .el-table_4_column_28 {
      cursor: pointer;
      color: #3b68b7;
    }

    .cell {
      white-space: nowrap;
    }
  }
  .el-table__fixed-right-patch {
    background: #f4f6fa;
  }
  .el-table--border {
    border: none;
    td,
    th {
      border-right: none;
    }
  }
  .el-table__body tr.hover-row.current-row > td,
  .el-table__body tr.hover-row.el-table__row--striped.current-row > td,
  .el-table__body tr.hover-row.el-table__row--striped > td,
  .el-table__body tr.hover-row > td {
    background: #edf8ff;
  }
  .ndc-icon-filter2 {
    font-size: 12px;
    color: #d2d7e0;
    cursor: pointer;
    &.active {
      color: #3b68b7;
    }
  }
  .m-table-line {
    position: absolute;
    top: 50px;
    width: 6px;
    z-index: 10;
    box-sizing: border-box;
    &.active {
      border-left: $border_dot;
      cursor: ew-resize;
    }
  }
  .pagination {
    // padding: 32px 0;
    padding: 0;
    margin-top: 16px;
    box-sizing: border-box;
    flex-shrink: 0;
  }
  .status {
    .icon {
      width: 8px;
      height: 8px;
      border-radius: 100%;
      margin: 4px 12px 4px 4px;
      &.abnormal {
        background: #ffcc00;
      }
      &.failed {
        background: #f04346;
      }
    }
  }
}
</style>

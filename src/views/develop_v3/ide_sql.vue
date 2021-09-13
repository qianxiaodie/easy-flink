<template>
  <div class="m-ide">
    <div class="m-ide-job" v-if="tabs.length">
      <!-- 标签页 -->
      <div class="m-ide-tabs">
        <ndc-tabs
          ref="tabs"
          is-card
          closable
          :tabs="tabs"
          :value="activeTab"
          :before-leave="onBeforeLeave"
          :before-close="onBeforeClose"
          @close="onTabClose"
          @change="onTabChange"
          @tab-right-click="onTabRightClick"
        >
          <template v-slot:label="scope">
            <img v-if="scope.tab.type === 'SQL'" src="../../assets/images/s.png" />
            <img v-else src="../../assets/images/j.png" />
            <span class="g-text-nowrap" :title="scope.tab.label" style="max-width: 250px;font-weight: 500">{{ scope.tab.label }}</span>
          </template>
          <!-- <span>+</span> -->
          <!-- 工具栏 -->
          <div class="m-ide-toolbar">
            <u-text-button class="g-ml-16" @click="saveJob" :disabled="!this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/icon_baocun.png" />
              <span>保存</span>
            </u-text-button>
            <u-text-button @click="formatJob" :disabled="(tab && tab.type === 'JAR') || !this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/icon_geshihua.png" />
              <span>格式化</span>
            </u-text-button>
            <u-text-button @click="checkGrammar" :disabled="(tab && tab.type === 'JAR') || !this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/icon_yufa.png" />
              <span>语法检查</span>
            </u-text-button>
            <u-text-button v-if="tab && tab.type !== 'JAR' && this.devTestOpCodesFlag">
              <ndc-dropdown selectable :items="this.devTestOpCodesFlag ? debuggMenu : []" :value.sync="valuess" @select="doSelect" v-if="tab && tab.type !== 'JAR'">
                <img class="icon" src="../../assets/images/icon_tiaoshi.png" style="margin-bottom: 3px" />
                <span>调试</span>
                <i class="el-icon-caret-bottom"></i>
              </ndc-dropdown>
            </u-text-button>
            <u-text-button v-if="tab && tab.type !== 'JAR' && !this.devTestOpCodesFlag" :disabled="(tab && tab.type === 'JAR') || !this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/icon_tiaoshi.png" />
              <span>调试</span>
              <i class="el-icon-caret-bottom"></i>
            </u-text-button>
            <u-text-button @click="debugJobModal" v-if="tab && tab.type === 'JAR'" :disabled="(tab && tab.type !== 'JAR') || !this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/icon_tiaoshi.png" />
              <span>测试集群调试</span>
            </u-text-button>
            <u-text-button @click="releaseJob" :disabled="!this.devdeployOpCodesFlag">
              <img class="icon" src="../../assets/images/icon_shangxian.png" />
              <span>部署上线</span>
            </u-text-button>
            <u-text-button v-if="tab.type === 'SQL'" id="developmentManual-sql" @click="openSqlLink" :disabled="!this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/开发手册.png" />
              <span>开发手册</span>
              <img class="icon" src="../../assets/images/New.png" />
            </u-text-button>
            <u-text-button v-else id="developmentManual-jar" @click="openJarLink" :disabled="!this.devTestOpCodesFlag">
              <img class="icon" src="../../assets/images/开发手册.png" />
              <span>Flink-Examples</span>
              <img class="icon" src="../../assets/images/New.png" />
            </u-text-button>
            <!-- 运维 -->
            <!-- 新增全屏按钮 -->
            <!-- <div class="quanpin">
              <u-text-button class="btn-quanpin">
                <img class="icon" src="../../assets/images/icon_quanpin.png" alt />
              </u-text-button>
            </div>-->
          </div>

          <ndc-tab-panel class="m-ide-main" v-for="item in tabs" :key="item.name" :name="item.name">
            <m-ide-panel
              :ref="'panel_' + item.name"
              :job-id="item.name"
              @debug="onDebugChange"
              @ide-modified="onIdeModified"
              :devdeployOpCodesFlag="devdeployOpCodesFlag"
              :devTestOpCodesFlag="devTestOpCodesFlag"
            ></m-ide-panel>
          </ndc-tab-panel>
        </ndc-tabs>
      </div>
    </div>

    <div v-else class="m-ide-new">
      <!-- <div class="new-item">
        <img src="../../assets/images/pic_createfile.svg" />
        <ndc-button theme="primary" @click="createFolder">新建文件夹</ndc-button>
      </div>-->
      <div class="new-item-box">
        <div class="new-item new-item-sql">
          <img src="../../assets/images/icon_newSqlTask.png" />
          <ndc-button theme="default" @click="createJob('SQL')" class="newTaskBtn" :disabled="!this.devTestOpCodesFlag">新建SQL任务</ndc-button>
          <!--          <ndc-button theme="default" @click="debugJob">调试</ndc-button>-->
        </div>
        <div class="new-item new-item-jar">
          <img src="../../assets/images/icon_newJarTask.png" />
          <ndc-button theme="default" @click="createJob('JAR')" class="newTaskBtn" :disabled="!this.devTestOpCodesFlag">新建JAR任务</ndc-button>
        </div>
      </div>

      <div class="bg">
        <img src="../../assets/images/bg_task_bottom.png" />
      </div>
      <div class="plate">
        <img src="../../assets/images/plate_task.png" />
      </div>
    </div>

    <div class="m-ide-detail" v-if="detailVisible" style="display:none">
      <m-detail-panel ref="detailPanel" @close="onCloseDetail" :active-tab="detailType" :info="detailInfo"></m-detail-panel>
    </div>
    <resourcemodal ref="resourcemodal"></resourcemodal>
    <!-- <u-context-menu :op-codes-flag="opCodesFlag" style="display:none"></u-context-menu> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Provide } from 'vue-property-decorator'
import { State, Mutation, Action } from 'vuex-class'
import MIdePanel from './components/ide-panel/index.vue'
import UContextMenu from '@components/context-menu/context-menu.vue'
import MSqlEditor from './components/sql-editor/index.vue'
import MDetailPanel from './components/detail-panel/index.vue'
import ModalMixin from '../components/modal/mixin'

import { IJob, ITab, IMenuItem, IQueue, IKernel, ICluster, IDetail, IMetadata, ITag, IFile, IJobTreeNode, ISimpleFile } from '@utils/types'
import { JOB_TYPES, EDITOR_CMD, JOB_EVENTS } from './constant'
import { cloneDeep } from 'lodash'
import { MODAL_TYPE } from '../components/modal/constant'
import { MODULE_NAMESPACE } from '@/utils/constant'
import Bus from '@/bus'
import resourceFiles from './components/resource-files/index.vue'
import resourcemodal from '@/views/components/modal/resource.vue'
// 引入获取权限请求
import { getOpCodes } from '@/utils/getOpcodes'
import { trackEvent } from '@/utils/trackEvent'
import { Icon } from 'ant-design-vue'
import 'ant-design-vue/lib/icon/style/css'
import Axios from 'axios'
Vue.component(Icon.name, Icon)
const tabMenuItems: IMenuItem[] = [
  {
    key: 'current',
    label: '关闭当前任务'
  },
  {
    key: 'others',
    label: '关闭其他任务'
  },
  {
    key: 'right',
    label: '关闭右侧任务'
  }
]

@Watch('jobs')
@Component({
  components: {
    MIdePanel,
    MSqlEditor,
    MDetailPanel,
    resourceFiles,
    resourcemodal,
    UContextMenu
  }
})
export default class MIde extends Vue {
  @State('tabs', MODULE_NAMESPACE.develop_v3)
  private tabs!: ITab[]

  @State('activeTab', MODULE_NAMESPACE.develop_v3)
  private activeTab!: string

  @State('jobList', MODULE_NAMESPACE.develop_v3)
  private jobList!: IJobTreeNode[]

  @Provide()
  private ide = this

  private debugingJob: string = ''
  private jobTypes = JOB_TYPES
  private tabContextMenuInstance: UContextMenu | null = null
  private selectedTab: string = ''
  public detailVisible: boolean = false
  private detailType: string = ''
  private detailInfo: IMetadata | ITag | IFile | null = null
  private folderModalInstance: ModalMixin | null = null
  private deployModalInstance: ModalMixin | null = null
  private jobModalInstance: ModalMixin | null = null
  private refTabs?: any
  private tab: ITab | null = null
  private devdeployOpCodesFlag: boolean = false
  private devTestOpCodesFlag: boolean = false
  private valuess: string = ''
  public color = '#3B68B7'
  private debuggMenu: any[] = [
    {
      key: 'project1',
      title: '测试集群调试'
    },
    {
      key: 'project2',
      title: '调试任务'
    }
  ]

  @Watch('activeTab')
  private onActiveTabChanged() {
    // url添加jobId，不刷新页面
    this.tab = this.tabs.find(t => t.name === this.activeTab) || null
    if (this.tab && this.tab.type === 'SQL') {
      this.color = '#3B68B7'
    } else {
      this.color = '#E27346'
    }
    const obj = document.getElementsByTagName('body')[0] as HTMLElement
    obj.style.setProperty('--color', this.color)

    if (!this.tab && this.tabs.length) {
      this.setActiveTab(this.tabs[0].name)
    }
    this.$nextTick(() => {
      this.executeCommand(EDITOR_CMD.init)
    })
    Bus.$emit('base_job_id', this.activeTab)
    if (this.tabs.length === 0) {
      this.$router.replace({ query: { ...this.$route.query, jobId: '', jobName: '', jobType: '' } })
    } else {
      this.tabs.forEach(i => {
        if (i.name === this.activeTab) {
          this.$router.replace({ query: { ...this.$route.query, jobId: this.activeTab, jobName: i.label, jobType: i.type } })
        }
      })
    }
    this.checkUrlJobId()
  }

  private jobIdFlag: boolean = false
  private urlJobType: string = ''
  private urlJobName: string = ''
  private urlJobId: string = ''
  private checkUrlJobId() {
    let locationMsg = window.location.href
    // 获取所有参数信息
    let num = locationMsg.indexOf('?')
    locationMsg = locationMsg.substr(num + 1)
    let paramsArr = locationMsg.split('&')
    paramsArr.forEach(item => {
      if (item.indexOf('jobId') === 0) {
        // 判断url是否携带jobId，如果携带则截取jobId，更改activeTab
        let index = item.indexOf('=')
        this.urlJobId = item.substr(index + 1)
        this.setActiveTab(this.urlJobId)
      } else if (item.indexOf('jobType') === 0) {
        let index = item.indexOf('=')
        this.urlJobType = item.substr(index + 1)
      } else if (item.indexOf('jobName') === 0) {
        let index = item.indexOf('=')
        // this.urlJobName = item.substr(index + 1)
        // 解码， url中文乱码
        this.urlJobName = decodeURIComponent(item.substr(index + 1))
      }
    })
    // 方案二： this.jobIdFlag 的判断条件
    const arr: any = []
    this.tabs.forEach(i => {
      arr.push(i.name)
    })
    if (arr.indexOf(this.urlJobId) === -1 && this.urlJobId !== '' && this.urlJobType !== '' && this.urlJobName !== '') {
      this.jobIdFlag = true
    } else {
      this.jobIdFlag = false
    }
  }

  private projectPermission: boolean = false
  private getPermission() {
    const hosturl = '/HTAI/v2/api/portal'
    const baseUserProjectUrl = '/api/infra/userProject/all'
    let userId = JSON.parse(<string>localStorage.getItem('userInfo')).id || {}
    let projectId = this.$route.query.projectId as string
    Axios.get(`${hosturl}${baseUserProjectUrl}`, {
      params: {
        userId,
        projectId
      },
      headers: {
        API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
      }
    })
      .then(response => {
        let result = response.data.result
        result.length === 0 ? (this.projectPermission = false) : (this.projectPermission = true)
      })
      .catch(err => {
        this.$ndcmessage.error(err)
      })
  }

  private async created() {
    this.getPermission()
    let tabsNameArr: any = []
    const arr: ITab[] = []
    this.checkUrlJobId()
    if (this.jobIdFlag) {
      if (this.tabs.length !== 0) {
        this.tabs.forEach(i => {
          if (i.name !== this.urlJobId) {
            arr.push(i)
          }
        })
      }
      /*const tabUrlJob = { name: this.urlJobId, label: this.urlJobName, type: this.urlJobType }
      console.log(tabUrlJob, 'tabUrlJob---created')
      arr.push(tabUrlJob)
      this.setTabs(arr)*/
      if (!tabsNameArr.includes(this.activeTab)) {
        const tabUrlJob = { name: this.urlJobId, label: this.urlJobName, type: this.urlJobType }
        arr.push(tabUrlJob)
        this.setTabs(arr)
      }
    }

    this.tab = this.tabs.find(t => t.name === this.activeTab) || null
    if (this.tab && this.tab.type === 'SQL') {
      this.color = '#3a67b7'
    } else {
      this.color = '#E27346'
    }
    const obj = document.getElementsByTagName('body')[0] as HTMLElement
    obj.style.setProperty('--color', this.color)
    this.showReleaseJob()
  }

  // 根据用户权限操作码，选择部署上线是显示还是隐藏
  private async showReleaseJob() {
    let result = await getOpCodes({})
    if (result.opCodes.includes('rtdev_proj.devdeploy')) {
      this.devdeployOpCodesFlag = true
    } else {
      this.devdeployOpCodesFlag = false
    }
    if (result.opCodes.includes('rtdev_proj.devtest')) {
      this.devTestOpCodesFlag = true
    } else {
      this.devTestOpCodesFlag = false
    }
  }

  // // 全屏显示
  // showQuanPin() {
  //   let fullarea = document.getElementById('ndc-tabs') //要被全屏的元素
  //   var fullscreen = false
  //   if (fullscreen) {
  //     // 退出全屏

  //     if (document.exitFullscreen) {
  //       document.exitFullscreen()
  //     } else if (document.webkitCancelFullScreen) {
  //       document.webkitCancelFullScreen()
  //     } else if (document.mozCancelFullScreen) {
  //       document.mozCancelFullScreen()
  //     } else if (document.msExitFullscreen) {
  //       document.msExitFullscreen()
  //     }
  //   } else {
  //     // 进入全屏

  //     if (fullarea.requestFullscreen) {
  //       fullarea.requestFullscreen()
  //     } else if (fullarea.webkitRequestFullScreen) {
  //       fullarea.webkitRequestFullScreen()
  //     } else if (fullarea.mozRequestFullScreen) {
  //       fullarea.mozRequestFullScreen()
  //     } else if (fullarea.msRequestFullscreen) {
  //       // IE11

  //       fullarea.msRequestFullscreen()
  //     }
  //   }

  //   fullscreen = !fullscreen
  // }

  private get jobNames() {
    const func = (nodes: IJobTreeNode[] = []): string[] => {
      let result: string[] = []
      for (let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i]
        if (!node.id) {
          continue
        }
        if (node.folders) {
          const child = func(node.folders as IJobTreeNode[])
          result = result.concat(child)
        }
        if (node.jobs && node.jobs.length) {
          node.jobs.forEach(job => {
            result.push(job.jobName || '')
          })
        }
      }
      return result.filter(Boolean)
    }

    return func(this.jobList)
  }
  // 点击调试按钮
  private doSelect(item) {
    if (item && item.key === 'project1') {
      this.executeCommand(EDITOR_CMD.deploy)
    }
    if (item && item.key === 'project2') {
      this.executeCommand(EDITOR_CMD.debug)
    }
  }
  private get isFolderEmpty() {
    return !this.jobList.length
  }

  public executeCommand(cmd: number, args?: any) {
    if (cmd === EDITOR_CMD.resize) {
      this.resize()
    }
    const panels = this.$refs['panel_' + this.activeTab] as MIdePanel[]
    if (panels && panels.length) {
      const idePanel = panels[0]
      idePanel && (idePanel as any).executeCommand(cmd, args)
    }
  }

  public openDetail(data: IDetail) {
    this.detailType = data.type
    this.detailInfo = data.info
    this.detailVisible = true
    this.$nextTick(() => {
      if (this.detailType === 'metadata') {
        const panel = this.$refs.detailPanel as MDetailPanel
        panel && (panel as any).resize()
      }
      this.executeCommand(EDITOR_CMD.resize)
    })
  }

  @Mutation('SET_ACTIVETAB', MODULE_NAMESPACE.develop_v3)
  private setActiveTab!: any

  @Mutation('SET_TABS', MODULE_NAMESPACE.develop_v3)
  private setTabs!: any

  @Action('getJobList', MODULE_NAMESPACE.develop_v3)
  private getJobList!: any

  private mounted() {
    // 添加监听url变化
    window.addEventListener('hashchange', e => this.onHashChanged(e))
    // 添加监听页面关闭事件
    window.addEventListener('beforeunload', e => this.beforeunloadHandler(e))
    if (this.activeTab) {
      this.tab = this.tabs.find(t => t.name === this.activeTab) || null
      this.executeCommand(EDITOR_CMD.init)
      this.$nextTick(() => {
        Bus.$emit(JOB_EVENTS.mount)
      })
    }
    this.refTabs = this.$refs.tabs as any
  }

  private beforeDestroy() {
    // 防止没有权限还会提示任务保存成功
    if (this.projectPermission) {
      this.executeCommand(EDITOR_CMD.save)
    }

    this.folderModalInstance && this.folderModalInstance.hide()
    this.folderModalInstance = null
    this.deployModalInstance && this.deployModalInstance.hide()
    this.deployModalInstance = null
    this.jobModalInstance && this.jobModalInstance.hide()
    this.jobModalInstance = null
    window.removeEventListener('hashchange', e => this.beforeRemoveUnload(e))
    window.removeEventListener('beforeunload', e => this.beforeRemoveUnload(e))
  }

  private onHashChanged(e) {
    /*let tabsNameArr:any = []
    this.tabs.forEach(i => {
      tabsNameArr.push(i.name)
    })
    console.log(tabsNameArr,'tabsNameArr11111')
    console.log(tabsNameArr.includes(this.activeTab),'tabsNameArr.includes(this.activeTab)')
    if (!tabsNameArr.includes(this.activeTab)) {
      return
    }*/
    let tabsNameArr: any = []
    this.checkUrlJobId()
    const arr: ITab[] = []
    if (this.tabs.length !== 0) {
      this.tabs.forEach(i => {
        tabsNameArr.push(i.name)
        if (i.name !== this.urlJobId) {
          arr.push(i)
        }
      })
    }
    // 部署上线后再进项目，任务名为空
    if (!tabsNameArr.includes(this.activeTab)) {
      const tabUrlJob = { name: this.urlJobId, label: this.urlJobName, type: this.urlJobType }
      arr.push(tabUrlJob)
      this.setTabs(arr)
    }
  }

  private beforeunloadHandler(e) {
    this.executeCommand(EDITOR_CMD.save)
    setTimeout(() => {
      return true
    }, 500)
    // if (this.hasModified()) {
    //   this.executeCommand(EDITOR_CMD.save);
    //   return true;
    // }
  }

  private beforeRemoveUnload(e) {
    console.log('beforeRemoveUnload')
  }

  private resize() {
    const tabs = this.$refs.tabs as any
    tabs && tabs.resize && tabs.resize()
  }

  private createFolder() {
    if (!this.folderModalInstance) {
      this.folderModalInstance = this.$createModalInstance(MODAL_TYPE.createFolder_v3)
    }
    this.folderModalInstance &&
      this.folderModalInstance.show(
        {
          type: 'JOB',
          position: -1
        },
        async (args: any) => {
          try {
            await this.$request('createDirectory', {
              name: args.folderName,
              parentId: args.position,
              dirType: args.type
            })
            await this.getJobList()
            this.$ndcmessage.success('新建文件夹成功')
            return true
          } catch (e) {
            this.folderModalInstance && this.folderModalInstance.setError(e.message)
          }
        }
      )
  }

  private createJob(val: string) {
    // if (this.isFolderEmpty) {
    //   return this.$ndcconfirm({
    //     content: '请先建一个文件夹',
    //     cancelButton: ''
    //   });
    // }
    this.create({
      type: val
    })
  }

  private async copyJob() {
    try {
      const jobDetail: IJob = await this.$request('getJobDetail', {
        jobId: this.activeTab
      }) // 获取当前任务信息
      jobDetail.jobName = jobDetail.jobName + '_copy'
      this.create(jobDetail, true)
    } catch (e) {
      this.$handleException(e, '任务复制失败')
    }
  }

  private create(data: any, isCopy: boolean = false) {
    if (!this.jobModalInstance) {
      this.jobModalInstance = this.$createModalInstance(MODAL_TYPE.createJob_v3)
    }
    this.jobModalInstance &&
      this.jobModalInstance.show(
        Object.assign({}, data, {
          isCopy,
          position: data.parentId,
          jobNames: this.jobNames,
          isRightClick: true
        }),
        async (args: any) => {
          try {
            this.jobModalInstance && this.jobModalInstance.showLoading()
            const params: any = {
              type: args.type || args.jobType,
              jobName: args.jobName,
              parentId: args.position,
              description: args.description,
              clusterId: args.clusterId,
              kernelId: args.kernelId,
              queueId: args.queueId,
              srcJobId: Number(this.activeTab)
            }
            if (args.clusterType && args.clusterType.toLocaleUpperCase() === 'K8S') {
              params.imageId = args.imageId
            }
            const job: IJob = await this.$request(isCopy ? 'copyJob' : 'createJob', params)
            if (isCopy) {
              await this.copyJobInfo(job, data)
            }
            // 上报新建任务埋点
            if (args.type === 'SQL') {
              await this.getJobList()
              trackEvent({ btn_title: '新建SQL任务按钮', btn_id: 'btn_001' }, 'btn_click')
            } else {
              await this.getJobList({ jobType: 'JAR' })
              trackEvent({ btn_title: '新建JAR任务按钮', btn_id: 'btn_002' }, 'btn_click')
            }
            this.$ndcmessage.success(isCopy ? '复制任务成功' : '新建任务成功')
            const { jobId, jobName, jobType } = job
            this.openNewTab({
              name: jobId.toString(),
              label: jobName,
              type: jobType
            })
            Bus.$emit(JOB_EVENTS.new, jobId.toString())
            return true
          } catch (e) {
            this.jobModalInstance && this.jobModalInstance.setError(e.message)
          } finally {
            this.jobModalInstance && this.jobModalInstance.hideLoading()
          }
        }
      )
  }

  /**
   * 复制任务需要复制关联标签，资源文件
   */
  private async copyJobInfo(job: IJob, data: any) {
    const params = this.getJobParams(data)
    const promiseArr = [this.$request('updateJob', Object.assign({}, job, params))]

    if (data.tagIds) {
      promiseArr.push(
        this.$request('linkTag', {
          objId: job.jobId,
          objType: 'JOB',
          tagIds: data.tagIds
        })
      )
    }
    if (data.fileList) {
      promiseArr.push(
        this.$request('updateDependency', {
          jobId: job.jobId,
          fileList: data.fileList.map((file: ISimpleFile) => file.id),
          mammutKyb: data.mammutKyb
        })
      )
    }
    return Promise.all(promiseArr)
  }

  private getJobParams(data: IJob) {
    if (data.jobType === 'SQL') {
      const { rawSql, runParameter = {}, extRunParameter } = data
      return {
        rawSql,
        extRunParameter,
        runParameter
      }
    }
    const { mainArgs, mainClass, extRunParameter, runParameter = {} } = data
    return {
      mainArgs,
      mainClass,
      extRunParameter,
      runParameter
    }
  }
  private openNewTab(tab: ITab) {
    if (!tab.name) {
      return
    }
    const tabs = cloneDeep(this.tabs)
    const index = tabs.findIndex(t => t.name === tab.name)
    const idx = tabs.findIndex(t => t.name === this.activeTab)
    if (index === -1) {
      if (idx !== -1) {
        tabs.splice(idx, 0, tab)
      } else {
        tabs.push(tab)
      }
      this.setTabs(tabs)
    }
    this.setActiveTab(tab.name)
  }

  private saveJob() {
    this.executeCommand(EDITOR_CMD.save)
  }

  private debugJobModal() {
    // 获取提交集群
    if (!this.deployModalInstance) {
      this.deployModalInstance = this.$createModalInstance(MODAL_TYPE.deployment)
    }
    this.deployModalInstance &&
      this.deployModalInstance.show(
        {
          tabs: 'JAR'
        },
        () => true
      )
  }

  private checkGrammar() {
    this.executeCommand(EDITOR_CMD.checkGrammar)
  }

  private releaseJob() {
    this.executeCommand(EDITOR_CMD.release)
  }

  private markJob() {
    this.executeCommand(EDITOR_CMD.mark)
  }

  private formatJob() {
    this.executeCommand(EDITOR_CMD.format)
  }

  public addResource() {
    this.executeCommand(EDITOR_CMD.resource)
  }

  private openSqlLink() {
    window.open('#/sloth/manual', '_blank')
  }

  private openJarLink() {
    window.open('http://gitlab.htzq.htsc.com.cn/pubdemo/realtime-dev-flink-demo/', '_blank')
  }

  public getDebugingJob() {
    return this.debugingJob
  }

  private onDebugChange(val: string) {
    this.debugingJob = val
  }

  private onIdeModified(val: boolean) {
    const tab = val ? this.activeTab : ''
    this.refTabs && this.refTabs.setModifiedTab(tab)
  }

  private onTabChange(tab: string) {
    this.setActiveTab(tab)
    this.$nextTick(() => {
      this.executeCommand(EDITOR_CMD.resize)
    })
  }

  private onTabClose(tab: string) {
    this.closeCurrentTab(tab)
  }

  private onBeforeLeave(tab: string) {
    if (this.canClose()) {
      // 离开前需要先判断是否需要保存
      if (this.hasModified()) {
        this.executeCommand(EDITOR_CMD.save)
        return true
      }
    }
    return true
  }

  private onBeforeClose(tab: string) {
    if (!this.canClose()) {
      return false
    }
    // 离开前需要先判断是否需要保存
    if (this.hasModified()) {
      this.executeCommand(EDITOR_CMD.save)
      return true
    }
    return true
  }

  private canClose(tab: string = ''): boolean {
    tab = tab || this.activeTab
    const panels = this.$refs['panel_' + tab] as MIdePanel[]
    if (panels && panels.length) {
      const idePanel = panels[0]
      return idePanel.canClose()
    }
    return true
  }

  private hasModified(tab: string = ''): boolean {
    tab = tab || this.activeTab
    const panels = this.$refs['panel_' + tab] as MIdePanel[]
    if (panels && panels.length) {
      const idePanel = panels[0]
      return idePanel.hasModified()
    }
    return false
  }

  private onTabRightClick(e: any) {
    e.event.preventDefault()
    this.selectedTab = e.tab
    if (!this.tabContextMenuInstance) {
      this.tabContextMenuInstance = this.$contextmenu(tabMenuItems, (item: IMenuItem, event: Event) => {
        this.closeTab(item.key)
      })
    }
    this.tabContextMenuInstance && this.tabContextMenuInstance.open(e.event)
  }

  private closeTab(key: string) {
    if (!this.selectedTab) {
      return
    }
    const tab = this.selectedTab
    this.selectedTab = ''
    if (key === 'current') {
      return this.closeCurrentTab(tab)
    }
    if (key === 'others') {
      return this.closeOtherTabs(tab)
    }
    this.closeRightTabs(tab)
  }

  private closeCurrentTab(tab: string) {
    const index = this.tabs.findIndex(t => t.name === tab)
    const tabs = this.tabs.concat()
    tabs.splice(index, 1)
    this.setTabs(tabs)
    if (this.activeTab === tab) {
      const activeTab: ITab | null = tabs.length === 0 ? null : tabs.length > index ? tabs[index] : tabs[tabs.length - 1]
      this.setActiveTab((activeTab && activeTab.name) || '')
    }
  }

  private closeOtherTabs(tab: string) {
    const tabs = this.tabs.filter(t => t.name !== tab)
    this.closeTabs(tabs)
    this.setTabs(this.tabs.filter(t => t.name === tab))
    this.setActiveTab(tab)
  }

  private closeRightTabs(tab: string) {
    const index = this.tabs.findIndex(t => t.name === tab)
    const tabs = this.tabs.slice(index)
    this.closeTabs(tabs)
    const activeIndex = this.tabs.findIndex(t => t.name === this.activeTab)
    if (activeIndex > index) {
      this.setActiveTab(tab)
    }
    const newTabs = this.tabs.slice(0, index + 1)
    this.setTabs(newTabs)
  }

  private closeTabs(tabs: ITab[] = []) {
    // 判断任务是否已保存，未保存则需要手动调用保存
    for (let i = 0, len = tabs.length; i < len; i++) {
      const tab = tabs[i]
      const isModified = this.hasModified(tab.name)
      if (isModified) {
        const panels = this.$refs['panel_' + tab.name] as MIdePanel[]
        if (panels && panels.length) {
          const idePanel = panels[0]
          idePanel.executeCommand(EDITOR_CMD.save)
        }
      }
    }
  }

  private onCloseDetail() {
    this.detailVisible = false
    this.$nextTick(() => {
      this.executeCommand(EDITOR_CMD.resize)
    })
  }
}
</script>

<style lang="scss" scoped>
.m-ide {
  $color: var(--color, #3b68b7);
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  background-color: #fafafa;
  &-job {
    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;
  }
  .ndc-tabs .ndc-dropdown {
    position: relative !important;
    top: 0px;
    right: -1px;
    .icon {
      display: inline-block !important;
      margin-right: 5px;
    }
  }
  &-toolbar {
    position: relative;
    height: 36px;
    box-sizing: border-box;
    // padding: 0 16px;
    display: flex;
    align-items: center;
    overflow: hidden;
    font-size: 12px;
    border-bottom: 1px solid #ccc;
    background-color: #f9f9f9;
    .u-text-button {
      .icon {
        margin-right: 5px;
      }
      span {
        margin-top: 2px;
        font-size: 14px;
      }
    }

    #developmentManual-sql {
      position: absolute;
      right: 45px;
      span {
        margin-right: 5px;
      }
    }
    #developmentManual-jar {
      position: absolute;
      right: 45px;
      span {
        margin-right: 5px;
      }
    }
    // 新增 全屏按钮
    .quanpin {
      position: absolute;
      top: 4px;
      right: 5px;
      width: 28px;
      height: 28px;
      // border: 1px dashed;
      .btn-quanpin {
        margin: 2px 2px;
      }
    }
  }
  &-tabs {
    flex: 1;
    height: 0;
    /deep/ .ndc-tabs {
      .ndc-tabs-card {
        padding: unset;
        background: #f3f3f3;
        height: 28px;
        // 新增的 + 号
        // &::after {
        //   position: absolute;
        //   margin-right: 24px;
        //   content: '+';
        //   top: 0;
        //   right: 0;
        //   width: 28px;
        //   height: 26px;
        //   background: #f3f3f3;
        //   text-align: center;
        //   border-left: 1px solid #cccccc;
        //   border-right: 1px solid #cccccc;
        //   line-height: 22px;
        //   // cursor: pointer;
        //   // border-radius: 2px;
        // }
        .tab-split:after {
          height: 100%;
        }
        .tab {
          height: 100%;
          padding: 0 26px 0 8px;
          border-radius: unset;
          color: #2b2b2b;
          background-color: #f3f3f3;
          // .notactive:not(:hover):not(:first-of-type):after {
          //   display: none;
          // }
          // .closable {
          //   padding-right: 46px;
          // }
          .tab-close {
            right: 5px;
            // 去掉关闭按钮圆角
            border-radius: unset;
            &:after {
              display: none;
            }
          }
          .label {
            span {
              text-align: unset;
            }
          }
          &::before {
            position: absolute;
            content: '';
            width: 100%;
            height: 0;
            background: $color;
            top: -1px;
            left: 0;
          }
          &.active {
            background-color: #f9f9f9;
            border: 1px solid #cccccc;
            border-bottom: unset;
            &:before {
              height: 3px;
            }
            &:after {
              display: none;
            }
          }
          &.notactive {
            border-bottom: 1px solid #cccccc;
          }
        }
      }
    }
  }
  &-main {
    height: calc(100% - 36px);
  }
  &-detail {
    flex-shrink: 0;
    display: flex;
    flex-direction: column;
    height: 350px;
    border-top: $border;
    box-sizing: border-box;
    background: #fff;
    z-index: 20;
    .console-header {
      line-height: 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .console-body {
      flex: 1;
      height: 0;
    }
  }
  &-new {
    width: 100%;
    flex: 1;
    height: 0;
    display: flex;
    position: relative;
    justify-content: space-around;
    .new-item-box {
      padding: 0 calc(0.39 * (100% - 800px));
      position: absolute;
      left: 0;
      top: calc((100% - 240px) * 0.35);
      width: 100%;
      height: 240px;
      /*background-color: #CC3541;*/
      display: flex;
      justify-content: space-around;
      .new-item {
        width: 400px;
        height: 240px;
        box-shadow: 0px 6px 12px 0px rgba(0, 0, 0, 0.12);
        border-radius: 6px;
        // border: 2px solid #3B68B7;
        background-color: #fff;
        cursor: pointer;
        text-align: center;
        /*display: flex;*/
        /*flex: none;*/
        /*flex-direction: column;*/
        /*align-items: center;*/
        /*& + .new-item {*/
        /*  margin-left: 80px;*/
        /*}*/
        .ndc-button {
          margin-top: 17px;
          width: 160px;
          height: 44px;
        }
        .newTaskBtn {
          background-color: #fff;
          border: 1px solid #3b68b7;
          color: #3b68b7;
          &:hover {
            border-color: #3b68b7;
            color: #3b68b7;
            background-color: #3b68b7;
            color: #fff;
          }
        }
        &-sql {
          background-color: #fff;
          &:hover {
            border: 2px solid #3b68b7;
          }
        }
        &-jar {
          &:hover {
            border: 2px solid #3b68b7;
          }
        }
        img {
          display: flex;
          margin: 37px auto 0;
          width: 120px;
          height: 114px;
          margin-top: 37px;
        }
      }
    }
    .plate {
      position: absolute;
      width: 300px;
      height: 200px;
      overflow: hidden;
      bottom: 25px;
      right: 48px;
      img {
        width: 100%;
        height: 100%;
      }
    }
    .bg {
      position: absolute;
      height: 154px;
      bottom: 0;
      width: 100%;
      overflow: hidden;
      img {
        float: right;
        height: 154px;
      }
    }
  }
  &-editor {
    .monaco-editor {
      .overflow-guard {
        height: 600px;
        border-left: 1px solid #cccccc;
      }
      // .editor-scrollable {
      //   height: 600px !important;
      // }
    }
  }
}
.ndc-modal-wrapper {
  .ndc-modal-main {
    .ndc-modal-header {
      // background-color: #eeeeee;
      // height: 40px;
      // .content{
      //   &::before{
      //     content: '提示';
      //     position: absolute;
      //     // top:12px;
      //     left: 20px;
      //     font-size: 16px;
      //     font-family: MicrosoftYaHei;
      //     color: #152038;
      //   }
      // }
    }
  }
}

:root {
  --color: #3b68b7;
}
</style>

<template>
  <div class="m-ide-panel" v-if="isInit">
    <!-- 编辑区 -->
    <div class="m-ide-editor">
      <div class="m-ide-jar" v-if="job.jobType === 'JAR'">
        <div class="m-ide-title">基础配置</div>
        <ndc-form>
          <ndc-form-item label="JAR任务包:" required>
            <span class="g-mr-16 g-text-nowrap" v-if="job.flinkJarName" :title="job.flinkJarName">{{ job.flinkJarName }}</span>
            <ndc-file
              class="g-fs-0"
              auto-reset
              media-type="application/java-archive,.jar"
              button-text="本地浏览"
              :loading="isUploading"
              v-show="this.devTestOpCodesFlag"
              @change="onChangeJarFile"
              @error="onFileError"
            ></ndc-file>
            <!-- <ndc-button v-if="!isUploading" class="g-ml-16 g-fs-0" @click="selectSourceFile">站内选择</ndc-button> -->
            <ndc-button class="g-ml-16 g-fs-0 configureBtn" v-if="job.flinkJarName && !isUploading" @click="download">下载</ndc-button>
            <span class="error" v-if="errorText">{{ errorText }}</span>
          </ndc-form-item>
          <ndc-form-item v-if="job.flinkJarMd5" label="MD5:">
            <span>{{ job.flinkJarMd5 }}</span>
          </ndc-form-item>
          <ndc-form-item label="main.class:">
            <input class="ndc-input ndc-input-xl" v-model="mainClass" placeholder="请输入 main.class" style="width: 464px;" @change="onChangeMainClass" :disabled="!devTestOpCodesFlag" />
          </ndc-form-item>
          <ndc-form-item label="main.args:">
            <input class="ndc-input ndc-input-xl" v-model="mainArgs" placeholder="请输入 main.args" style="width: 464px;" @change="onChangeMainArgs" :disabled="!devTestOpCodesFlag" />
          </ndc-form-item>
          <ndc-form-item label="上传人:">
            <span>{{ job.uploader }}</span>
          </ndc-form-item>
          <ndc-form-item label="上传时间:">
            <span>{{ job.uploadTime }}</span>
          </ndc-form-item>
          <ndc-form-item>
            <ndc-button @click="release" class="configureBtn" :disabled="this.devdeployOpCodesFlag === false">部署上线</ndc-button>
          </ndc-form-item>
        </ndc-form>
      </div>

      <m-sql-editor v-if="job.jobType === 'SQL'" ref="editor" v-model="job.rawSql" @editor-format="format" @change="onChangeSql" @save="save"></m-sql-editor>
    </div>
    <!-- <m-database @getJobDetail="getJobDetail" style="display:none"></m-database> -->
    <!-- 控制台 -->
    <div class="m-ide-line" v-show="consoleVisible" :style="lineStyle" @mousedown="onMouseDown">
      <img src="../../../../assets/images/slide.svg" alt="" />
    </div>
    <div class="m-ide-console" v-show="consoleVisible" :style="consoleStyle">
      <div class="ndc-icon-close" @click="consoleVisible = false"></div>
      <span class="circlePoint"></span>
      <!-- <img
        v-if="isDebug"
        class="fullscreen"
        src="../../../../assets/images/full-screen.svg"
        @click="handleFullScreen"
      /> -->
      <ndc-tabs v-if="isDebug" is-card :tabs="debugTabs" v-model="activeTab" @change="onDebugTabChange" id="debugTabTag">
        <!-- <ndc-tab class="circlePoint"></ndc-tab> -->
        <ndc-tab-panel class="debug-result" v-for="(item, index) in (debugResult && debugResult.results) || []" :key="index" :name="item.tableName">
          <table :class="item.fields.length > 15 ? 'ndc-table-long' : 'ndc-table'">
            <thead>
              <tr>
                <th v-for="th in item.fields" :key="th" :title="th">{{ th }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(tr, idx) in item.values" :key="idx">
                <td v-for="(val, validx) in tr" :key="validx" :title="val">{{ val }}</td>
              </tr>
            </tbody>
          </table>
        </ndc-tab-panel>
        <ndc-tab-panel name="log">
          <m-log-editor ref="debugEditor" :logs="debugResult.log || ''"></m-log-editor>
        </ndc-tab-panel>
        <u-loading v-if="isDebuging" loading-text="调试进行中，请稍候..."></u-loading>
      </ndc-tabs>
      <ndc-tabs v-else is-card :tabs="checkTabs" value="check">
        <ndc-tab-panel name="check">
          <m-log-editor ref="checkEditor" :logs="checkResult || ''"></m-log-editor>
          <u-loading v-if="isChecking" :loading-text="isDebugger ? '正在进行语法检查，稍后进行调试...' : '正在进行语法检查，请稍后...'"></u-loading>
        </ndc-tab-panel>
      </ndc-tabs>
    </div>

    <!-- 侧边栏 -->
    <div class="m-ide-sidebar">
      <m-sidebar ref="sidebar" :job="job" @extend-change="onChangeExtRunParameter" @params-change="onChangeRunParameter" @resource-change="onChangeResource"></m-sidebar>
    </div>
    <!--    <m-baseinfo :job="job" ></m-baseinfo>-->
    <!--    <m-test :job="job" style="display: none"></m-test>-->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Provide, Watch, Inject } from 'vue-property-decorator'
import MSqlEditor from '../sql-editor/index.vue'
import MLogEditor from '../log-editor/index.vue'
import MSidebar from '../sidebar/index.vue'
import MDebugModal from '../debug-modal/debug.vue'

import { IJob, IVersion, ITab, IDebugFile, ITag, IDebugResult, ISimpleFile } from '@utils/types'
import { debounce, cloneDeep, isEqual } from 'lodash'
import { EDITOR_CMD } from '../../constant'
import MIde from '../../ide_sql.vue'
import { State, Action } from 'vuex-class'
import createDebugModal from '../debug-modal'
import MTagModal from '../tag-modal/tag.vue'
import ModalMixin from '../../../components/modal/mixin'
import { MODAL_TYPE } from '../../../components/modal/constant'
import { MODULE_NAMESPACE } from '@utils/constant'
import { isTmNumberExist, genFileMd5, getBlockMeta, uploadBlock, notifyBlock } from '../../utils'
import MJarModal from '../../../components/modal/jar.vue'
// 导入基本信息
import MBaseinfo from '../baseinfo/index.vue'
import Bus from '@/bus'
import { trackEvent } from '@/utils/trackEvent'

const DEBUG_TABS: ITab[] = [
  {
    name: 'log',
    label: '运行日志'
  }
]

const CHECK_TABS: ITab[] = [
  {
    name: 'check',
    label: '语法检查'
  }
]

@Component({
  components: {
    MSqlEditor,
    MLogEditor,
    MSidebar,
    MBaseinfo
  }
})
export default class MIdePanel extends Vue {
  @Prop({
    default: ''
  })
  jobId!: number
  // ide-sql 传值权限
  //     部署权限
  @Prop({
    default: false
  })
  private devdeployOpCodesFlag!: boolean
  // 开发测试权限
  @Prop({
    default: false
  })
  private devTestOpCodesFlag!: boolean
  @Provide()
  private idePanel = this

  @Inject('ide')
  private ide!: MIde

  @State('tagList', MODULE_NAMESPACE.develop_v3)
  private tagList!: ITag[]
  private created() {
    // this.showReleaseJob()
    // console.log(this.job,'ide-panelJob11111111111111')
  }
  // @State('userName', MODULE_NAMESPACE.global)
  private userName: string = JSON.parse(<string>localStorage.getItem('userInfo')).name
  // 新增获取权限操作码
  // private opCodesFlag: Boolean = false;
  // // 根据用户权限操作码，选择部署上线是显示还是隐藏
  // private async showReleaseJob() {
  //   let result = await getOpCodes({});
  //   console.log(result.opCodes, 'result.opCodes123')
  //   if (result.opCodes.includes('rtdev_proj.devdeploy')) {
  //     this.opCodesFlag = true
  //   } else {
  //     this.opCodesFlag = false
  //   }
  // }

  private job: IJob = {
    jobId: -1,
    jobName: '',
    clusterId: null,
    clusterType: 'YARN',
    kernelId: null,
    queueId: null,
    jobType: '',
    rawSql: ''
  }
  private originalJob?: IJob
  private height: number = 350
  private isModified: boolean = false
  private consoleVisible: boolean = false
  private debounceAutoSave: any
  private debounceAutoSave_1: any
  private debounceResize: any
  private editor?: any
  private isInit: boolean = false
  private isDebug: boolean = false
  private debugTabs: ITab[] = DEBUG_TABS
  private checkTabs: ITab[] = CHECK_TABS
  private activeTab: string = 'log'
  private checkResult: string = ''
  private debugResult: any = {}
  private isChecking: boolean = false
  private isDebuging: boolean = false
  private jarFile: File | null = null
  private isUploading: boolean = false
  private errorText: string = ''
  private mainClass: string = ''
  private mainArgs: string = ''
  private linkModalInstance: ModalMixin | null = null
  private resourceModalInstance: ModalMixin | null = null
  private debugModalInstance: MDebugModal | null = null
  private jarModalInstance: MJarModal | null = null
  private deployModalInstance: ModalMixin | null = null
  private fileType: string = 'local' // local: 本地，online: 在线

  @Watch('consoleVisible')
  private onConsoleVisibleChanged(val: boolean) {
    this.$nextTick(() => {
      this.resize()
    })
  }

  @Watch('isModified')
  private onIsModifiedChanged(val: boolean) {
    this.$emit('ide-modified', val)
  }

  @Watch('job.updateTime')
  private onUpDateTimeChange() {
    Bus.$emit('base_job_info', this.job)
  }

  private get consoleStyle() {
    return {
      height: this.height + 'px'
    }
  }

  private get lineStyle() {
    return {
      bottom: this.height + 'px'
    }
  }

  @Action('getJobList', MODULE_NAMESPACE.develop_v3)
  private getJobList: any

  public executeCommand(cmd: number, args?: any) {
    switch (cmd) {
      case EDITOR_CMD.init:
        this.init()
        break
      case EDITOR_CMD.resize:
        this.resize()
        break
      case EDITOR_CMD.format:
        this.format()
        break
      case EDITOR_CMD.debug:
        this.debug()
        break
      case EDITOR_CMD.checkGrammar:
        this.checkGrammar()
        break
      case EDITOR_CMD.deploy:
        this.deploy()
        break
      // case EDITOR_CMD.autoSave:
      //   this.autoSave();
      //   break;
      case EDITOR_CMD.save:
        this.save()
        break
      case EDITOR_CMD.release:
        this.release()
        break
      case EDITOR_CMD.rollback:
        this.rollback(args)
        break
      case EDITOR_CMD.mark:
        this.mark()
        break
      case EDITOR_CMD.resource:
        this.addResource()
        break
      case EDITOR_CMD.quote:
        this.quote(args)
        break
      default:
        break
    }
  }

  public hasModified(): boolean {
    return this.isModified
  }

  public canClose(): boolean {
    if (this.job.jobType === 'JAR' && this.isUploading) {
      // JAR 任务包上传过程中，不能关闭任务
      this.$ndcconfirm({
        content: 'JAR任务包上传中，请勿关闭',
        cancelButton: ''
      })
      return false
    }
    return true
  }

  public genCompareParams(isCompare: boolean = false) {
    const sidebar = this.$refs.sidebar as any
    const runParameter = (sidebar && sidebar.getRunParameter(isCompare)) || ''
    const extRunParameter = (sidebar && sidebar.getExpandParameter()) || ''
    const { resourceDesc, tmMemory } = (sidebar && sidebar.getResourceDesc()) || {}
    if (resourceDesc) {
      delete runParameter['tm.memory']
    } else {
      runParameter['tm.memory'] = tmMemory
    }
    if (this.job.jobType === 'SQL') {
      return {
        rawSql: this.job.rawSql,
        runParameter,
        extRunParameter,
        fileList: this.job.fileList,
        resourceDesc
      }
    }
    const { mainClass, mainArgs, flinkJarPath, flinkJarName, flinkJarResId, flinkJarMd5, fileList } = this.job
    return {
      mainClass,
      mainArgs,
      flinkJarPath,
      flinkJarName,
      flinkJarResId,
      flinkJarMd5,
      runParameter,
      extRunParameter,
      fileList,
      resourceDesc
    }
  }

  private mounted() {
    this.debounceResize = debounce(this.resize, 300)
    this.debounceAutoSave = debounce(this.autoSave, 2000) // 停止编辑后5秒，自动保存
    this.debounceAutoSave_1 = debounce(this.autoSave, 5000) // 停止编辑后2秒，自动保存
  }

  private beforeDestroy() {
    this.linkModalInstance && this.linkModalInstance.hide()
    this.linkModalInstance = null
    this.resourceModalInstance && this.resourceModalInstance.hide()
    this.resourceModalInstance = null
    this.deployModalInstance && this.deployModalInstance.hide()
    this.deployModalInstance = null
    this.jarModalInstance && (this.jarModalInstance as any).hide()
    this.jarModalInstance = null
  }

  private init() {
    if (!this.jobId) {
      return
    }
    if (!this.isInit) {
      this.isInit = true
      this.$nextTick(() => {
        this.getJobDetail()
      })
    }
  }

  private async getJobDetail() {
    try {
      this.job = await this.$request('getJobDetail', { jobId: this.jobId })
      if (!this.job) {
        throw new Error('任务获取失败')
      }
      this.fileType = this.job.flinkJarResId ? 'online' : 'local'
      this.job.runParameter = this.job.runParameter || {}
      if (this.job.jobType === 'SQL') {
        this.$nextTick(() => {
          this.editor = this.$refs.editor as MSqlEditor
        })
        if (!this.job.rawSql) {
          this.job.rawSql = `--SQL
--********************************************************************--
--作者: ${this.userName}
--创建时间: ${new Date().format('YYYY-MM-DD HH:mm:ss')}
--注释: 请输入业务注释信息
--********************************************************************--
`
        }
      } else {
        this.mainClass = this.job.mainClass || ''
        this.mainArgs = this.job.mainArgs || ''
      }
      this.originalJob = cloneDeep(this.job)
    } catch (e) {
      this.isInit = false
      this.$handleException(e)
    }
  }

  private setModified(val: any, fieldName: string) {
    if (this.originalJob && ((fieldName === 'runParameter' && this.compareRunParameter(val)) || (fieldName !== 'runParameter' && val !== this.originalJob[fieldName]))) {
      this.job[fieldName] = val
      if (this.job.jobType === 'JAR') {
        !this.job.flinkJarPath && !this.job.flinkJarResId ? this.isModified = false : this.isModified = true
      } else {
        this.isModified = true
      }
      // this.isModified = true
      // this.debounceAutoSave()
      if (fieldName === 'rawSql') {
        this.debounceAutoSave_1()
      } else {
        this.debounceAutoSave()
      }
    }
  }


  private compareRunParameter(runParameter: any): boolean {
    if (!this.originalJob) {
      return true
    }
    if (this.originalJob.clusterType !== runParameter.clusterType || this.originalJob.clusterId !== runParameter.clusterId || this.originalJob.queueId !== runParameter.queueId) {
      return true
    }
    if (this.originalJob.clusterType && this.originalJob.clusterType.toLocaleUpperCase() === 'YARN' && this.originalJob.kernelId !== runParameter.kernelId) {
      return true
    }
    if (this.originalJob.clusterType && this.originalJob.clusterType.toLocaleUpperCase() === 'K8S' && this.originalJob.imageId !== runParameter.imageId) {
      return true
    }
    const oldRunParameter: any = this.originalJob.runParameter
    if (!oldRunParameter) {
      return true
    }
    const keys = this.job.jobType === 'SQL' ? ['checkpointInterval', 'env.parallelism', 'trigger.interval', 'state_ttl'] : ['parallelism', 'jm.memory', 'slot']
    if (this.originalJob.clusterType && this.originalJob.clusterType.toLocaleUpperCase() === 'K8S') {
      keys.push('tm.cpu')
    }
    // if (this.originalJob.kernelName === 'SLOTH_FLINK_SQL_1100' || runParameter.kernelName === 'SLOTH_FLINK_SQL_1100') {
    //   keys.push('zone_offset.of_hour')
    // }
    if (
      this.originalJob.kernelName === 'flink-1.10.0-ne' ||
      this.originalJob.kernelName === 'flink-1.12.2' ||
      runParameter.kernelName === 'flink-1.10.0-ne' ||
      runParameter.kernelName === 'flink-1.12.2'
    ) {
      keys.push('zone_offset.of_hour')
    }
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i]
      if (oldRunParameter[key] !== runParameter[key]) {
        return true
      }
    }
    if (isTmNumberExist(this.job) && isTmNumberExist(this.originalJob) && oldRunParameter['tm.number'] !== runParameter['tm.number']) {
      return true
    }
    return false
  }

  private resize() {
    if (this.ide && (this.ide as any).detailVisible) {
      const el = this.$el as HTMLElement
      const elHeight = el.clientHeight
      if (this.height > elHeight - 100) {
        this.height = elHeight - 100
        return
      }
    }
    if (this.consoleVisible) {
      const editor: MLogEditor = this.$refs[this.isDebug ? 'debugEditor' : 'checkEditor'] as MLogEditor
      editor && (editor as any).resize()
    }
    this.editor && this.editor.resize()
  }

  private format() {
    this.editor && this.editor.executeCommand('format')
  }

  private isDebugger: boolean = false
  private async debug() {
    const debugingJob = this.ide && (this.ide as any).getDebugingJob()
    if (debugingJob) {
      this.$ndcconfirm({
        content: '调试进行中',
        desc: `任务 ${debugingJob} 正在调试中，不可新开调试。`,
        cancelButton: ''
      })
    } else {
      this.checkGrammar(true)
      this.isDebugger = true
      // this.checkGrammar()

      /*      // this.consoleVisible = true
            // this.isChecking = true
            if(this.sqlFileIsNull()){
      /!*        this.checkResult = 'sql任务不能只为注释或者空';
              this.isChecking = false;*!/
              this.$ndcconfirm({
                content: '语法检查错误',
                desc: `sql任务不能只为注释或者空`,
                cancelButton: ''
              })
            }else {
              try {
                // 调试任务前需要先做语法检查
                await this.$request('checkGrammar', {
                  jobId: this.jobId,
                  rawSql: this.job.rawSql,
                  fileList: (this.job.fileList || []).map(file => file.id),
                  kernelId: this.job.kernelId
                })
                await this.save() // 调试前需要先保存任务
                if (!this.debugModalInstance) {
                  this.debugModalInstance = createDebugModal()
                }
                this.debugModalInstance && (this.debugModalInstance as any).show(this.jobId, this.onUploadFile)
              } catch (e) {
                this.$handleException(e, '语法检查失败，不能调试')
              }
              // this.isChecking = false
            }*/
    }
  }

  private async checkGrammar(debuger: boolean = false, deploy: boolean = false, callback: Function = (null as unknown) as Function) {
    this.isDebug = false
    // if (!debuger) this.consoleVisible = true
    this.consoleVisible = true
    this.isChecking = true
    if (this.sqlFileIsNull()) {
      this.consoleVisible = true
      this.checkResult = 'sql任务不能只为注释或者空'
      this.isChecking = false
    } else if (!this.sqlLastCharacter()) {
      this.consoleVisible = true
      this.checkResult = '最后一行sql语句结束缺少 ; 或者是 ; 后以注释结尾'
      this.isChecking = false
    } else {
      try {
        const result = await this.$request('checkGrammar', {
          jobId: this.jobId,
          rawSql: this.job.rawSql,
          fileList: (this.job.fileList || []).map(file => file.id),
          kernelId: this.job.kernelId
        })
        this.checkResult = result || '语法检查通过'
        if (debuger) {
          if (this.checkResult === '语法检查通过') {
            this.consoleVisible = false
            await this.save() // 调试前需要先保存任务
            if (!this.debugModalInstance) {
              this.debugModalInstance = createDebugModal()
            }
            const sidebar = this.$refs.sidebar as MSidebar
            if (!sidebar || !(sidebar as any).isParameterComplete()) {
              return
            } else {
              this.debugModalInstance && (this.debugModalInstance as any).show(this.jobId, this.onUploadFile)
            }
            // 调试双弹框问题
            // this.debugModalInstance && (this.debugModalInstance as any).show(this.jobId, this.onUploadFile)
          }
        }
        if (deploy) {
          if (this.checkResult === '语法检查通过') {
            // 获取提交集群
            this.consoleVisible = false
            await this.save()
            const tabs = (this.job && this.job.jobType) || null
            if (!this.deployModalInstance) {
              this.deployModalInstance = this.$createModalInstance(MODAL_TYPE.deployment)
            }
            this.deployModalInstance &&
              this.deployModalInstance.show(
                {
                  tabs
                },
                () => true
              )
          }
        }
        if (callback) {
          this.consoleVisible = false
          callback()
        }
      } catch (e) {
        if (callback) {
          this.$ndcconfirm({
            content: '语法检查',
            desc: '语法检查失败',
            cancelButton: '取消'
          })
        }
        this.consoleVisible = true
        this.checkResult = e.message
      } finally {
        this.isChecking = false
        this.isDebugger = false
      }
    }
  }

  // 判断sql文件 是否为空
  private sqlFileIsNull() {
    let str = (this.job.rawSql as string).split('\n') as string[]
    let count = 0
    str.forEach(row => {
      if ((row.trim().charAt(0) === '-' && row.trim().charAt(1) === '-') || row.trim() === '') {
        count++
      }
    })
    return count === str.length
  }
  //判断sql文件 最后一行最后一位是否没有分号
  private sqlLastCharacter() {
    let str = (this.job.rawSql as string).split('\n') as string[]
    let LastCharacterFlag: boolean = false
    let sqlArr: any = []
    str.forEach(row => {
      if ((row.trim().charAt(0) === '-' && row.trim().charAt(1) === '-') || row.trim() === '') {
        return
      } else if (row.length === 0) {
        return
      } else {
        sqlArr.push(row)
      }
    })
    // 去除行内注释，进行语法检查
    let reg = new RegExp("\-\-([^'\r\n]*('[^'\r\n]*')?[^'\r\n]*)*$")
    let lastSql = reg.exec(sqlArr[sqlArr.length - 1].trim())
    if (sqlArr[sqlArr.length - 1].trim().slice(-1) === ';') {
      return (LastCharacterFlag = true)
    } else if (lastSql && lastSql.length && lastSql[0].includes('--')) {
      return (LastCharacterFlag = false)
    } else if (sqlArr[sqlArr.length - 1].trim().includes('*/')) {
      return (LastCharacterFlag = true)
    }
  }

  private async autoSave() {
    if (!this.isModified || (this.job.jobType === 'JAR' && (this.isUploading || (!this.job.flinkJarPath && !this.job.flinkJarResId)))) {
      return
    }
    const sidebar = this.$refs.sidebar as MSidebar
    if (!sidebar || !(sidebar as any).isParameterComplete()) {
      return
    }
    try {
      const job: IJob = await this.$request('updateJob', this.genParams())
      this.job.updateTime = job.updateTime
      this.originalJob = cloneDeep(this.job)
      this.$ndcmessage.success('自动保存成功')
      this.isModified = false
    } catch (e) {
      this.$ndcmessage.error('自动保存失败')
    }
  }

  private async save() {
    const func = async () => {
      try {
        const job: IJob = await this.$request('updateJob', this.genParams())
        this.job.updateTime = job.updateTime
        this.originalJob = cloneDeep(this.job)
        this.isModified = false
        trackEvent({ btn_title: '保存按钮', btn_id: 'btn_005' }, 'btn_click')
        this.$ndcmessage.success('任务保存成功')
      } catch (e) {
        this.$handleException(e, '任务保存失败')
      }
    }

    const sidebar = this.$refs.sidebar as MSidebar

    if (!sidebar || !(sidebar as any).isParameterComplete()) {
      return this.$ndcconfirm({
        content: '保存失败',
        desc: '配置检查不通过，请到运行参数中完善配置',
        cancelButton: ''
      })
    }

    if (this.job.jobType === 'JAR') {
      if (this.isUploading) {
        this.errorText = ''
        this.$ndcmessage.warning('JAR任务包正在上传...')
        return
      }
      if (this.job.flinkJarPath || this.job.flinkJarResId) {
        this.errorText = ''
        return func()
      }
      this.errorText = 'JAR任务包不能为空'
      return
    }

    return func()
  }

  private genParams() {
    const sidebar = this.$refs.sidebar as MSidebar
    const parameter: any = (sidebar && (sidebar as any).getRunParameter()) || {}
    const extRunParameter = (sidebar && (sidebar as any).getExpandParameter()) || ''
    const { clusterId, clusterType, kernelId, imageId, queueId, ...runParameter } = parameter
    const { resourceDesc, tmMemory } = (sidebar && (sidebar as any).getResourceDesc()) || {}
    if (resourceDesc) {
      delete runParameter['tm.memory']
    } else {
      runParameter['tm.memory'] = tmMemory
    }
    const params: any =
      this.job.jobType === 'SQL'
        ? {
            runParameter,
            clusterId,
            clusterType,
            kernelId,
            queueId,
            extRunParameter,
            resourceDesc
          }
        : {
            runParameter,
            clusterId,
            clusterType,
            kernelId,
            queueId,
            extRunParameter,
            mainClass: this.mainClass,
            mainArgs: this.mainArgs,
            resourceDesc
          }
    if (clusterType && clusterType.toLocaleUpperCase() === 'K8S') {
      params.imageId = imageId
    }
    return Object.assign(this.job, params)
  }

  private release() {
    const fnc = () => {
      const sidebar = this.$refs.sidebar as MSidebar
      if (sidebar && (sidebar as any).isParameterComplete()) {
        this.releaseJob()
      } else {
        this.$ndcconfirm({
          content: '上线失败',
          desc: '配置检查不通过，请到运行参数中完善配置',
          // desc: '当前调试未通过，确定部署上线吗？',
          cancelButton: '取消'
        })
      }
    }
    if (this.job.jobType === 'SQL') {
      if (this.isChecking) {
        return this.$ndcconfirm({
          content: '上线失败',
          desc: '任务正在进行语法检查',
          cancelButton: ''
        })
      }
      if (this.isDebuging) {
        return this.$ndcconfirm({
          content: '上线失败',
          desc: '任务正在调试',
          cancelButton: ''
        })
      }
      this.checkGrammar(false, false, fnc)
    }
    if (this.job.jobType === 'JAR') {
      if (this.job.flinkJarName === null) {
        return this.$message.error('部署上线失败，JAR任务包不能为空，请重新上传！')
      }
      if (this.job.mainClass === '') {
        return this.$message.error('部署上线失败，main.class不能为空，请重新上传！')
      }
      fnc()
    }
  }
  private deploy() {
    this.autoSave()
    this.checkGrammar(false, true)
  }
  private async releaseJob() {
    this.isModified = true
    this.autoSave()
    try {
      this.$ndcconfirm({
        content: '确定上线吗？',
        onConfirm: () => {
          this.confirmRelease()
        }
      })
    } catch (e) {
      this.$handleException(e, '上线失败')
    }
  }

  private async confirmRelease() {
    // 项目名
    const projectName = localStorage.getItem('sloth_projectName')
    // projectId
    const projectId = localStorage.getItem('sloth_projectId')
    // 用户id
    const userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser

    // 角色Id
    const roleId = localStorage.getItem('sloth_roleId')
    const roleID = localStorage.getItem('sloth_roleID')
    const spaceId = localStorage.getItem('sloth_space')
    // 任务id
    const jobId = this.job.jobId
    // 任务名称
    const taskName = this.job.jobName
    const spaceName = this.$route.query.spaceName
    const developer = this.$route.query.developer

    // debugger
    // const releaseParams = {
    //   projectName,
    //   projectId,
    //   userId,
    //   jobId,
    //   taskName
    // }
    // console.log(userId, 'userId---->')

    const releaseBaseUrl = `${window.location.origin}${window.location.pathname}`
    // const releaseBaseUrl = `http://168.61.114.48:8888/HTAI/v2/`
    localStorage.removeItem('releaseList')
    const releaseHref = `${releaseBaseUrl}#/htds_dsw/product/release?spaceName=${spaceName}&spaceId=${spaceId}&projectName=${projectName}&name=${projectName}&projectId=${projectId}&userId=${userId}&roleId=${roleId}&roleID=${roleID}&ProRoleId=${roleID}&developer=${developer}&jobId=${jobId}&taskName=${taskName}&newProduct=flink&from=development&todo=flink`
    window.location.href = releaseHref
    // this.$router.push({ path: '/htds_dsw/flink/release', query: releaseParams })
    // debugger
    // this.$router.push(/)

    // 上线步骤：保存 -> 语法检查（sql任务）-> 上线
    // try {
    //   await this.save()

    //   if (this.job.jobType === 'SQL') {
    //     try {
    //       const result = await this.$request('checkGrammar', {
    //         jobId: this.jobId,
    //         rawSql: this.job.rawSql,
    //         fileList: (this.job.fileList || []).map(file => file.id),
    //         kernelId: this.job.kernelId
    //       })
    //       if (result) {
    //         this.$ndcconfirm({
    //           content: '上线失败',
    //           desc: '语法检查不通过',
    //           cancelButton: ''
    //         })
    //         return
    //       } else {
    //         this.$ndcmessage.success('语法检查通过')
    //       }
    //     } catch (e) {
    //       this.$handleException(e, '语法检查失败')
    //       return
    //     }
    //   }
    //   await this.$request('releaseJob', { jobId: this.job.jobId })
    //   await this.getJobList()
    //   this.$ndcmessage.success('上线成功')
    //   this.$router.push({
    //     name: 'Operation',
    //     params: {
    //       from: 'develop'
    //     }
    //   })
    // } catch (e) {
    //   this.$handleException(e, '上线失败')
    // }
  }

  private async rollback({
    runParameter,
    extRunParameter,
    rawSql,
    mainClass,
    mainArgs,
    flinkJarPath,
    flinkJarName,
    flinkJarResId,
    flinkJarMd5,
    clusterId,
    clusterType,
    imageId,
    kernelId,
    queueId,
    fileList
  }: IVersion) {
    const params: any =
      this.job.jobType === 'SQL'
        ? {
            runParameter,
            extRunParameter,
            rawSql,
            clusterId,
            clusterType,
            kernelId,
            queueId
          }
        : {
            runParameter,
            extRunParameter,
            mainClass,
            mainArgs,
            flinkJarPath,
            flinkJarName,
            flinkJarResId,
            flinkJarMd5,
            clusterId,
            clusterType,
            kernelId,
            queueId
          }
    if (clusterType && clusterType.toLocaleUpperCase() === 'K8S') {
      params.imageId = imageId
    }
    this.job = Object.assign({}, this.job, params)
    if (this.job.jobType === 'JAR') {
      this.mainClass = mainClass || ''
      this.mainArgs = mainArgs || ''
    }
    try {
      this.isModified = true
      this.debounceAutoSave()
      const list = fileList.map(f => f.id)
      await this.$request('updateDependency', {
        jobId: this.jobId,
        fileList: list
      })

      this.job.fileList = fileList
    } catch (e) {
      this.$handleException(e, '回滚失败')
    }
  }

  private mark() {
    if (!this.tagList || !this.tagList.length) {
      return this.$ndcconfirm({
        content: '标签未创建，请创建后关联',
        cancelButton: ''
      })
    }
    if (!this.linkModalInstance) {
      this.linkModalInstance = this.$createModalInstance(MODAL_TYPE.linkLabel)
    }
    this.linkModalInstance &&
      this.linkModalInstance.show(
        {
          tags: this.tagList,
          selectedTagIds: cloneDeep(this.job.tagIds || [])
        },
        async (tagIds: number[]) => {
          try {
            await this.$request('linkTag', {
              objId: this.jobId,
              objType: 'JOB',
              tagIds
            })
            this.job.tagIds = tagIds
            this.getJobList()
            return true
          } catch (e) {
            this.linkModalInstance && this.linkModalInstance.setError(e.message)
          }
        }
      )
  }

  private addResource() {
    if (!this.resourceModalInstance) {
      this.resourceModalInstance = this.$createModalInstance(MODAL_TYPE.linkResource)
    }
    this.resourceModalInstance &&
      this.resourceModalInstance.show(
        {
          fileList: cloneDeep(this.job.fileList || []),
          mammutKyb: this.job.mammutKyb
        },
        async (args: any) => {
          try {
            await this.$request('updateDependency', {
              jobId: this.jobId,
              fileList: args.fileList.map((file: ISimpleFile) => file.id),
              mammutKyb: args.mammutKyb
            })
            this.job.fileList = args.fileList
            this.job.mammutKyb = args.mammutKyb
            return true
          } catch (e) {
            this.resourceModalInstance && this.resourceModalInstance.setError(e.message)
          }
        }
      )
  }

  private quote(sql: string) {
    if (this.job.jobType === 'JAR') {
      return this.$ndcconfirm({
        content: 'JAR任务不能引用元数据',
        cancelButton: ''
      })
    }
    this.editor && this.editor.insert(sql)
    // this.getJobDetail()
  }

  private selectSourceFile() {
    if (!this.jarModalInstance) {
      this.jarModalInstance = this.$createModalInstance(MODAL_TYPE.jar)
    }
    this.jarModalInstance &&
      (this.jarModalInstance as any).show(
        {
          sourcefile: this.job.flinkJarResId || ''
        },
        (args: any) => {
          this.fileType = 'online'
          const file = args.file || {}
          this.job.flinkJarPath = ''
          this.job.flinkJarName = file.name
          this.job.flinkJarMd5 = file.fileMd5
          this.job.uploader = file.creator
          this.job.uploadTime = file.createTime
          this.setModified(file.id, 'flinkJarResId')
          return true
        }
      )
  }

  private onChangeMainClass(e: MouseEvent) {
    const target = e.target as any
    const val = (target && target.value) || ''
    this.setModified(val, 'mainClass')
  }

  private onChangeMainArgs(e: MouseEvent) {
    const target = e.target as any
    const val = (target && target.value) || ''
    this.setModified(val, 'mainArgs')
  }

  private onChangeSql(val: string) {
    this.setModified(val, 'rawSql')
  }

  private onChangeExtRunParameter(val: string) {
    this.setModified(val, 'extRunParameter')
  }

  private onChangeRunParameter(val: any) {
    this.setModified(val, 'runParameter')
  }

  private onChangeResource(val: any) {
    if (val.resourceDesc) {
      if (!this.originalJob || !isEqual(this.originalJob.resourceDesc, this.job.resourceDesc)) {
        this.job.resourceDesc = val.resourceDesc
        this.isModified = true
        return this.debounceAutoSave()
      }
    } else {
      if (!this.originalJob || this.originalJob.runParameter['tm.memory'] !== val.tmMemory) {
        this.job.runParameter['tm.memory'] = val.tmMemory
        this.isModified = true
        return this.debounceAutoSave()
      }
    }
  }

  private onFileError(e: any) {
    if (e.type === 'EXT_ERROR') {
      return (this.errorText = '上传文件格式不支持')
    }
    if (e.type === 'SIZE_ERROR') {
      return (this.errorText = '上传文件超出大小限制')
    }
    if (e.type === 'NAME_WORDS') {
      return (this.errorText = '文件名仅支持字母、数字、短横杠和下划线组合，若坚持上线可能会导致上线失败！')
    }
    return (this.errorText = '文件上传失败')
  }

  // private errorMsg: string = ''
  private async onUploadFile(debugFileList: IDebugFile[]) {
    this.isDebug = true
    this.$emit('debug', this.job.jobName)
    this.consoleVisible = true
    this.isDebuging = true
    try {
      const result = (this.debugResult = await this.$request('debugSql', {
        jobId: this.job.jobId,
        rawSql: this.job.rawSql,
        debugFileList
      }))
      const resultData: IDebugResult[] = (result && result.results) || []
      const tabs = cloneDeep(DEBUG_TABS)
      resultData.forEach(re => {
        tabs.push({
          name: re.tableName,
          label: re.tableName
        })
      })
      this.debugTabs = tabs
    } catch (e) {
      // this.errorMsg = `'调试发生错误！'${e.toString()}`
      this.$handleException(e, '调试发生错误')
    } finally {
      this.isDebuging = false
      this.$emit('debug', '')
    }
  }

  private handleFullScreen() {
    const key = `sloth_debug_${this.job.jobId}`
    localStorage.setItem(key, JSON.stringify(this.debugResult))
    window.open(`#/debug?jobId=${this.job.jobId}`, '_blank')
  }

  private async onChangeJarFile(data: any) {
    const userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser
    const files: FileList = data.files
    if (files.length) {
      const file = (this.jarFile = files[0])
      this.errorText = ''
      let name = this.job.flinkJarName
      try {
        this.isUploading = true
        this.job.flinkJarName = file.name
        const md5: string = await genFileMd5(file, true)
        // 步骤一：判断当前文件分块上传情况
        const blocksDone: number[] = await getBlockMeta(md5, file)
        // 步骤二：文件分块上传
        const obj = await uploadBlock(md5, blocksDone, file)
        // 步骤三：通知服务端合并文件
        const result = await notifyBlock(Object.assign({ md5, fileName: file.name }, obj))
        const flinkJarPath = (this.job.flinkJarPath = result.filePath)
        this.fileType = 'local'
        this.job.flinkJarMd5 = result.md5
        this.job.flinkJarName = result.fileName
        this.job.flinkJarResId = ''
        this.job.uploader = result.uploader
        this.job.uploadTime = result.uploadTime
        this.setModified(flinkJarPath, 'flinkJarPath')
      } catch (e) {
        this.job.flinkJarName = name
        this.jarFile = null
        this.$handleException(e, 'JAR包上传失败')
      } finally {
        this.isUploading = false
        this.debounceAutoSave() // 停止编辑后2秒，自动保存
      }
    }
  }

  private async download() {
    try {
      await this.$request('downloadJar', {
        jobId: this.jobId
      })
    } catch (e) {
      this.$handleException(e, '任务包下载失败')
    }
  }

  private onMouseDown(e: MouseEvent) {
    e.preventDefault()
    document.addEventListener('mouseup', this.onMouseUp)
    document.addEventListener('mousemove', this.onMouseMove)
  }

  private onMouseUp() {
    document.removeEventListener('mouseup', this.onMouseUp)
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  private onMouseMove(e: MouseEvent) {
    e.preventDefault()
    const clientY = e.clientY
    const el = this.$el as HTMLElement
    const elHeight = el.clientHeight
    const height = elHeight - (clientY - 124)
    this.height = height < 250 ? 250 : height > Math.ceil(elHeight - 100) ? Math.ceil(elHeight - 100) : height
    this.debounceResize()
  }

  private onDebugTabChange(val: string) {
    if (val === 'log') {
      this.$nextTick(() => {
        const editor = this.$refs.debugEditor as MLogEditor
        editor && (editor as any).resize()
      })
    }
  }
}
</script>

<style lang="scss" scoped>
.m-ide {
  background: #f4f4f9;
  &-panel {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    flex-direction: column;
  }
  &-jar {
    padding: 32px 32px;
    .ndc-form {
      margin-left: 13px;
    }
    /deep/ .ndc-form.ndc-form-left .label {
      text-align: right;
    }
    .ndc-form .ndc-form-item {
      .ndc-file {
        border-radius: 3px;
        /deep/ .ndc-button {
          width: 80px;
          border-radius: 2px;
          padding: 0 5px;
          background-color: #3b68b7;
          color: #fff;
        }
      }
      .changeCursor {
        border-radius: 3px;
        /deep/ .ndc-button {
          background-color: #3b68b7;
          color: #fff;
          cursor: not-allowed;
        }
      }
      .configureBtn {
        width: 80px;
        padding: 0 5px;
        border-radius: 2px;
        background-color: #3b68b7;
        color: #fff;
      }
      .label {
        color: #999;
      }
    }

    .error {
      /*position: absolute;*/
      top: 100%;
      margin-left: 5px;
      font-size: 12px;
      line-height: 20px;
      color: #f04346;
    }
  }
  &-title {
    line-height: 20px;
    color: #262626;
    margin-bottom: 13px;
    &::before {
      // 新增 标题旁小图标
      position: absolute;
      margin-left: 16px;
      content: '';
      top: 36px;
      left: 8px;
      width: 3px;
      height: 13px;
      background: #3b68b7;
      border-radius: 2px;
    }
  }
  &-editor {
    flex: 1;
    height: 0;
    width: 100%;
    padding-right: 24px;
    box-sizing: border-box;
    background: #fff;
    .m-sql-editor {
      /deep/ .monaco-editor {
        .overflow-guard {
          .margin-view-overlays {
            background-color: #f3f3f3;
          }
          .monaco-editor-background {
            background-color: #f3f3f3;
          }
        }
      }
    }
  }
  &-line {
    position: absolute;
    width: 100%;
    box-sizing: border-box;
    height: 6px;
    border-bottom: $border;
    cursor: row-resize;
    z-index: 8;
    display: flex;
    justify-content: center;
    img {
      display: none;
      position: absolute;
      transform: rotate(90deg);
      top: -9px;
    }
  }
  &-console {
    box-sizing: border-box;
    min-height: 250px;
    z-index: 7;
    background-color: #e9ebf0;
    position: relative;

    .ndc-tabs {
      box-sizing: border-box;
      &-card {
        &::after {
          display: none;
        }
      }
    }
    .ndc-tab-check {
      overflow: hidden;
    }
    .debug-result {
      padding: 16px;
      box-sizing: border-box;
      background: #fff;
      overflow: auto;
      .ndc-table-long {
        width: unset;
        position: relative;
        max-width: 100%;
        background: #fff;
        overflow: unset;
        table-layout: fixed;
        thead tr {
          background: #eee;
          border-bottom: 1px solid #e2e5e9;
          box-sizing: border-box;
          height: 36px;
          th {
            color: #909399;
            word-wrap: normal;
            font-size: 12px;
            line-height: 20px;
            padding: 8px 0 8px 16px;
          }
        }
        tbody tr {
          height: 36px;
          border-bottom: 1px solid #ebf0f5;
          box-sizing: border-box;
          &:hover {
            background: #edf8ff;
          }
          td {
            font-size: 12px;
            line-height: 20px;
            padding: 8px 0 8px 16px;
            color: #333;
          }
        }
      }
      .ndc-table {
        thead tr {
          height: 36px;
          th {
            font-size: 12px;
            line-height: 20px;
            padding: 8px 0 8px 16px;
          }
        }
        tbody tr {
          height: 36px;
          td {
            font-size: 12px;
            line-height: 20px;
            padding: 8px 0 8px 16px;
          }
        }
      }
    }
    .ndc-tabs-header {
      .tab {
        color: #333;
        justify-content: center;
      }
    }
    .ndc-icon-close {
      margin-top: 8px;
    }
    .circlePoint {
      display: block;
      width: 10px;
      height: 10px;
      background-color: #ff3040;
      border-radius: 50%;
      position: absolute;
      top: 1px;
      left: 5px;
    }
    .ndc-icon-close,
    .fullscreen {
      font-size: 12px;
      color: #333;
      font-weight: 600;
      position: absolute;
      z-index: 8;
      right: 24px;
      top: 1px;
      cursor: pointer;
    }
    .fullscreen {
      width: 16px;
      right: 42px;
      top: 10px;
    }
    #debugTabTag {
      .ndc-tabs-header {
        .ndc-tabs-card {
          .active {
            &::after {
              width: 5px;
              height: 5px;
              background-color: #ff3040;
              position: absolute;
              top: 0;
              left: 0;
            }
          }
        }
      }
    }
  }
  &-sidebar {
    height: 100%;
    position: absolute;
    z-index: 6;
    top: 0;
    bottom: 0;
    right: 0;
    width: 28px;
    box-sizing: border-box;
    background-color: #e7e7e7;
  }
}
</style>

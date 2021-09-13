<template>
  <div class="git-project-box">
    <div class="git-project-model-alert" v-if="showLoading">
      <img class="icon" src="../../../../assets//images/blueinfo.png" />
      项目文件初始化进行中，请稍候……
    </div>
    <div class="git-project-model">
      <div class="git-project-required">
        项目属性：
      </div>
      <div class="git-project-contain">
        <div class="git-project-model-top">
          <ndc-radio v-model="operationId" label="newCreate">
            <img class="icon" src="../../../../assets/images/gitlab.png" />
            新建gitlab项目
          </ndc-radio>
          <ndc-radio v-model="operationId" label="relation">
            <img class="icon" src="../../../../assets/images/gitlab.png" />
            关联gitlab项目
          </ndc-radio>
          <ndc-radio v-model="operationId" label="unrelated">
            <img class="icon" src="../../../../assets/images/gituser.png" />
            不关联gitlab项目
          </ndc-radio>
        </div>
        <!--新建gitlab项目 -->
        <div class="git-project-model-bottom" v-if="operationId === 'newCreate'">
          <div class="git-project-model-bottom-top">
            <div>
              <img class="icon" src="../../../../assets/images/info-circle.png" />
              <span class="git-sure">请确认该gitlab项目未绑定过其他项目</span>
            </div>
            <div>
              <a href="http://gitlab.htzq.htsc.com.cn/" class="git-a" :target="'_blank'" :rel="'noopener noreferrer'" :title="'打开gitlab'">前往gitlab>></a>
            </div>
          </div>
          <div class="git-project-model-bottom-foot">
            <span class="git-project-required">gitlab项目名:</span>
            <div class="git-input-new">
              <el-input placeholder="请输入gitlab项目名" v-model="gitlabName" :class="{ 'red-color': !gitShow }" size="small" @input="onGitNameChange"> </el-input>
              <div v-if="!gitShow" class="git-project-error-info">
                名称可包含字母,数字,'_','-','.',不能以'-'开头,不能以'.git','.atom'结尾
              </div>
            </div>
          </div>
        </div>
        <!--关联gitlab项目 -->
        <div class="git-project-model-bottom" v-if="operationId === 'relation'">
          <div class="git-project-model-bottom-top">
            <div>
              <img class="icon" src="../../../../assets/images/info-circle.png" />
              <span class="git-sure">请先登录gitlab进行注册，才可以自动创建项目</span>
            </div>
          </div>
          <div class="git-project-model-bottom-foot">
            <span class="git-project-required">gitlab地址:</span>
            <div class="git-input-new">
              <span :class="{ 'red-inter': !gitlabUrlIsValid, 'git-input-mix': true }">
                <el-input placeholder="请输入gitlab地址" v-model="gitlabUrl" size="small" :class="{ 'red-color': !gitlabUrlIsValid }" @input="onGitUrlChange" @blur="handleGetBranchs">
                  <template slot="prepend">http://</template>
                </el-input>
                <a-select style="width: 150px" placeholder="请选择gitlab分支,默认为master" v-model="gitBranch" :class="{ 'red-color': !gitlabUrlIsValid }" @focus="handleFocuseGitBranch">
                  <template>
                    <div slot="notFoundContent" style="text-align:center">
                      <img style="width:80px" src="@/assets/images/null.svg" alt="" />
                      <div style="font-size:14px;color:#555">暂无数据~</div>
                    </div>
                  </template>
                  <a-select-option v-for="item in branchs" :key="item">{{ item }} </a-select-option>
                </a-select>
              </span>
              <div v-if="!gitlabUrlIsValid" class="git-project-error-info">
                gitlab地址必须以'.git'结尾
              </div>
            </div>
          </div>
        </div>
        <el-dialog :visible.sync="dialogTableVisible" :modal="true" :append-to-body="true" :width="'416px'" :top="'35vh'" :show-close="false">
          检测到git项目中的目录与当前目录不一致，是否自动将代码导入code目录（导入完成后需先手动刷新项目，再本地Commit）
          <div class="git-projec-button">
            <button class="git-projec-button-no" @click="onCancelno">否</button>
            <button class="git-projec-button-yes" @click="onOk">是</button>
          </div>
        </el-dialog>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { Input, Select } from 'element-ui'
import { Radio } from '../../../../../sloth-ndc-ui/packages/index.js'
import 'ndc-antd/style.js'
import Axios from 'axios'
import 'element-ui/lib/theme-chalk/index.css'
import eventEmitter from '@/utils/eventEmitter'
// import { HostContext } from '@lego/bigbox-utils';
import '@/global.less';
import { debounce } from 'lodash'
Vue.use(Radio)
@Component({
  components: {
    ElInput: Input,
    ElSelect: Select
  }
})
export default class ThirdGitProject extends Vue {
  // 单选框
  private operationId: string = 'newCreate'
  // git项目名
  private gitlabName: string = ''
  // 请输入gitlab地址
  private gitlabUrl: string = ''
  // git分支
  private gitBranch: string = '请选择gitlab分支,默认为master'
  // 是否展示git项目名的错误信息
  private gitShow: boolean = true
  // 上一步带下来的数据
  private createProjectData: any = {}

  private projectName: string = ''
  // 判断是核心区还是测试区
  private envTag: string = ''
  private workspaceId: string = ''

  private projectType: string = ''
  private projectId: string = ''
  // 用户信息
  private userNumber: string = ''
  // 用户信
  private loginUser: any = {}
  private httpurl: any = process.env.VUE_APP_OPERATION
  // 提示信息
  private progress: any = {}
  // 提示信息
  private adds: number = 1
  // 是否展示git地址的错误信息
  private gitlabUrlIsValid: boolean = true
  // 判断是否要更新地址
  private gitlabUrlUpdated: boolean = false
  // git分支集合
  private branchs: any[] = []
  // 弹框是否显示
  private dialogTableVisible: boolean = false
  // git密码
  private passwordm: string = ''
  // 新的项目ID
  private newProjectId: string = ''
  // 是否展示加载中
  private showLoading: boolean = false
  private debounceResize: any
  private created() {
    this.gitlabName = this.generateGitName()
    // 获取用户登录信息
    if (localStorage.getItem('userInfo')) {
      this.userNumber = JSON.parse(localStorage.getItem('userInfo') as string).username
      this.loginUser = JSON.parse(localStorage.getItem('userInfo') as string)
    }
    // 监听确定按钮的事件
    window.addEventListener('customer/createProject:start', this.createProjShishi, false)
  }
  private beforeDestroy() {
    // 销毁确定按钮事件的监听

    window.removeEventListener('customer/createProject:start', this.createProjShishi)
  }
  // 防抖函数
  private async createProjShishi(msg) {
    this.debounceResize = debounce(this.debounceCreateProjShishi, 2000)
    this.debounceResize()
  }

  // 点击确定按钮后执行的方法
  private async debounceCreateProjShishi() {
    this.handleNewProjects()
      .then(() => {
        this.showLoading = false
        eventEmitter.emit('customer/createProject:end', { success: true })
      })
      .catch(() => {
        this.showLoading = false
        eventEmitter.emit('customer/createProject:end', { success: false })
      })
  }

  // // 提交前的校验
  private async handleNewProjects() {
    console.log('this.$store========>>>>>>', this.$store)
    if (this.$store && this.$store.state && this.$store.state.host && this.$store.state.host.subapp) {
      const portal = this.$store.state.host.subapp.portal
      this.createProjectData = portal ? portal.createProject : {}
      this.projectName = this.createProjectData ? this.createProjectData.project.name : ''
      this.envTag = this.createProjectData.project ? this.createProjectData.project.envTag : ''
      this.workspaceId = this.createProjectData ? this.createProjectData.workspace.id : ''
      this.projectType = this.createProjectData ? this.createProjectData.project.type : ''
      this.projectId = this.createProjectData ? this.createProjectData.project.id : ''
    }
    const processedGitUrl = this.processGitlabUrl(this.gitlabUrl)
    if (this.operationId === 'relation') {
      if (!this.gitlabUrl) {
        this.$ndcmessage.error('请填写gitlab地址')
        return Promise.reject(new Error('error'))
      } else if (!this.gitlabUrlIsValid) {
        this.$ndcmessage.error('请填写正确的gitlab地址')
        return Promise.reject(new Error('error'))
      }
    }
    if (this.operationId === 'newCreate') {
      if (!this.gitlabName) {
        this.$ndcmessage.error('请填写gitlab项目名')
        return Promise.reject(new Error('error'))
      }
      if (!this.gitShow) {
        this.$ndcmessage.error('请填写正确的gitlab项目名')
        return Promise.reject(new Error('error'))
      }
    }
    this.showLoading = true
    // 数据检查end git地址请求的接口，先校验
    if (this.operationId === 'relation' && this.gitlabUrl && this.gitlabUrlIsValid) {
      const password = await (window as any).hostUtils.getPassword(processedGitUrl, this.envTag)
      this.passwordm = password
      if (!password) {
        return Promise.reject(new Error('error'))
      }
      // eslint-disable-next-line react/destructuring-assignment
      const gitBranch = this.gitBranch || 'master'
      // gitlab关联选择，check代码是否code目录

      await Axios.post(
        `/HTAI/v2/api/htds_dsw/bff/f4/git/checkInCode?operationId=2&url=${processedGitUrl}&branch=${gitBranch}`,
        {
          operationId: 2,
          url: this.gitlabUrl,
          branch: gitBranch
        },
        {
          headers: {
            'Content-Type': 'application/json',
            userId: this.loginUser.id,
            userNumber: this.userNumber,
            envTag: this.envTag,
            password
          }
        }
      )
        .then(checkResult => {
          if (checkResult.data.success) {
            if (checkResult.data.result && checkResult.data.result.checkResult === 'true') {
              return this.newProjectAction(this.userNumber, password)
            }
            this.dialogTableVisible = true
            return Promise.reject(new Error('error'))
          }
          this.$ndcmessage.error(checkResult.data.message)
          return Promise.reject(new Error('error'))
        })
        .catch(e => {
          return Promise.reject(new Error('error'))
        })
    }
    // git项目名的方法
    if (this.operationId === 'newCreate' && this.gitlabName && this.gitShow) {
      const password = await (window as any).hostUtils.getPassword({ checkWithoutGitUrl: true })
      if (!password) {
        return Promise.reject(new Error('error'))
      }
      return this.newProjectAction(this.userNumber, password)
    }
    // 不关联git的方法
    if (this.operationId === 'unrelated') {
      return this.newProjectAction(this.userNumber, '')
    }
  }

  // 获取git地址的全部值
  private processGitlabUrl(gitlabUrl = '') {
    const gitlab = gitlabUrl.trim().replace(/^git@([A-Za-z0-9.]+):/, '$1/')
    return gitlab ? (/^http:\/\//.test(gitlab) ? gitlab : 'http://' + gitlab) : ''
  }
  // 提交的方法
  private async newProjectAction(userNumber, password) {
    const defaultTargetEnvType = this.envTag
    if (!this.gitBranch) {
      this.gitBranch = 'master'
    }
    const processedGitUrl = this.processGitlabUrl(this.gitlabUrl)
    const result = await this.createfun(
      this.operationId,
      this.projectType,
      this.workspaceId,
      userNumber,
      password,
      processedGitUrl,
      this.gitBranch,
      this.projectName,
      this.gitlabName,
      defaultTargetEnvType,
      this.projectId
    )
    this.newProjectId = result && result.data
    if (result && result.success) {
      return Promise.resolve(this.newProjectId)
    }
    return Promise.reject(new Error('error'))
  }

  private async createfun(operationId, projectType, workspaceId, userNumber, password, gitlabUrl, gitBranch, projectName, gitlabName, defaultTargetEnvType, projectId) {
    this.progress = { status: 'running', message: '项目文件初始化进行中，请稍候……' }
    let project = null
    let createProjectSpaceResult = {}
    await Axios.post(
      '/HTAI/v2/api/htds_dsw/bff/api/project',
      {
        id: projectId,
        name: projectName,
        // description: projectDesc,
        state: 1,
        createBy: this.loginUser.username,
        workspaceId,
        gitUrl: operationId === 'relation' ? gitlabUrl : '',
        gitBranch: operationId === 'relation' ? gitBranch : 'master'
      },
      {
        headers: {
          envTag: defaultTargetEnvType
        }
      }
    )
      .then(gitLoginResult => {
        project = gitLoginResult.data.id
      })
      .catch(error => {
        this.$ndcmessage.error(error.response.data)
        return Promise.reject(new Error('error'))
      })
    try {
      const paramsMap = {
        unrelated: {
          operationId: 0
        },
        relation: {
          operationId: 2,
          url: gitlabUrl,
          password,
          branch: gitBranch
        },
        newCreate: {
          operationId: 3,
          url: '',
          password,
          branch: 'master',
          gitlabName
        }
      }
      const defaultParam = paramsMap[operationId]
      /** [金山api]创建项目数据，失败删除[aimap]中新增的记录 */
      // return request(createurl, {
      //   method: 'POST',
      //   params: {
      //
      //   },
      //   headers: headers_data
      // })
      const operationIds = defaultParam.operationId
      const urls = defaultParam.url ? defaultParam.url : ' '
      const branchs = defaultParam.branch ? defaultParam.branch : 'master'
      const projectNames = defaultParam.gitlabName ? defaultParam.gitlabName : ''
      // const initialFolderss = `${this.projectType}` === '7' ? 'research,factor,strategy' : '';
      await Axios.post(
        `/HTAI/v2/api/htds_dsw/bff/f4/git/creatProject/${project}?operationId=${operationIds}&url=${urls}&branch=${branchs}&projectName=${projectNames}`,
        {
          operationId: operationIds,
          url: urls,
          branch: branchs,
          projectName: projectNames
        },
        {
          headers: {
            envTag: defaultTargetEnvType,
            userNumber,
            userId: this.loginUser.id,
            email: this.loginUser.email,
            password,
            url: urls
          }
        }
      ).then(res => {
        createProjectSpaceResult = res.data
      })
    } catch (e) {
      await Axios.post(
        `/HTAI/v2/api/htds_dsw/bff/api/project/${projectId}`,
        {},
        {
          headers: {
            envTag: defaultTargetEnvType
          }
        }
      ).then(res => {
        createProjectSpaceResult = res.data
      })
      this.$ndcmessage.error(e.message)
      return
    }
    if ((createProjectSpaceResult as any).success) {
      if (this.operationId === 'newCreate') {
        // 新建gitlab的时候根据返回值更新aimap数据库，保持同步
        const { url: gitlabResult } = (createProjectSpaceResult as any).result.data || {}
        if (gitlabResult) {
          await Axios.post(
            '/HTAI/v2/api/htds_dsw/bff/api/project/u',
            {
              id: project,
              gitUrl: gitlabResult,
              updateBy: this.loginUser.username
            },
            {
              headers: {
                envTag: defaultTargetEnvType
              }
            }
          )
            .then(gitLoginResult => {})
            .catch(e => {
              console.log(e)
            })
        }
      }
      await Axios.post(
        `/HTAI/v2/api/htds_dsw/bff/api/project/${projectId}/authority/u`,
        [
          {
            tag: 'DEFAULT_ENV',
            authorityGroup: defaultTargetEnvType,
            token: '',
            updateBy: this.loginUser.username
          }
        ],
        {
          headers: {
            envTag: defaultTargetEnvType
          }
        }
      )
        .then(gitLoginResult => {})
        .catch(e => {
          console.log(e)
        })
      // updateProgress({ status: 'success', message: 'success' })
      return { success: true, data: projectId }
    } else {
      await Axios.post(
        `/HTAI/v2/api/htds_dsw/bff/api/project/${projectId}`,
        {
          id: projectId
        },
        {
          headers: {
            envTag: defaultTargetEnvType
          }
        }
      ).then(res => {})
      return { success: false, message: '用户名密码错误' }
    }
    // if (createProjectSpaceResult.result.errcd === 502) {
    //   helper.delCookie(userNumber)
    //   message.error(`${createProjectSpaceResult.result.msg},请点击确认按钮重试` || '创建项目出错', 2)
    //   updateProgress({ status: 'error', message: '用户名密码错误' })
    //   return { success: false, message: '用户名密码错误' }
    // }
    // const tipMsg = createProjectSpaceResult.result.data ? createProjectSpaceResult.result.data.msg : createProjectSpaceResult.result.msg
    // message.error(tipMsg || createProjectSpaceResult.result.msg || createProjectSpaceResult.message || '创建项目出错', 2)
    // updateProgress({
    //   status: 'error',
    //   message: tipMsg || createProjectSpaceResult.result.msg || createProjectSpaceResult.message || '创建项目出错'
    // })
    // return { success: false, message: '' }
  }

  // 点击否执行的方法
  private async onCancelno() {
    this.operationId = 'unrelated'
    this.newProjectAction(this.userNumber, this.passwordm)
    this.dialogTableVisible = false
  }
  // 弹框确定执行的方法
  private async onOk() {
    this.newProjectAction(this.userNumber, this.passwordm)
    if (this.newProjectId) {
      await Axios.post(
        `/HTAI/v2/api/htds_dsw/bff/f4/git/pullAndRemove/${this.newProjectId}`,
        {},
        {
          headers: {
            userId: this.loginUser.id,
            userNumber: this.userNumber,
            password: this.passwordm,
            envTag: this.envTag
          }
        }
      )
        .then(r => {
          if (r.data.result.errcd === 502) {
            this.$ndcmessage.error('用户名密码错误')
            return Promise.reject(new Error('error'))
          }
          if (!r.data.success) {
            this.$ndcmessage.error(r.data.message)
            return Promise.reject(new Error('error'))
          }
          // return resolve();
        })
        .catch(e => {
          console.log(e)
        })
      this.dialogTableVisible = false
    }
  }
  // 获取gitlab默认的项目名
  private generateGitName() {
    const currentDate = new Date()
    const p = '0123456789abcdefghijklmnopqrstuvwxyz'
    const y = p[currentDate.getFullYear() - 2000]
    const m = p[currentDate.getMonth() + 1]
    const d = p[currentDate.getDate()]
    const uuid = this.getUUID()
    const name = `${y}${m}${d}${uuid.substr(0, 5)}`
    return name
  }
  // 获取gitlab默认的项目名中的uuid
  private getUUID() {
    const s: any = []
    const hexDigits = '0123456789abcdef'
    for (let i = 0; i < 36; i++) {
      s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1)
    }
    s[14] = '4' // bits 12-15 of the time_hi_and_version field to 0010
    s[19] = hexDigits.substr((s[19] & 0x3) | 0x8, 1) // bits 6-7 of the clock_seq_hi_and_reserved to 01
    s[8] = s[13] = s[18] = s[23] = ''
    const uuid = s.join('')
    return uuid
  }

  // 查询gitlab分支
  private async handleGetBranchs(val: any) {
    const userNumber = this.loginUser.username
    const processedGitlabUrl = this.processGitlabUrl(this.gitlabUrl)
    this.gitlabUrl = val.target.value || ''
    if (processedGitlabUrl && this.gitlabUrlUpdated && this.gitlabUrlIsValid) {
      const password = await (window as any).hostUtils.getPassword({ checkWithoutGitUrl: true })

      if (password) {
        await Axios.post(
          `/HTAI/v2/api/htds_dsw/bff/f4/git/getBranches?url=${processedGitlabUrl}`,
          {
            url: processedGitlabUrl
          },
          {
            headers: {
              userId: this.loginUser.id,
              userNumber,
              password,
              envTag: this.envTag
            }
          }
        )
          .then(result => {
            const data = result.data ? result.data : {}
            // 一般可能的原因 ： 请求参数丢失
            if (!data.success) {
              this.$ndcmessage.error(data.result.msg)
            }
            if (data.result.success) {
              this.branchs = data.result.result.data
              this.gitBranch = this.branchs[0]
              console.log('gitBranch=============>>>>.', this.gitBranch)
              this.gitlabUrlUpdated = false
            } else {
              // 一般原因 没有git权限
              this.$ndcmessage.error(data.result.result.msg)
            }
          })
          .catch(e => {
            console.log(e)
          })
      }
    }
  }
  // git分支的校验
  private async handleFocuseGitBranch() {
    if (!this.gitlabUrl) {
      this.$ndcmessage.info('请先输入gitlab地址')
    }
  }
  // 校验gitbranch的地址格式是否填写正确
  private async onGitUrlChange(val: string) {
    const reg = new RegExp('[A-Za-z0-9._/:]+.git$')
    this.gitlabUrlUpdated = true
    this.gitlabUrlIsValid = val ? reg.test(val) : true
  }
  // git项目名改变时的方法的校验方法
  private async onGitNameChange(val: string) {
    const gitlabName = val || ''
    // const reg = new RegExp('^[a-zA-Z0-9_][a-zA-Z0-9._-]*$(?<!\.git|\.atom)');
    const reg = new RegExp('^[a-zA-Z0-9_][a-zA-Z0-9._-]*$')
    let gitlabNameIsValid = true
    if (gitlabName.endsWith('.git') || gitlabName.endsWith('.atom')) {
      gitlabNameIsValid = false
    } else {
      gitlabNameIsValid = reg.test(gitlabName)
    }
    this.gitShow = gitlabNameIsValid
  }
}
</script>

<style lang="scss">
.git-project-box {
  font-size: 14px;
  min-width: 800px;
  background-color: white;
  padding-bottom: 30px;
  .git-project-model-alert {
    text-align: left;
    height: 32px;
    line-height: 32px;
    padding-left: 10px;
    background-color: #e6f7ff;
    margin-bottom: 3px;
    .icon {
      width: 16px;
      margin-left: 5px;
      margin-top: 7px;
    }
  }
  .git-project-model {
    height: 145px;
    display: flex;
    color: #222;

    .git-project-required {
      text-align: end;
      width: 133px;
    }
    .git-project-required:before {
      display: inline-block;
      margin-right: 4px;
      color: #f5222d;
      font-size: 14px;
      font-family: SimSun, sans-serif;
      line-height: 1;
      content: '*';
    }
    .git-project-contain {
      width: 100%;
      text-align: start;
      .git-project-model-top {
        height: 24px;
        line-height: 24px;
        .ndc-radio-label {
          position: relative;
          top: -2px;
        }
        .icon {
          width: 14px;
          position: relative;
          margin-left: 5px;
        }
      }
      .git-project-model-bottom {
        padding: 20px;
        background-color: #fafafa;
        height: 114px;
        margin-top: 20px;
        .git-project-model-bottom-top {
          display: flex;
          justify-content: space-between;
        }
        .git-sure {
          display: inline-block;
          margin-left: 4px;
          color: gray;
        }
        .icon {
          width: 16px;
          height: 16px;
          margin-bottom: 2px;
        }
        .git-project-model-bottom-foot {
          margin: 20px 0px;
          display: flex;
          .git-project-required {
            margin-top: 5px;
            text-align: start;
            width: 93px;
          }
          .git-input-new {
            width: 500px;
            .git-project-error-info {
              color: #f5222d;
            }
            .red-color {
              .el-input__inner {
                border: 1px solid #f5222d;
              }
              .ant-select-selection--single {
                border-color: #f5222d;
              }
              .ant-select-arrow .ant-select-arrow-icon {
                color: #f5222d;
              }
            }
            .red-inter {
              .el-input-group__prepend {
                color: #f5222d;
                border-bottom: 1px solid #f5222d;
                border-left: 1px solid #f5222d;
                border-top: 1px solid #f5222d;
              }
            }
          }
        }
        .git-a {
          color: #3b68b7;
          display: inline-block;
          margin-right: 10px;
        }
        .el-input-group {
          width: 66%;
          height: 32px;
          .el-input-group__prepend {
            color: #222;
          }
        }
        .el-select {
          width: 145px;
          .el-input__inner {
            text-overflow: ellipsis;
          }
        }
        .git-input-mix {
          width: 550px;
          display: inline-block;
        }
      }
    }
  }
}
.git-projec-button {
  text-align: end;
  .git-projec-button-no {
    width: 46px;
    height: 32px;
    background-color: white;
    border: 1px solid #d9d9d9;
    border-radius: 3px;
    font-size: 14px;
  }
  .git-projec-button-no:hover {
    color: #3b68b7;
    border: 1px solid #3b68b7;
  }
  .git-projec-button-yes {
    width: 46px;
    height: 32px;
    background-color: white;
    border: 1px solid #3b68b7;
    border-radius: 3px;
    font-size: 14px;
    margin-left: 10px;
    color: #fff;
    background-color: #3b68b7;
  }
}
</style>

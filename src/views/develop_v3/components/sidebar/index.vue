<template>
  <div class="m-sidebar">
    <div class="m-sidebar-tab" :class="{ active: activeTab === item.value }" @click="toggleTab(item.value)" v-for="(item, index) in tabList" :key="index">{{ item.label }}</div>
    <div class="m-sidebar-panel" :id="currentTab" v-show="activeTab">
      <!--新增 宽度拉伸-->
      <div class="changeWidth" id="changeWidth" @mousedown="onMouseDown"></div>
      <!-- 新增 流式表 -->
      <!-- 流式表拉伸-->
      <div class="liushibiao-open" id="liushibiao-open"  v-show="activeTab === 'database'">
        <div class="panel-header">流式表</div>
          <m-database-nav ref="dataSource"  :opCodesFlag = this.permission></m-database-nav>
<!--          <div class="permissionBox" v-show="!this.permission">-->
<!--            <div class="permissionImg">-->
<!--              <img src="@/assets/images/limits.png" alt />-->
<!--            </div>-->
<!--            <p>您暂无流式表权限</p>-->
<!--            <p>快去申请吧</p>-->
<!--            <div class="applyPermissionBtn">-->
<!--              <ndc-button theme="primary" @click="applyPermission">申请数据权限</ndc-button>-->
<!--            </div>-->
<!--          </div>-->
      </div>
<!--      <div class="panel" v-show="activeTab === 'basic'">
        <div class="panel-header">基本信息</div>
        &lt;!&ndash; <div class="panel-header">资源文件</div> &ndash;&gt;
        <ndc-form class="panel-body info">
          <ndc-form-item label="任务名称：">
            <span class="g-text-nowrap" :title="job.jobName">{{ job.jobName }}</span>
          </ndc-form-item>
          <ndc-form-item label="任务ID：">
            <span>{{ job.jobId }}</span>
          </ndc-form-item>
          <ndc-form-item label="创建时间：">
            <span>{{ job.createTime }}</span>
          </ndc-form-item>
          <ndc-form-item label="创建人：">
            <span>{{ job.creator }}</span>
          </ndc-form-item>
          <ndc-form-item label="最近修改人：">
            <span>{{ job.creator }}</span>
          </ndc-form-item>
          <ndc-form-item label="最近保存时间：">
            <span>{{ job.updateTime }}</span>
          </ndc-form-item>
        </ndc-form>
      </div>-->
      <div class="panel" v-show="activeTab === 'version'">
        <div class="panel-header">版本信息</div>
        <m-version class="panel-body version" ref="version" :job-id="job.jobId" :type="job.jobType" :opCodesFlag = this.permission></m-version>
      </div>
      <div class="panel" v-show="activeTab === 'resourceFiles'">
        <div class="panel-header">资源文件</div>
        <m-resource-files v-on:flag="changeFlag" @jobChange="handleJobChange" class="panel-body resourceFiles"
                          ref="resourceFiles" :job="job" :resourceFlag="resourceFlag" :opCodesFlag = this.permission></m-resource-files>
      </div>
      <div class="panel" v-show="activeTab === 'params'">
        <div class="panel-header">运行参数</div>
        <m-run-params class="panel-body params" ref="params" :job="job" :opCodesFlag = this.permission @change="onChangeParams"></m-run-params>
      </div>
      <div class="advanced panel" v-show="activeTab === 'advanced'" style="height: 100%"></div>
      <div class="panel" v-show="activeTab === 'resource'">
        <div class="panel-header">资源配置</div>
        <m-resource-allocation class="panel-body resource" ref="resource" :job="job" @change="onChangeResouce"></m-resource-allocation>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';
import MVersion from '../version/index.vue';
import MResourceFiles from '../resource-file/index.vue';
import MRunParams from '../run-params/index.vue';
import MResourceAllocation from '../resource-allocation/index.vue';

import { EDITOR_OPTIONS } from '../../constant';
import { IJob } from '@/utils/types';
// 导入数仓表
import MDatabaseNav from '../database-nav/index.vue';
import { getOpCodes } from "@utils/getOpcodes";
import { Action } from "vuex-class";
import { MODULE_NAMESPACE } from "@utils/constant";

interface Tab {
  label: string
  value: string
}

const TAB_LIST: Tab[] = [
  {
    label: '流式表',
    value: 'database'
  },
  {
    label: '版本信息',
    value: 'version'
  },
  {
    label: '资源文件',
    value: 'resourceFiles'
  },
  {
    label: '运行参数',
    value: 'params'
  }
];
const TAB_LIST_JAR: Tab[] = [
  {
    label: '版本信息',
    value: 'version'
  },
  {
    label: '资源文件',
    value: 'resourceFiles'
  },
  {
    label: '运行参数',
    value: 'params'
  }
];
//  {
//   label: '高 级 配 置',
//   value: 'advanced'
// }, {
//   label: '资 源 配 置',
//   value: 'resource'
// }
@Component({
  components: {
    MVersion,
    MRunParams,
    MResourceFiles,
    MResourceAllocation,
    MDatabaseNav
  }
})
export default class MSidebar extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private job!: IJob
  private tabList: Tab[] = TAB_LIST
  private activeTab: string = ''
  private extRunParameter: string = ''
  private oldExtRunParameter: string = ''
  private paramsEditor?: monaco.editor.IStandaloneCodeEditor
  private resourceFlag = false
  private fileList1: any = []
  get currentTab() {
    return localStorage.getItem('sloth_activetab') || '';
  }

  // 新增 获取流式表数据
  private getData() {
    this.getMetadataTableList();
  }

  @Action('getMetadataTableList', MODULE_NAMESPACE.develop_v3)
  private getMetadataTableList!: any
  // 新增 权限申请方法
  private permission: boolean = false
  // 获取权限操作码
  private async getPermissionCodes() {
    let result = await getOpCodes({});
    // this.rightClickCodes = result
    if (result.opCodes.includes('rtdev_proj.devtest') === true) {
      this.permission = true;
    } else {
      this.permission = false;
    }
  }
  // private applyPermission() {
  //   console.log('申请流式表权限,待开发！');
  // }
  @Watch('job')
  private onJobChanged(val: IJob) {
    this.fileList1 = this.job.fileList;
    this.extRunParameter = val.extRunParameter || '';
    if (this.job.jobType === 'JAR') {
      this.tabList = TAB_LIST_JAR;
    }
  }
  @Watch('extRunParameter')
  private onExtRunParameterChanged(val: string) {
    if (val !== this.oldExtRunParameter) {
      this.paramsEditor && this.paramsEditor.setValue(val);
    }
  }
  // 侧边栏删除filelist将值传回
  private handleJobChange(job:IJob) {

  }

  private changeFlag(val) {
    this.fileList1 = this.job;
  }

  public getRunParameter(isCompare: boolean = false): any {
    const params = this.$refs.params as MRunParams;
    return (params && (params as any).getRunParameter(isCompare)) || {};
  }

  public getExpandParameter(): string {
    return this.extRunParameter;
  }

  public getResourceDesc() {
    const resource = this.$refs.resource as MResourceAllocation;
    return (resource && (resource as any).genParams()) || {};
  }

  public isParameterComplete() {
    const params = this.$refs.params as MRunParams;
    const valid = params && (params as any).isComplete();
    const resource = this.$refs.resource as MResourceAllocation;

    return valid && resource && (resource as any).isComplete();
  }

  private mounted() {
    const paramsElm = this.$el.getElementsByClassName('advanced')[0] as HTMLElement;
    const paramsEditor = (this.paramsEditor = monaco.editor.create(
      paramsElm,
      Object.assign({}, EDITOR_OPTIONS, {
        language: 'shell',
        minimap: {
          enabled: false
        }
      })
    ));

    this.extRunParameter && paramsEditor.setValue(this.extRunParameter);

    paramsEditor.onDidChangeModelContent(e => {
      this.oldExtRunParameter = this.extRunParameter = paramsEditor.getValue();
      this.$emit('extend-change', this.extRunParameter);
    });
    // console.log(this.job,'sidebarJob--->')
  }
  private async created() {
    this.getPermissionCodes();
    // console.log(this.job,'sidebarJob--->')
  }

  private beforeDestroy() {
    this.paramsEditor && this.paramsEditor.dispose();
  }

  private toggleTab(tab: string) {
    this.activeTab = this.activeTab === tab ? '' : tab;
    if (this.activeTab === 'database') {
      const dataBase = this.$refs.dataSource as MDatabaseNav;
      (dataBase as any).refresh();
    }
    if (this.activeTab === 'advanced') {
      this.$nextTick(() => {
        this.paramsEditor && this.paramsEditor.layout();
      });
    }
    if (this.activeTab === 'version') {
      const version = this.$refs.version as MVersion;
      version && (version as any).refresh();
    }
    if (this.activeTab === 'resourceFiles') {
      // const resourceFile = this.$refs.resourceFile

      this.resourceFlag = true;
      // resourceFile && resourceFile.show()
    }
    if (this.activeTab === 'params') {
      const params = this.$refs.params as MRunParams;
      params && (params as any).init();
    }
  }

  private onChangeParams(val: any) {
    this.$emit('params-change', val);
  }

  private onChangeResouce(val: any) {
    this.$emit('resource-change', val);
  }
  private d= ''
  private onMouseDown(e: MouseEvent) {
    e.preventDefault();
    const el = document.getElementById(this.currentTab) as any;
    let x = e.clientX;
    let elW = el.offsetWidth;
    let elL = el.offsetLeft;
    if (x > elL) {
      this.d = 'left';
    }
    document.onmousemove = (e) => {
      e.preventDefault();
      let xx = e.clientX;
      if (this.d === 'left') {
        el.style.width = elW + x - xx + 'px';
        el.style.maxWidth = 600 + 'px';
        el.style.minWidth = 480 + 'px';
      }
      // return false;
    };
    document.onmouseup = () => {
      document.onmousemove = null;
      document.onmouseup = null;
    };
  }
}
</script>

<style lang="scss">
.m-sidebar {
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  background: #e7e7e7;
  // border-left: $border;
  box-sizing: border-box;
  // text-align: center;
  &-tab {
    flex-shrink: 0;
    writing-mode: vertical-rl;
    width: 28px;
    height: 81px;
    text-align: center;
    line-height: 28px;
    /*padding: 12px 0;*/
    cursor: pointer;
    user-select: none;
    font-size: 14px;
    color: #666;
    border-bottom: 1px solid #cccccc;
    // margin-left: -1px;
    &:hover {
      color: #222222;
    }
    &.active {
      color: #222222;
      background: #f3f3f3;
    }
  }
  &-panel {
    display: flex;
    position: absolute;
    right: 28px;
    width: 500px;
    height: 100%;
    background-color: #fafafa;
    border-left: $border;
    box-sizing: border-box;
    /*新增 改变宽度*/
    .changeWidth{
      width: 10px;
      height: 100%;
      position: absolute;
      left: 0;
      top: 0;
      cursor: col-resize;
    }
   .liushibiao-open{
     display: flex;
     flex-direction: column;
     height: 100%;
     width: 100%;
     /*权限申请部分*/
     .permissionBox {
       // display: none;
       padding-top: 20px;
       background-color: #fafafa;
       .permissionImg {
         // margin-top: 20px;
         width: 80px;
         height: 80px;
         margin: 0 auto;
       }
       p {
         font-size: 14px;
         color: #555555;
         text-align: center;
       }
       .applyPermissionBtn {
         text-align: center;
         margin-top: 24px;
       }
     }
   }
    .panel {
      width: 100%;
      height: 100%;
      box-sizing: border-box;
      display: flex;
      flex-direction: column;
      &-header {
        position: relative;
        margin: 20px 0;
        padding-left: 30px;
        line-height: 16px;
        height: 16px;
        color: #262626;
        flex-shrink: 0;
        &::before {
          // 新增 标题旁小图标
          position: absolute;
          margin-left: 16px;
          content: '';
          top: 1px;
          left: 0;
          width: 3px;
          height: 13px;
          background: #3b68b7;
          border-radius: 2px;
        }
      }
      &-body {
        flex: 1;
        // padding: 0 40px;
        &.version {
          padding: 0 16px;
          padding-bottom: 30px;
        }
        &.info {
          .ndc-form-item {
            padding: 0;
            .label {
              // 调整基本信息文字样式
              width: 140px;
              height: 20px;
              text-align: right;
              padding-right: 0;
            }
            .label,
            .content {
              height: auto;
              line-height: 20px;
              font-size: 14px;
              margin-bottom: 6px;
            }
            .label {
              color: #888;
            }
            .content {
              color: #222;
            }
          }
        }
      }
    }
  }
}
</style>

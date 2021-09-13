<template>
  <div class="m-job-nav">
    <m-nav-header placeholder="任务名称" @refresh="getJobList" @tags-change="selectedTags = arguments[0]" @keywords-change="keywords = arguments[0]">
      <!-- <ndc-dropdown :items="jobTypes" :arrow-visible="true" @select="createJob(arguments[0].key)">
          <u-text-button>
            <img class="icon" src="../../../assets/images/icon_new.svg" />
            <span>新建任务</span>
          </u-text-button>
      </ndc-dropdown>-->

      <template v-slot:left>
        <ndc-tooltip position="top" content="新建文件夹">
          <!-- <i class="ndc-icon-folder" @click="createFolder(true)" /> -->
          <img src="@/assets/images/新建文件夹.png" alt @click="createFolder(true)" :class=[{changeCursor:!opCodesFlag},{newfloder:opCodesFlag}] />
        </ndc-tooltip>
        <div class="icon-line"></div>
        <ndc-tooltip class="toolTipTop" position="top" content="新建JAR任务">
          <!-- <i class="ndc-icon-document" @click="createJob('JAR')" /> -->
          <img src="@/assets/images/新建任务.png" alt @click="createJob('JAR')" :class=[{changeCursor:!opCodesFlag},{newJarTask:opCodesFlag}] />
        </ndc-tooltip>
        <div class="icon-line"></div>
      </template>
      <template v-slot:right>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" content="删除">
          <!-- <i class="ndc-icon-delete" @click="remove" /> -->
          <img :class=[{changeCursor:!opCodesFlag},{deleteFile:opCodesFlag}] src="@/assets/images/删除.png" alt @click="remove" />
        </ndc-tooltip>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" v-if="filterMyJob" content="取消查看我的任务">
          <!-- <i class="ndc-icon-search3 active" @click="toggleViewMyJob" /> -->
          <img src="@/assets/images/icon_kuaisuchakan_hover.png" alt @click="toggleViewMyJob" />
        </ndc-tooltip>
        <ndc-tooltip position="top" v-else content="快速查看我的任务">
          <!-- <i class="ndc-icon-search3" @click="toggleViewMyJob" /> -->
          <img class="fastSee" src="@/assets/images/快速查看.png" alt @click="toggleViewMyJob" />
        </ndc-tooltip>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" content="定位任务">
          <!-- <i class="ndc-icon-position" @click="locateJob" /> -->
          <img class="dingwei" src="@/assets/images/定位任务.png" alt @click="locateJob" />
        </ndc-tooltip>
      </template>
    </m-nav-header>

    <div class="m-nav-tree" @click.right="onRightClickTree">
      <ndc-tree
        ref="tree"
        :data="jobs"
        :selected-nodes="selectedNodes"
        :filter-node-method="filterNodes"
        :is-filter="isFilter"
        :draggable="true"
        :parent-draggable="false"
        :is-drag="isDrag"
        @node-click="onJobTreeClick"
        @node-dblclick="onJobTreeDblClick"
        @node-right-click="onJobTreeRightClick"
        @node-drag-start="onNodeDragStart"
        @node-drag-end="onNodeDragEnd"
        @node-drag-enter="onNodeDragEnter"
        @node-drag-leave="onNodeDragLeave"
      >
        <template v-slot:node="scope">
          <span class="g-flex-ac" style="position: relative;width: 0;flex: 1;">
<!--            已上线 文件名前面的小圆点-->
<!--            <ndc-tooltip content="已上线" class="status" v-if="!scope.node.isFolder && scope.node.deployed">-->
<!--              <div class="job-status"></div>-->
<!--            </ndc-tooltip>-->
           <img v-if="scope.node.isFolder && scope.node.expand" src="@/assets/images/icon_floder.png" />
            <img v-else-if="scope.node.isFolder" src="@/assets/images/icon_floder.png" />
            <i v-else-if="scope.node.jobType === 'SQL'" class="ndc-icon-sql_line g-mr-8" />
            <i v-else class="ndc-icon-jar_line g-mr-8" />
            <span class="g-text-nowrap" :title="scope.node.jobName">{{ scope.node.jobName }}</span>
            <ndc-tooltip v-if="scope.node.tagIds && scope.node.tagIds.length" :content="getNodeTags(scope.node.tagIds)">
              <i class="ndc-icon-tag g-ml-8" />
            </ndc-tooltip>
          </span>
        </template>
      </ndc-tree>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Inject, Watch, Prop } from 'vue-property-decorator';

import { State, Mutation, Action } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';
import { IJobTreeNode, IMenuItem, ITab, ITag, IJob, ISimpleFile } from '@utils/types';
import UContextMenu from '@components/context-menu/context-menu.vue';
import MNavHeader from '../nav-header/index.vue';

import ModalMixin from '../../../components/modal/mixin';
import navMixin from '../../navMixin';
import { cloneDeep } from 'lodash';
import { EDITOR_CMD, JOB_EVENTS, JOB_TYPES } from '../../constant';
import { MODAL_TYPE } from '../../../components/modal/constant';
import Bus from '@/bus';
// import treeVue from '../../../../../../ndc-ui/packages/tree/src/tree.vue';
// 引入获取权限请求
import { getOpCodes } from '@/utils/getOpcodes';
import { trackEvent } from "@/utils/trackEvent";
const folderMenuItems: IMenuItem[] = [
  {
    key: 'delete',
    label: '删除'
  },
  {
    key: 'rename',
    label: '重命名'
  },
  {
    key: 'create',
    label: '新建文件夹'
  },
  {
    key: 'createJAR',
    label: '新建JAR任务'
  }
];

const jobMenuItems: IMenuItem[] = [
  {
    key: 'copy',
    label: '复制'
  },
  {
    key: 'delete',
    label: '删除'
  }
];
// const jobMenuItems: IMenuItem[] = [{
//   key: 'delete',
//   label: '删除'
// }, {
//   key: 'label',
//   label: '关联标签'
// }];

const emptyMenuItems: IMenuItem[] = [
  {
    key: 'create',
    label: '新建文件夹'
  }
];

@Component({
  components: {
    MNavHeader
  }
})
export default class MJarNav extends Mixins(navMixin) {
  @State('jarList', MODULE_NAMESPACE.develop_v3)
  private jobList!: IJobTreeNode[]

  @State('tabs', MODULE_NAMESPACE.develop_v3)
  private tabs!: ITab[]

  @State('activeTab', MODULE_NAMESPACE.develop_v3)
  private activeTab!: string

  @State('userId', MODULE_NAMESPACE.global)
  private userId!: string

  // 监听父组件sql-nav下拉按钮的传值，做出新建文件夹或新建任务
  private emitCreateFolderFlag:boolean = false
  private emitCreateJobFlag:boolean = false
  @Prop({
    default: false
  })
  private newJarFolderFlag!: boolean

  @Watch('newJarFolderFlag')
  private newJarFolderFlagChanged() {
    console.log(this.newJarFolderFlag, 'newJarFolderFlag');
    if (this.newJarFolderFlag) {
      this.createFolder(true);
      this.emitCreateFolderFlag = true;
    }
  }

  @Prop({
    default: false
  })
  private newJarJobFlag!: boolean

  @Watch('newJarJobFlag')
  private newJarJobFlagChanged() {
    console.log(this.newJarJobFlag, 'newJarJobFlag');
    if (this.newJarJobFlag) {
      this.createJob('JAR');
      this.emitCreateJobFlag = true;
    }
  }

  // 新增
  // @State('jobList', MODULE_NAMESPACE.develop_v3)
  // private jobList!: IJobTreeNode[];

  private selectedNode: IJobTreeNode | null = null
  private jobContextMenuInstance: UContextMenu | null = null
  private folderContextMenuInstance: UContextMenu | null = null
  private emptyContextMenuInstance: UContextMenu | null = null
  private renameModalInstance: ModalMixin | null = null
  private folderModalInstance: ModalMixin | null = null
  private filterMyJob: boolean = false
  private locateAfterInit: boolean = false
  private dragNode: IJobTreeNode | null = null
  private targetNode: IJobTreeNode | null = null
  private selectNodes: string[] = []
  private isDrag: Boolean = false
  private folderMenuItems: any
  private jobMenuItems: any
  // 新增获取权限操作码
  private opCodesFlag: Boolean = true

  @Action('getMetadataTableList', MODULE_NAMESPACE.develop_v3)
  private getMetadataTableList!: any
  // 新增 新建JAR任务
  private jobTypes = JOB_TYPES
  private jobModalInstance: ModalMixin | null = null

  private get jobs(): IJobTreeNode[] {
    const func = (nodes: IJobTreeNode[] = []): IJobTreeNode[] => {
      let result: IJobTreeNode[] = [];
      for (let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];
        if (!node.id) {
          if (node.jobId) {
            const n: IJobTreeNode = Object.assign({}, node, {
              key: 'job_' + node.jobId,
              isFolder: false
            }) as IJobTreeNode;
            result.push(n);
          }
          continue;
        }
        const treeNode: IJobTreeNode = Object.assign({}, node, {
          key: 'folder_' + node.id.toString(),
          jobName: node.folderName,
          isFolder: true,
          children: []
        });
        if (node.folders) {
          const child = func(node.folders as IJobTreeNode[]);
          treeNode.children = (treeNode.children || []).concat(child);
        }
        if (node.jobs && node.jobs.length) {
          node.jobs.forEach(job => {
            const n: IJobTreeNode = Object.assign({}, job, {
              key: 'job_' + job.jobId,
              isFolder: false
            }) as IJobTreeNode;
            treeNode.children && treeNode.children.push(n);
          });
        }
        result.push(treeNode);
      }
      return result;
    };
    return func(this.jobList);
  }

  private get selectedNodes(): string[] {
    const nodes: string[] = this.selectedNode && this.selectedNode.key ? [this.selectedNode.key] : [];
    return (this.selectNodes || []).concat(nodes);
  }

  @Watch('jobs')
  private onJobsChanged() {
    if (this.locateAfterInit) {
      this.locateJob();
      this.locateAfterInit = false;
    }
  }

  public get isFilter(): boolean {
    if (this.keywords || this.filterMyJob || this.selectedTags.length) {
      return true;
    }
    return false;
  }

  @Mutation('SET_TABS', MODULE_NAMESPACE.develop_v3)
  private setTabs: any

  @Mutation('SET_ACTIVETAB', MODULE_NAMESPACE.develop_v3)
  private setActiveTab: any

  @Action('getJobList', MODULE_NAMESPACE.develop_v3)
  private getJobList: any

  // 新增createJob 新建JAR任务
  private get jobNames() {
    const func = (nodes: IJobTreeNode[] = []): string[] => {
      let result: string[] = [];
      for (let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];
        if (!node.id) {
          continue;
        }
        if (node.folders) {
          const child = func(node.folders as IJobTreeNode[]);
          result = result.concat(child);
        }
        if (node.jobs && node.jobs.length) {
          node.jobs.forEach(job => {
            result.push(job.jobName || '');
          });
        }
      }
      return result.filter(Boolean);
    };

    return func(this.jobList);
  }
  private get isFolderEmpty() {
    return !this.jobList.length;
  }
  private createJob(val: string) {
    if (!this.opCodesFlag) {

    } else {
      this.create({
        type: val
      });
    }
  }
  private create(data: any, isCopy: boolean = false) {
    if (!this.jobModalInstance) {
      this.jobModalInstance = this.$createModalInstance(MODAL_TYPE.createJob_v3);
    }
    this.jobModalInstance &&
      this.jobModalInstance.show(
        this.isRightJar ? Object.assign({}, data, {
          position: this.selectedNode && this.selectedNode.id,
          jobNames: this.jobNames
        }) : Object.assign({}, data, {
          isCopy,
          position: data.parentId,
          jobNames: this.jobNames
        }),
        async (args: any) => {
          try {
            this.jobModalInstance && this.jobModalInstance.showLoading();
            // 如果是复制任务 就不使用获取jobModal里的 kernelId数据 那里面初始化kernellist会直接吧kernelId 换成list的第一个
            let kernelId = isCopy ? data.kernelId : args.kernelName;
            const params: any = {
              type: args.type || args.jobType,
              jobName: args.jobName,
              parentId: args.position,
              description: args.description,
              clusterId: args.clusterId,
              kernelId: kernelId,
              queueId: args.queueId,
              srcJobId: data.jobId
            };
            if (args.clusterType && args.clusterType.toLocaleUpperCase() === 'K8S') {
              params.imageId = args.imageId;
            }
            const job: IJob = await this.$request(isCopy ? 'copyJob' : 'createJob', params);
            if (isCopy) {
              await this.copyJobInfo(job, data);
            }
            trackEvent({ btn_title: '新建JAR任务按钮', btn_id: 'btn_002' }, 'btn_click');
            this.$ndcmessage.success(isCopy ? '复制任务成功' : '新建任务成功');
            await this.getJobList({ jobType: 'JAR' });
            const { jobId, jobName, jobType } = job;
            this.openNewTab({
              name: jobId.toString(),
              label: jobName,
              type: jobType
            });
            Bus.$emit(JOB_EVENTS.new, jobId.toString());
            return true;
          } catch (e) {
            this.jobModalInstance && this.jobModalInstance.setError(e.message);
          } finally {
            this.jobModalInstance && this.jobModalInstance.hideLoading();
          }
        }
      );
    this.isRightJar = false;
    // 向sql-nav传值，让newJarFolderFlag 置false
    this.emitCreateJobFlag = false;
    this.$emit('newJarJobFlag', this.emitCreateJobFlag);
  }
  /**
   * 复制任务需要复制关联标签，资源文件
   */
  private async copyJobInfo(job: IJob, data: any) {
    const params = this.getJobParams(data);
    const promiseArr = [this.$request('updateJob', Object.assign({}, job, params))];
    if (data.tagIds) {
      promiseArr.push(
        this.$request('linkTag', {
          objId: job.jobId,
          objType: 'JOB',
          tagIds: data.tagIds
        })
      );
    }
    if (data.fileList) {
      promiseArr.push(
        this.$request('updateDependency', {
          jobId: job.jobId,
          fileList: data.fileList.map((file: ISimpleFile) => file.id),
          mammutKyb: data.mammutKyb
        })
      );
    }
    return Promise.all(promiseArr);
  }
  private openNewTab(tab: ITab) {
    if (!tab.name) {
      return;
    }
    const tabs = cloneDeep(this.tabs);
    const index = tabs.findIndex(t => t.name === tab.name);
    const idx = tabs.findIndex(t => t.name === this.activeTab);
    if (index === -1) {
      if (idx !== -1) {
        tabs.splice(idx, 0, tab);
      } else {
        tabs.push(tab);
      }
      this.setTabs(tabs);
    }
    this.setActiveTab(tab.name);
  }
  private getJobParams(data: IJob) {
    if (data.jobType === 'SQL') {
      const { rawSql, runParameter = {}, extRunParameter } = data;
      return {
        rawSql,
        extRunParameter,
        runParameter
      };
    } else {
      const { mainArgs, mainClass, extRunParameter, runParameter = {} } = data;
      return {
        mainArgs,
        mainClass,
        extRunParameter,
        runParameter
      };
    }
  }

  public filterNodes(node: IJobTreeNode) {
    let valid = this.keywords ? (node.jobName && node.jobName.includes(this.keywords)) || false : true;
    valid = valid && (this.filterMyJob ? node.creator === this.userId : true);
    valid = valid && (this.selectedTags.length ? this.filterTags(node) : true);
    return valid;
  }

  public beforeDestroy() {
    this.folderModalInstance && this.folderModalInstance.hide();
    this.folderModalInstance = null;
    this.renameModalInstance && this.renameModalInstance.hide();
    this.renameModalInstance = null;
    Bus.$off(JOB_EVENTS.new, this.locateJob);
    Bus.$off(JOB_EVENTS.mount, this.locateJob);
  }
  private created() {
    this.showRightClick();
  }

  private mounted() {
    Bus.$on(JOB_EVENTS.new, this.locateJob);
    Bus.$on(JOB_EVENTS.mount, this.locateJob);
  }
  // 新增获取权限操作码
  private async showRightClick() {
    let result = await getOpCodes({});
    if (result.opCodes.includes('rtdev_proj.devtest') === true) {
      this.opCodesFlag = true;
    } else {
      this.opCodesFlag = false;
    }
    folderMenuItems.map(element => {
      element['disabled'] = !this.opCodesFlag;
    });
    jobMenuItems.map(element => {
      element['disabled'] = !this.opCodesFlag;
    });
  }
  private createFolder(isRoot: boolean = true) {
    if (this.opCodesFlag) {
      if (!this.folderModalInstance) {
        this.folderModalInstance = this.$createModalInstance(MODAL_TYPE.createFolder_v3);
      }
      this.folderModalInstance &&
      this.folderModalInstance.show(
        {
          type: 'JAR',
          position: isRoot ? -1 : this.selectedNode && this.selectedNode.id
        },
        async (args: any) => {
          try {
            const id = await this.$request('createDirectory', {
              name: args.folderName,
              parentId: args.position,
              dirType: args.type
            });
            await this.getJobList({ jobType: 'JAR' });
            this.$ndcmessage.success('新建文件夹成功');
            id && this.locate(id.toString(), true);
            return true;
          } catch (e) {
            this.folderModalInstance && this.folderModalInstance.setError(e.message);
          }
        }
      );
      // 向sql-nav传值，让newJarFolderFlag 置false
      this.emitCreateFolderFlag = false;
      this.$emit('newJarFolderFlag', this.emitCreateFolderFlag);
    }
  }

  private rename() {
    if (!this.renameModalInstance) {
      this.renameModalInstance = this.$createModalInstance(MODAL_TYPE.rename);
    }
    this.renameModalInstance &&
      this.renameModalInstance.show(
        {
          name: this.selectedNode && this.selectedNode.folderName
        },
        async (args: any) => {
          try {
            await this.$request(
              'updateDirectory',
              Object.assign({}, args, {
                dirId: this.selectedNode && this.selectedNode.id
              })
            );
            await this.getJobList({ jobType: 'JAR' });
            this.$ndcmessage.success('重命名文件夹成功');
            return true;
          } catch (e) {
            this.renameModalInstance && this.renameModalInstance.setError(e.message);
          }
        }
      );
  }

  // 新增 复制copy
  private async copyJob() {
    const node = this.selectedNode;
    if (!node) {
      return;
    }
    try {
      const jobDetail: IJob = await this.$request('getJobDetail', {
        jobId: node.jobId
      }); // 获取当前任务信息
      jobDetail.jobName = jobDetail.jobName + '_copy';
      jobDetail.type = 'JAR';
      if (!jobDetail.flinkJarMd5) {
        this.$message.error('jar任务包为空无法复制');
        return;
      }
      this.create(jobDetail, true);
    } catch (e) {
      this.$handleException(e, '任务复制失败');
    }
  }

  private link() {
    if (this.selectedNode) {
      const tagIds = this.selectedNode.tagIds || [];
      this.linkLabel(tagIds, this.selectedNode.jobId, 'JOB', async () => {
        await this.getJobList({ jobType: 'JAR' });
      });
    }
  }

  private remove() {
    if (!this.opCodesFlag) {

    } else {
      const node = this.selectedNode;
      if (!node) {
        return;
      }
      if (node.isFolder) {
        // 文件夹需要先判断是否为空文件夹，是则弹窗提示删除，否则弹窗提示不能删除
        if (node.folders.length || node.jobs.length) {
          this.$ndcconfirm({
            content: '请先删除文件夹中的文件',
            desc: '需清空文件夹中的文件方可进行删除操作。',
            cancelButton: ''
          });
        } else {
          this.removeFolder(node);
        }
        return;
      }
      // 任务需要先判断是否已上线，是则弹窗提示不能删除，否则弹窗提示删除
      // if (node.deployed) {
      //   return this.$ndcconfirm({
      //     content: '任务已上线，无法删除',
      //     desc: `任务名称：${node.jobName}`,
      //     cancelButton: ''
      //   });
      // }
      this.removeJob(node);
    }
  }

  private removeFolder(node: IJobTreeNode) {
    this.$ndcconfirm({
      content: '删除文件夹',
      onConfirm: async () => {
        try {
          await this.$request('deleteDirectory', {
            dirId: node.id
          });
          await this.getJobList({ jobType: 'JAR' });
          this.$ndcmessage.success('删除文件夹成功');
        } catch (e) {
          this.$handleException(e, '删除文件夹失败');
        }
      }
    });
  }

  private removeJob(node: IJobTreeNode) {
    this.$ndcconfirm({
      content: '删除任务',
      desc: '任务删除后将无法恢复，确认删除吗？',
      onConfirm: async () => {
        try {
          await this.$request('deleteJob', {
            jobId: node.jobId
          });
          await this.getJobList({ jobType: 'JAR' });
          this.closeTab(node.jobId.toString());
          this.$ndcmessage.success('删除任务成功');
        } catch (e) {
          this.$handleException(e, '删除任务失败');
        }
      }
    });
  }

  private closeTab(tab: string) {
    const index = this.tabs.findIndex(t => t.name === tab);
    if (index === -1) {
      return;
    }
    const tabs = this.tabs.concat();
    tabs.splice(index, 1);
    this.setTabs(tabs);
    if (this.activeTab === tab) {
      const activeTab: ITab | null = tabs.length === 0 ? null : tabs.length > index ? tabs[index] : tabs[tabs.length - 1];
      this.setActiveTab((activeTab && activeTab.name) || '');
    }
  }

  private toggleViewMyJob() {
    this.filterMyJob = !this.filterMyJob;
  }

  private locate(id: string, isFolder) {
    const refTree = this.$refs.tree as any;
    if (refTree) {
      const expandKeys: string[] = this.selectLocateNode(this.jobs, id, isFolder);
      refTree.expand(expandKeys);
      this.$nextTick(() => {
        const ele = this.$el.getElementsByClassName('ndc-tree-item active');
        const dom = ele && ele[0];
        dom && dom.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  private locateJob() {
    if (!this.jobs.length) {
      this.locateAfterInit = true;
      return;
    }
    const refTree = this.$refs.tree as any;
    if (refTree) {
      const expandKeys: string[] = this.selectLocateNode(this.jobs);
      refTree.expand(expandKeys);
      this.$nextTick(() => {
        const ele = this.$el.getElementsByClassName('ndc-tree-item active');
        const dom = ele && ele[0];
        dom && dom.scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  private selectLocateNode(nodes: IJobTreeNode[], id: string = '', isFolder: boolean = false): string[] {
    const expandKeys: string[] = [];
    id = id || this.activeTab;
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      const nodeId = node.isFolder ? node.id.toString() : node.jobId.toString();
      if (((isFolder && node.isFolder) || (!isFolder && !node.isFolder)) && nodeId === id) {
        if (node.parentId && node.parentId !== -1) {
          expandKeys.push('folder_' + node.parentId);
        }
        this.selectedNode = node;
        return expandKeys;
      }
      if (node.children && node.children.length) {
        const result = this.selectLocateNode(node.children, id, isFolder);
        if (result && result.length) {
          if (node.parentId && node.parentId !== -1) {
            expandKeys.push('folder_' + node.parentId);
          }
          return expandKeys.concat(result);
        }
      }
    }
    return expandKeys;
  }

  private onJobTreeClick(node: IJobTreeNode) {
    this.selectedNode = node;
  }

  private onJobTreeDblClick(e: any) {
    console.log('dbClick', e);

    const node: IJobTreeNode = e.node;
    this.selectedNode = node;
    const key = node.key || '';
    if (!key) {
      return;
    }
    if (node.isFolder) {
      const tree = this.$refs.tree as any;
      tree && tree.toggleExpandNodes([key]);
      return;
    }
    if (this.tabs.length >= 20) {
      this.$ndcconfirm({
        content: '任务打开过多，请关闭一些再开。',
        cancelButton: ''
      });
      return;
    }
    const jobId = (node.jobId && node.jobId.toString()) || '';
    const tabs = cloneDeep(this.tabs);
    const index = tabs.findIndex(t => t.name === jobId);
    if (index === -1) {
      const tab = {
        name: jobId.toString(),
        label: node.jobName || jobId,
        type: node.jobType
      };
      const activeIndex = tabs.findIndex(t => t.name === this.activeTab);
      if (activeIndex !== -1) {
        tabs.splice(activeIndex + 1, 0, tab);
      } else {
        tabs.push(tab);
      }
      this.setTabs(tabs);
    }
    this.setActiveTab(jobId);
  }

  private onRightClickTree(e: MouseEvent) {
    e.preventDefault();
    if (!this.emptyContextMenuInstance) {
      this.emptyContextMenuInstance = this.$contextmenu(emptyMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'create') {
          return this.createFolder();
        }
      });
    }
    this.emptyContextMenuInstance && this.emptyContextMenuInstance.open(e);
  }

  private onJobTreeRightClick(e: any) {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
    this.selectedNode = e.node;
    if (e.node.isFolder) {
      return this.showFolderContextMenu(e);
    }
    this.showJobContextMenu(e);
  }
  private isRightJar:boolean =false
  private showFolderContextMenu(e: any) {
    if (!this.folderContextMenuInstance) {
      this.folderContextMenuInstance = this.$contextmenu(folderMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'delete') {
          return this.remove();
        }
        if (item.key === 'rename') {
          return this.rename();
        }
        if (item.key === 'create') {
          return this.createFolder(false);
        }
        if (item.key === 'createJAR') {
          this.isRightJar = true;
          return this.createJob('JAR');
        }
      });
    }
    this.jobContextMenuInstance && (this.jobContextMenuInstance as any).close();
    this.folderContextMenuInstance && (this.folderContextMenuInstance as any).open(e.event);
  }

  private showJobContextMenu(e: any) {
    if (!this.jobContextMenuInstance) {
      this.jobContextMenuInstance = this.$contextmenu(jobMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'delete') {
          return this.remove();
        }
        if (item.key === 'copy') {
          return this.copyJob();
        }
      });
    }
    this.folderContextMenuInstance && (this.folderContextMenuInstance as any).close();
    this.jobContextMenuInstance && (this.jobContextMenuInstance as any).open(e.event);
  }

  private onNodeDragStart(node: IJobTreeNode) {
    if (this.opCodesFlag) {
      if (node.isFolder) {
        return;
      }
      this.dragNode = node;
      this.isDrag = true;
    }
  }

  private async onNodeDragEnd() {
    if (this.opCodesFlag) {
      if (this.targetNode && this.dragNode) {
        const dstId = this.targetNode.isFolder ? this.targetNode.id : (this.targetNode.parent && this.targetNode.parent.id) || -1;
        if (dstId !== this.dragNode.parentId) {
          const args = {
            jobId: this.dragNode.jobId,
            jobType: this.dragNode.jobType,
            dstId
          };
          this.$ndcconfirm({
            content: '移动任务',
            desc: '是否确定移动任务？',
            onConfirm: async () => {
              try {
                await this.$request('moveJob', args);
                await this.getJobList({ jobType: 'JAR' });
                this.locate(args.jobId.toString(), false);
                this.$ndcmessage.success('移动任务成功');
              } catch (e) {
                this.$handleException(e, '移动任务失败');
              }
            }
          });
        }
      }
      this.dragNode = null;
      this.targetNode = null;
      this.selectNodes = [];
      this.isDrag = false;
    }
  }

  private onNodeDragEnter(node: IJobTreeNode) {
    if (this.opCodesFlag) {
      setTimeout(() => {
        const key = node.key || '';
        if (!key || (this.targetNode && node.key === this.targetNode.key)) {
          return;
        }
        this.targetNode = node;
        this.selectNodes = this.getNodesInSameFolder(node);
        const refTree = this.$refs.tree as any;
        if (node.isFolder) {
          refTree && refTree.expand([key]);
        }
        let parent = node.parent;
        while (parent) {
          refTree && parent.key && refTree.expand([parent.key]);
          parent = parent.parent;
        }
      }, 0);
    }
  }

  private getNodesInSameFolder(node: IJobTreeNode): string[] {
    if (node.isFolder) {
      return this.getChildrenNodes(node);
    }
    const parent = node.parent;
    if (parent) {
      return this.getChildrenNodes(parent);
    }
    return [];
  }

  private getChildrenNodes(node: IJobTreeNode) {
    const nodes: string[] = [];
    const func = (n: IJobTreeNode) => {
      if (n.key && !nodes.includes(n.key)) {
        nodes.push(n.key);
      }
      n.isFolder && (n.children || []).forEach(c => func(c));
    };
    func(node);
    return nodes;
  }

  private onNodeDragLeave(node: IJobTreeNode) {
    if (this.opCodesFlag) {
      this.targetNode = null;
      setTimeout(() => {
        if (!this.targetNode) {
          this.selectNodes = [];
        }
      }, 0);
    }
  }
}
</script>

<style lang="scss" scoped>
.m-job-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 28px;
 /deep/ .ndc-tooltip {
    .ndc-tooltip-target {
      .newfloder {
        &:hover {
          content: url('../../../../assets/images/icon_newfloder.png');
        }
      }
      .newJarTask {
        &:hover {
          content: url('../../../../assets/images/icon_newTask_hover.png');
        }
      }
      .deleteFile {
        &:hover {
          content: url('../../../../assets/images/icon_shanchu_hover.png');
        }
      }
      .changeCursor{
        &:hover{
          cursor: not-allowed;
        }
      }
      .fastSee {
        &:hover {
          content: url('../../../../assets/images/icon_kuaisuchakan_hover.png');
        }
      }
      .dingwei {
        &:hover {
          content: url('../../../../assets/images/icon_dingwei_hover.png');
        }
      }
    }
  }
  /*/deep/ .ndc-tooltip.status {
    position: absolute;
    left: -16px;
  }*/
  .job-status {
    position: absolute;
    top: 14px;
    left: -16px;
    width: 6px;
    height: 6px;
    border-radius: 6px;
    background: #3b68b7;
  }
  // .toolTipTop{
  //   margin-bottom: 5px;
  // }
  .ndc-tooltip-main__top {
    margin-bottom: 10px;
  }
}
</style>

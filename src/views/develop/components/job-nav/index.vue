<!--
<template>
  <div class="m-job-nav">
    <m-nav-header placeholder="任务名称" @refresh="getJobList" @tags-change="selectedTags = arguments[0]" @keywords-change="keywords = arguments[0]">
      &lt;!&ndash; <ndc-dropdown :items="jobTypes" :arrow-visible="true" @select="createJob(arguments[0].key)">
          <u-text-button>
            <img class="icon" src="../../../assets/images/icon_new.svg" />
            <span>新建任务</span>
          </u-text-button>
      </ndc-dropdown>&ndash;&gt;

      <template v-slot:left>
        <ndc-tooltip position="top" content="新建文件夹">
          <i class="ndc-icon-folder" @click="createFolder(true)" />
        </ndc-tooltip>
        <div class="icon-line"></div>
      </template>
      <template v-slot:right>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" content="删除">
          <i class="ndc-icon-delete" @click="remove" />
        </ndc-tooltip>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" v-if="filterMyJob" content="取消查看我的任务">
          <i class="ndc-icon-search3 active" @click="toggleViewMyJob" />
        </ndc-tooltip>
        <ndc-tooltip position="top" v-else content="快速查看我的任务">
          <i class="ndc-icon-search3" @click="toggleViewMyJob" />
        </ndc-tooltip>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" content="定位任务">
          <i class="ndc-icon-position" @click="locateJob" />
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
            <ndc-tooltip content="已上线" class="status" v-if="!scope.node.isFolder && scope.node.deployed">
              <div class="job-status"></div>
            </ndc-tooltip>
            <i v-if="scope.node.isFolder && scope.node.expand" class="ndc-icon-folder-open g-mr-8" />
            <i v-else-if="scope.node.isFolder" class="ndc-icon-folder-closed g-mr-8" />
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
import { Component, Mixins, Inject, Watch } from 'vue-property-decorator';

import { State, Mutation, Action } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';
import { IJobTreeNode, IMenuItem, ITab, ITag, IJob, ISimpleFile } from '@utils/types';
import UContextMenu from '@components/context-menu/context-menu.vue';
import MNavHeader from '../nav-header/index.vue';

import ModalMixin from '../../../components/modal/mixin';
import navMixin from '../../navMixin';
import { cloneDeep } from 'lodash';
import { EDITOR_CMD, JOB_EVENTS } from '../../constant';
// import { EDITOR_CMD, JOB_EVENTS, JOB_TYPES } from '../../constant';
import { MODAL_TYPE } from '../../../components/modal/constant';
import Bus from '@/bus';

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
  }
];

const jobMenuItems: IMenuItem[] = [
  {
    key: 'delete',
    label: '删除'
  },
  {
    key: 'label',
    label: '关联标签'
  }
];

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
export default class MJobNav extends Mixins(navMixin) {
  @State('jobList', MODULE_NAMESPACE.develop)
  private jobList!: IJobTreeNode[]

  @State('tabs', MODULE_NAMESPACE.develop)
  private tabs!: ITab[]

  @State('activeTab', MODULE_NAMESPACE.develop)
  private activeTab!: string

  @State('userId', MODULE_NAMESPACE.global)
  private userId!: string

  // 新增
  // @State('jobList', MODULE_NAMESPACE.develop)
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

  // 新增
  // private jobTypes = JOB_TYPES;
  // private jobModalInstance: ModalMixin | null = null;

  private get jobs(): IJobTreeNode[] {
    const func = (nodes: IJobTreeNode[] = []): IJobTreeNode[] => {
      let result: IJobTreeNode[] = [];
      for (let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];
        if (!node.id) {
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

  @Mutation('SET_TABS', MODULE_NAMESPACE.develop)
  private setTabs: any

  @Mutation('SET_ACTIVETAB', MODULE_NAMESPACE.develop)
  private setActiveTab: any

  @Action('getJobList', MODULE_NAMESPACE.develop)
  private getJobList: any

  // 新增createJob
  //  private get jobNames() {
  //     const func = (nodes: IJobTreeNode[] = []): string[] => {
  //       let result: string[] = [];
  //       for (let i = 0, len = nodes.length; i < len; i++) {
  //         const node = nodes[i];
  //         if (!node.id) {
  //           continue;
  //         }
  //         if (node.folders) {
  //           const child = func(node.folders as IJobTreeNode[]);
  //           result = result.concat(child);
  //         }
  //         if (node.jobs && node.jobs.length) {
  //           node.jobs.forEach(job => {
  //             result.push(job.jobName || '');
  //           });
  //         }
  //       }
  //       return result.filter(Boolean);
  //     };

  //     return func(this.jobList);
  //   }
  //  private get isFolderEmpty() {
  //     return !this.jobList.length;
  //   }
  //   private createJob(val: string) {
  //     if (this.isFolderEmpty) {
  //       return this.$ndcconfirm({
  //         content: '请先建一个文件夹',
  //         cancelButton: ''
  //       });
  //     }
  //     this.create({
  //       type: val
  //     });
  //   }
  //   private create(data: any, isCopy: boolean = false) {
  //     if (!this.jobModalInstance) {
  //       this.jobModalInstance = this.$createModalInstance(MODAL_TYPE.createJob);
  //     }
  //     this.jobModalInstance && this.jobModalInstance.show(Object.assign({}, data, {
  //       isCopy,
  //       position: data.parentId,
  //       jobNames: this.jobNames
  //     }), async (args: any) => {
  //       try {
  //         this.jobModalInstance && this.jobModalInstance.showLoading();
  //         const params: any = {
  //           type: args.type || args.jobType,
  //           jobName: args.jobName,
  //           parentId: args.position,
  //           description: args.description,
  //           clusterId: args.clusterId,
  //           kernelId: args.kernelId,
  //           queueId: args.queueId,
  //           srcJobId: Number(this.activeTab)
  //         };
  //         if (args.clusterType && args.clusterType.toLocaleUpperCase() === 'K8S') {
  //           params.imageId = args.imageId;
  //         }
  //         const job: IJob = await this.$request(isCopy ? 'copyJob' : 'createJob', params);
  //         if (isCopy) {
  //           await this.copyJobInfo(job, data);
  //         }
  //         this.$ndcmessage.success(isCopy ? '复制任务成功' : '新建任务成功');
  //         await this.getJobList();
  //         const { jobId, jobName, jobType } = job;
  //         this.openNewTab({
  //           name: jobId.toString(),
  //           label: jobName,
  //           type: jobType
  //         });
  //         Bus.$emit(JOB_EVENTS.new, jobId.toString());
  //         return true;
  //       } catch (e) {
  //         this.jobModalInstance && this.jobModalInstance.setError(e.message);
  //       } finally {
  //         this.jobModalInstance && this.jobModalInstance.hideLoading();
  //       }
  //     });
  //   }
  //   /**
  //    * 复制任务需要复制关联标签，资源文件
  //    */
  //   private async copyJobInfo(job: IJob, data: any) {
  //     const params = this.getJobParams(data);
  //     const promiseArr = [this.$request('updateJob', Object.assign({}, job, params))];
  //     if (data.tagIds) {
  //       promiseArr.push(this.$request('linkTag', {
  //         objId: job.jobId,
  //         objType: 'JOB',
  //         tagIds: data.tagIds
  //       }));
  //     }
  //     if (data.fileList) {
  //       promiseArr.push(this.$request('updateDependency', {
  //         jobId: job.jobId,
  //         fileList: data.fileList.map((file: ISimpleFile) => file.id),
  //         mammutKyb: data.mammutKyb
  //       }));
  //     }
  //     return Promise.all(promiseArr);
  //   }
  //  private openNewTab(tab: ITab) {
  //     if (!tab.name) {
  //       return;
  //     }
  //     const tabs = cloneDeep(this.tabs);
  //     const index = tabs.findIndex(t => t.name === tab.name);
  //     const idx = tabs.findIndex(t => t.name === this.activeTab);
  //     if (index === -1) {
  //       if (idx !== -1) {
  //         tabs.splice(idx, 0, tab);
  //       } else {
  //         tabs.push(tab);
  //       }
  //       this.setTabs(tabs);
  //     }
  //     this.setActiveTab(tab.name);
  //   }
  // private getJobParams(data: IJob) {
  //     if (data.jobType === 'SQL') {
  //       const { rawSql, runParameter = {}, extRunParameter } = data;
  //       return {
  //         rawSql,
  //         extRunParameter,
  //         runParameter
  //       };
  //     }
  //     const { mainArgs, mainClass, extRunParameter, runParameter = {} } = data;
  //     return {
  //       mainArgs,
  //       mainClass,
  //       extRunParameter,
  //       runParameter
  //     };
  //   }

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

  private mounted() {
    Bus.$on(JOB_EVENTS.new, this.locateJob);
    Bus.$on(JOB_EVENTS.mount, this.locateJob);
  }

  private createFolder(isRoot: boolean = true) {
    if (!this.folderModalInstance) {
      this.folderModalInstance = this.$createModalInstance(MODAL_TYPE.createFolder);
    }
    this.folderModalInstance &&
      this.folderModalInstance.show(
        {
          type: 'JOB',
          position: isRoot ? -1 : this.selectedNode && this.selectedNode.id
        },
        async (args: any) => {
          try {
            const id = await this.$request('createDirectory', {
              name: args.folderName,
              parentId: args.position,
              dirType: args.type
            });
            await this.getJobList();
            this.$ndcmessage.success('新建文件夹成功');
            id && this.locate(id.toString(), true);
            return true;
          } catch (e) {
            this.folderModalInstance && this.folderModalInstance.setError(e.message);
          }
        }
      );
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
            await this.getJobList();
            this.$ndcmessage.success('重命名文件夹成功');
            return true;
          } catch (e) {
            this.renameModalInstance && this.renameModalInstance.setError(e.message);
          }
        }
      );
  }

  private link() {
    if (this.selectedNode) {
      const tagIds = this.selectedNode.tagIds || [];
      this.linkLabel(tagIds, this.selectedNode.jobId, 'JOB', async () => {
        await this.getJobList();
      });
    }
  }

  private remove() {
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
    if (node.deployed) {
      return this.$ndcconfirm({
        content: '任务已上线，无法删除',
        desc: `任务名称：${node.jobName}`,
        cancelButton: ''
      });
    }
    this.removeJob(node);
  }

  private removeFolder(node: IJobTreeNode) {
    this.$ndcconfirm({
      content: '删除文件夹',
      onConfirm: async () => {
        try {
          await this.$request('deleteDirectory', {
            dirId: node.id,
            userId: 'fe_2@163.org'
          });
          await this.getJobList();
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
          await this.getJobList();
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
    console.log('dbclick', e);

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
      });
    }
    this.folderContextMenuInstance && this.folderContextMenuInstance.open(e.event);
  }

  private showJobContextMenu(e: any) {
    if (!this.jobContextMenuInstance) {
      this.jobContextMenuInstance = this.$contextmenu(jobMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'delete') {
          return this.remove();
        }
        if (item.key === 'label') {
          return this.link();
        }
      });
    }
    this.jobContextMenuInstance && this.jobContextMenuInstance.open(e.event);
  }

  private onNodeDragStart(node: IJobTreeNode) {
    if (node.isFolder) {
      return;
    }
    this.dragNode = node;
    this.isDrag = true;
  }

  private async onNodeDragEnd() {
    if (this.targetNode && this.dragNode) {
      const dstId = this.targetNode.isFolder ? this.targetNode.id : (this.targetNode.parent && this.targetNode.parent.id) || -1;
      if (dstId !== this.dragNode.parentId) {
        const args = {
          jobId: this.dragNode.jobId,
          dstId
        };
        this.$ndcconfirm({
          content: '移动任务',
          desc: '是否确定移动任务？',
          onConfirm: async () => {
            try {
              await this.$request('moveJob', args);
              await this.getJobList();
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

  private onNodeDragEnter(node: IJobTreeNode) {
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
    this.targetNode = null;
    setTimeout(() => {
      if (!this.targetNode) {
        this.selectNodes = [];
      }
    }, 0);
  }
}
</script>

<style lang="scss">
.m-job-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  .ndc-tooltip.status {
    position: absolute;
    left: -16px;
  }
  .job-status {
    width: 6px;
    height: 6px;
    border-radius: 6px;
    background: #3b68b7;
  }
}
</style>
-->

<!--
<template>
  <div class="m-ide">
    <div class="m-ide-job" v-if="tabs.length">
      &lt;!&ndash; 工具栏 &ndash;&gt;
      <div class="m-ide-toolbar">
        <ndc-dropdown :items="jobTypes" :arrow-visible="true" @select="createJob(arguments[0].key)">
          <u-text-button>
            <img class="icon" src="../../assets/images/icon_new.svg" />
            <span>新建任务</span>
          </u-text-button>
        </ndc-dropdown>
        <u-text-button class="g-ml-16" @click="copyJob">
          <img class="icon" src="../../assets/images/icon_copy.svg" />
          <span>复制</span>
        </u-text-button>
        <u-text-button @click="saveJob">
          <img class="icon" src="../../assets/images/icon_save.svg" />
          <span>保存</span>
        </u-text-button>
        <u-text-button @click="debugJob" :disabled="tab && tab.type === 'JAR'">
          <img class="icon" src="../../assets/images/icon_debug.svg" />
          <span>调试</span>
        </u-text-button>
        <u-text-button @click="checkGrammar" :disabled="tab && tab.type === 'JAR'">
          <img class="icon" src="../../assets/images/icon_check.svg" />
          <span>语法检查</span>
        </u-text-button>
        <u-text-button @click="releaseJob">
          <img class="icon" src="../../assets/images/icon_online.svg" />
          <span>上线</span>
        </u-text-button>
        <u-text-button @click="markJob">
          <img class="icon" src="../../assets/images/icon_tag2.svg" />
          <span>关联标签</span>
        </u-text-button>
        <u-text-button @click="formatJob" :disabled="tab && tab.type === 'JAR'">
          <img class="icon" src="../../assets/images/icon_format.svg" />
          <span>格式化</span>
        </u-text-button>
        <u-text-button @click="addResource">
          <img class="icon" src="../../assets/images/icon_relate.svg" />
          <span>关联资源文件</span>
          &lt;!&ndash; <resource-files @open-resource="addResource"></resource-files> &ndash;&gt;
        </u-text-button>
      </div>

      &lt;!&ndash; 标签页 &ndash;&gt;
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
            <img v-if="scope.tab.type === 'SQL'" src="../../assets/images/sql.svg" />
            <img v-else src="../../assets/images/jar.svg" />
            <span
              class="g-text-nowrap"
              :title="scope.tab.label"
              style="max-width: 250px;"
            >{{scope.tab.label}}</span>
          </template>
          <ndc-tab-panel class="m-ide-main" v-for="item in tabs" :key="item.name" :name="item.name">
            <m-ide-panel
              :ref="'panel_' + item.name"
              :job-id="item.name"
              @debug="onDebugChange"
              @ide-modified="onIdeModified"
            ></m-ide-panel>
          </ndc-tab-panel>
        </ndc-tabs>
      </div>
    </div>

    <div v-else class="m-ide-new">
      <div class="new-item">
        <img src="../../assets/images/pic_createfile.svg" />
        <ndc-button theme="primary" @click="createFolder">新建文件夹</ndc-button>
      </div>
      <div class="new-item">
        <img src="../../assets/images/pic_createflow.svg" />
        <ndc-button theme="primary" @click="createJob('SQL')">新建SQL任务</ndc-button>
      </div>
      <div class="new-item">
        <img src="../../assets/images/pic_createflow.svg" />
        <ndc-button theme="primary" @click="createJob('JAR')">新建JAR任务</ndc-button>
      </div>
    </div>

    <div class="m-ide-detail" v-if="detailVisible">
      <m-detail-panel
        ref="detailPanel"
        @close="onCloseDetail"
        :active-tab="detailType"
        :info="detailInfo"
      ></m-detail-panel>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Provide } from "vue-property-decorator";
import { State, Mutation, Action } from "vuex-class";
import MIdePanel from "./components/ide-panel/index.vue";
import UContextMenu from "@components/context-menu/context-menu.vue";
import MSqlEditor from "./components/sql-editor/index.vue";
import MDetailPanel from "./components/detail-panel/index.vue";
import ModalMixin from "../components/modal/mixin";

import {
  IJob,
  ITab,
  IMenuItem,
  IQueue,
  IKernel,
  ICluster,
  IDetail,
  IMetadata,
  ITag,
  IFile,
  IJobTreeNode,
  ISimpleFile
} from "@utils/types";
import { JOB_TYPES, EDITOR_CMD, JOB_EVENTS } from "./constant";
import { cloneDeep } from "lodash";
import { MODAL_TYPE } from "../components/modal/constant";
import { MODULE_NAMESPACE } from "@utils/constant";
import Bus from "@/bus";
// import resourceFiles from "./components/resource-files/index.vue";

const tabMenuItems: IMenuItem[] = [
  {
    key: "current",
    label: "关闭当前任务"
  },
  {
    key: "others",
    label: "关闭其他任务"
  },
  {
    key: "right",
    label: "关闭右侧任务"
  }
];

@Component({
  components: {
    MIdePanel,
    MSqlEditor,
    MDetailPanel
    // resourceFiles,
  }
})
export default class MIde extends Vue {
  @State("tabs", MODULE_NAMESPACE.develop)
  private tabs!: ITab[];

  @State("activeTab", MODULE_NAMESPACE.develop)
  private activeTab!: string;

  @State("jobList", MODULE_NAMESPACE.develop)
  private jobList!: IJobTreeNode[];

  @Provide()
  private ide = this;

  private debugingJob: string = "";
  private jobTypes = JOB_TYPES;
  private tabContextMenuInstance: UContextMenu | null = null;
  private selectedTab: string = "";
  public detailVisible: boolean = false;
  private detailType: string = "";
  private detailInfo: IMetadata | ITag | IFile | null = null;
  private folderModalInstance: ModalMixin | null = null;
  private jobModalInstance: ModalMixin | null = null;
  private refTabs?: any;
  private tab: ITab | null = null;

  @Watch("activeTab")
  private onActiveTabChanged() {
    this.tab = this.tabs.find((t) => t.name === this.activeTab) || null;
    if (!this.tab && this.tabs.length) {
      this.setActiveTab(this.tabs[0].name);
    }
    this.$nextTick(() => {
      this.executeCommand(EDITOR_CMD.init);
    });
  }

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
          node.jobs.forEach((job) => {
            result.push(job.jobName || "");
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

  public executeCommand(cmd: number, args?: any) {
    if (cmd === EDITOR_CMD.resize) {
      this.resize();
    }
    const panels = this.$refs["panel_" + this.activeTab] as MIdePanel[];
    if (panels && panels.length) {
      const idePanel = panels[0];
      idePanel && idePanel.executeCommand(cmd, args);
    }
  }

  public openDetail(data: IDetail) {
    this.detailType = data.type;
    this.detailInfo = data.info;
    this.detailVisible = true;
    this.$nextTick(() => {
      if (this.detailType === "metadata") {
        const panel = this.$refs.detailPanel as MDetailPanel;
        panel && panel.resize();
      }
      this.executeCommand(EDITOR_CMD.resize);
    });
  }

  @Mutation("SET_ACTIVETAB", MODULE_NAMESPACE.develop)
  private setActiveTab!: any;

  @Mutation("SET_TABS", MODULE_NAMESPACE.develop)
  private setTabs!: any;

  @Action("getJobList", MODULE_NAMESPACE.develop)
  private getJobList!: any;

  private mounted() {
    if (this.activeTab) {
      this.tab = this.tabs.find((t) => t.name === this.activeTab) || null;
      this.executeCommand(EDITOR_CMD.init);
      this.$nextTick(() => {
        Bus.$emit(JOB_EVENTS.mount);
      });
    }
    this.refTabs = this.$refs.tabs as any;
  }

  private beforeDestroy() {
    this.folderModalInstance && this.folderModalInstance.hide();
    this.folderModalInstance = null;
    this.jobModalInstance && this.jobModalInstance.hide();
    this.jobModalInstance = null;
  }

  private resize() {
    const tabs = this.$refs.tabs as any;
    tabs && tabs.resize && tabs.resize();
  }

  private createFolder() {
    if (!this.folderModalInstance) {
      this.folderModalInstance = this.$createModalInstance(
        MODAL_TYPE.createFolder
      );
    }
    this.folderModalInstance &&
      this.folderModalInstance.show(
        {
          type: "JOB",
          position: -1
        },
        async (args: any) => {
          try {
            await this.$request("createDirectory", {
              name: args.folderName,
              parentId: args.position,
              dirType: args.type
            });
            await this.getJobList();
            this.$ndcmessage.success("新建文件夹成功");
            return true;
          } catch (e) {
            this.folderModalInstance &&
              this.folderModalInstance.setError(e.message);
          }
        }
      );
  }

  private createJob(val: string) {
    if (this.isFolderEmpty) {
      return this.$ndcconfirm({
        content: "请先建一个文件夹",
        cancelButton: ""
      });
    }
    this.create({
      type: val
    });
  }

  private async copyJob() {
    try {
      const jobDetail: IJob = await this.$request("getJobDetail", {
        jobId: this.activeTab
      }); // 获取当前任务信息
      jobDetail.jobName = jobDetail.jobName + "_copy";
      this.create(jobDetail, true);
    } catch (e) {
      this.$handleException(e, "任务复制失败");
    }
  }

  private create(data: any, isCopy: boolean = false) {
    if (!this.jobModalInstance) {
      this.jobModalInstance = this.$createModalInstance(MODAL_TYPE.createJob);
    }
    this.jobModalInstance &&
      this.jobModalInstance.show(
        Object.assign({}, data, {
          isCopy,
          position: data.parentId,
          jobNames: this.jobNames
        }),
        async (args: any) => {
          try {
            this.jobModalInstance && this.jobModalInstance.showLoading();
            const params: any = {
              type: args.type || args.jobType,
              jobName: args.jobName,
              parentId: args.position,
              description: args.description,
              clusterId: args.clusterId,
              kernelId: args.kernelId,
              queueId: args.queueId,
              srcJobId: Number(this.activeTab)
            };
            if (
              args.clusterType &&
              args.clusterType.toLocaleUpperCase() === "K8S"
            ) {
              params.imageId = args.imageId;
            }
            const job: IJob = await this.$request(
              isCopy ? "copyJob" : "createJob",
              params
            );
            if (isCopy) {
              await this.copyJobInfo(job, data);
            }
            this.$ndcmessage.success(isCopy ? "复制任务成功" : "新建任务成功");
            await this.getJobList();
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
  }

  /**
   * 复制任务需要复制关联标签，资源文件
   */
  private async copyJobInfo(job: IJob, data: any) {
    const params = this.getJobParams(data);
    const promiseArr = [
      this.$request("updateJob", Object.assign({}, job, params))
    ];
    if (data.tagIds) {
      promiseArr.push(
        this.$request("linkTag", {
          objId: job.jobId,
          objType: "JOB",
          tagIds: data.tagIds
        })
      );
    }
    if (data.fileList) {
      promiseArr.push(
        this.$request("updateDependency", {
          jobId: job.jobId,
          fileList: data.fileList.map((file: ISimpleFile) => file.id),
          mammutKyb: data.mammutKyb
        })
      );
    }
    return Promise.all(promiseArr);
  }

  private getJobParams(data: IJob) {
    if (data.jobType === "SQL") {
      const { rawSql, runParameter = {}, extRunParameter } = data;
      return {
        rawSql,
        extRunParameter,
        runParameter
      };
    }
    const { mainArgs, mainClass, extRunParameter, runParameter = {} } = data;
    return {
      mainArgs,
      mainClass,
      extRunParameter,
      runParameter
    };
  }

  private openNewTab(tab: ITab) {
    if (!tab.name) {
      return;
    }
    const tabs = cloneDeep(this.tabs);
    const index = tabs.findIndex((t) => t.name === tab.name);
    const idx = tabs.findIndex((t) => t.name === this.activeTab);
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

  private saveJob() {
    this.executeCommand(EDITOR_CMD.save);
  }

  private debugJob() {
    this.executeCommand(EDITOR_CMD.debug);
  }

  private checkGrammar() {
    this.executeCommand(EDITOR_CMD.checkGrammar);
  }

  private releaseJob() {
    this.executeCommand(EDITOR_CMD.release);
  }

  private markJob() {
    this.executeCommand(EDITOR_CMD.mark);
  }

  private formatJob() {
    this.executeCommand(EDITOR_CMD.format);
  }

  private addResource() {
    this.executeCommand(EDITOR_CMD.resource);
  }

  public getDebugingJob() {
    return this.debugingJob;
  }

  private onDebugChange(val: string) {
    this.debugingJob = val;
  }

  private onIdeModified(val: boolean) {
    const tab = val ? this.activeTab : "";
    this.refTabs && this.refTabs.setModifiedTab(tab);
  }

  private onTabChange(tab: string) {
    this.setActiveTab(tab);
    this.$nextTick(() => {
      this.executeCommand(EDITOR_CMD.resize);
    });
  }

  private onTabClose(tab: string) {
    this.closeCurrentTab(tab);
  }

  private onBeforeLeave(tab: string) {
    if (this.canClose()) {
      this.executeCommand(EDITOR_CMD.autoSave);
    }
    return true;
  }

  private onBeforeClose(tab: string) {
    if (!this.canClose()) {
      return false;
    }
    // 离开前需要先判断是否需要保存
    if (this.hasModified()) {
      this.executeCommand(EDITOR_CMD.save);
      return true;
    }
    return true;
  }

  private canClose(tab: string = ""): boolean {
    tab = tab || this.activeTab;
    const panels = this.$refs["panel_" + tab] as MIdePanel[];
    if (panels && panels.length) {
      const idePanel = panels[0];
      return idePanel.canClose();
    }
    return true;
  }

  private hasModified(tab: string = ""): boolean {
    tab = tab || this.activeTab;
    const panels = this.$refs["panel_" + tab] as MIdePanel[];
    if (panels && panels.length) {
      const idePanel = panels[0];
      return idePanel.hasModified();
    }
    return false;
  }

  private onTabRightClick(e: any) {
    e.event.preventDefault();
    this.selectedTab = e.tab;
    if (!this.tabContextMenuInstance) {
      this.tabContextMenuInstance = this.$contextmenu(
        tabMenuItems,
        (item: IMenuItem, event: Event) => {
          this.closeTab(item.key);
        }
      );
    }
    this.tabContextMenuInstance && this.tabContextMenuInstance.open(e.event);
  }

  private closeTab(key: string) {
    if (!this.selectedTab) {
      return;
    }
    const tab = this.selectedTab;
    this.selectedTab = "";
    if (key === "current") {
      return this.closeCurrentTab(tab);
    }
    if (key === "others") {
      return this.closeOtherTabs(tab);
    }
    this.closeRightTabs(tab);
  }

  private closeCurrentTab(tab: string) {
    const index = this.tabs.findIndex((t) => t.name === tab);
    const tabs = this.tabs.concat();
    tabs.splice(index, 1);
    this.setTabs(tabs);
    if (this.activeTab === tab) {
      const activeTab: ITab | null =
        tabs.length === 0
          ? null
          : tabs.length > index
            ? tabs[index]
            : tabs[tabs.length - 1];
      this.setActiveTab((activeTab && activeTab.name) || "");
    }
  }

  private closeOtherTabs(tab: string) {
    const tabs = this.tabs.filter((t) => t.name !== tab);
    this.closeTabs(tabs);
    this.setTabs(this.tabs.filter((t) => t.name === tab));
    this.setActiveTab(tab);
  }

  private closeRightTabs(tab: string) {
    const index = this.tabs.findIndex((t) => t.name === tab);
    const tabs = this.tabs.slice(index);
    this.closeTabs(tabs);
    const activeIndex = this.tabs.findIndex((t) => t.name === this.activeTab);
    if (activeIndex > index) {
      this.setActiveTab(tab);
    }
    const newTabs = this.tabs.slice(0, index + 1);
    this.setTabs(newTabs);
  }

  private closeTabs(tabs: ITab[] = []) {
    // 判断任务是否已保存，未保存则需要手动调用保存
    for (let i = 0, len = tabs.length; i < len; i++) {
      const tab = tabs[i];
      const isModified = this.hasModified(tab.name);
      if (isModified) {
        const panels = this.$refs["panel_" + tab.name] as MIdePanel[];
        if (panels && panels.length) {
          const idePanel = panels[0];
          idePanel.executeCommand(EDITOR_CMD.save);
        }
      }
    }
  }

  private onCloseDetail() {
    this.detailVisible = false;
    this.$nextTick(() => {
      this.executeCommand(EDITOR_CMD.resize);
    });
  }
}
</script>

<style lang="scss" scoped>
.m-ide {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  &-job {
    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;
  }
  &-toolbar {
    height: 36px;
    box-sizing: border-box;
    padding: 0 16px;
    display: flex;
    align-items: center;
    overflow: hidden;
    font-size: 12px;
  }
  &-tabs {
    flex: 1;
    height: 0;
  }
  &-main {
    height: 100%;
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
    justify-content: center;
    .new-item {
      margin-top: 22.5%;
      cursor: pointer;
      display: flex;
      flex-direction: column;
      align-items: center;
      & + .new-item {
        margin-left: 80px;
      }
      .ndc-button {
        margin-top: 24px;
      }
    }
  }
}
</style>
-->

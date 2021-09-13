<template>
  <ndc-modal class="m-compare-modal" :visible="visible" title="任务版本" :width="800" :height="528" :max-height="700" @hide="hide">
    <template>
      <ndc-tabs :tabs="tabs" v-model="activeTab" @change="onChangeTab">
        <ndc-tab-panel name="code">
          <div class="m-compare-code" style="height: 100%"></div>
        </ndc-tab-panel>
        <ndc-tab-panel name="job">
          <div class="m-compare-job">
            <div class="left">
              <div class="job-left" style="height: 100%;overflow: auto;">
                <u-compare-item label="JAR任务包" :content="version && version.flinkJarName" :ellipsis="false"></u-compare-item>
                <u-compare-item label="MD5" :content="version && version.flinkJarMd5" :ellipsis="false"></u-compare-item>
                <u-compare-item label="main.class" :content="version && version.mainClass" :ellipsis="false"></u-compare-item>
                <u-compare-item label="main.args" :content="version && version.mainArgs" :ellipsis="false"></u-compare-item>
              </div>
            </div>
            <div class="right">
              <div class="job-right" style="height: 100%;overflow: auto;">
                <u-compare-item label="JAR任务包" :content="compareParams.flinkJarName" :ellipsis="false"></u-compare-item>
                <u-compare-item label="MD5" :content="compareParams.flinkJarMd5" :ellipsis="false"></u-compare-item>
                <u-compare-item label="main.class" :content="compareParams.mainClass" :ellipsis="false"></u-compare-item>
                <u-compare-item label="main.args" :content="compareParams.mainArgs" :ellipsis="false"></u-compare-item>
              </div>
            </div>
          </div>
        </ndc-tab-panel>
        <ndc-tab-panel name="params">
          <div class="m-compare-params">
            <div class="left">
              <u-compare-item label="集群" :content="version && version.clusterName"></u-compare-item>
              <u-compare-item label="内核版本" :content="version ? (version.clusterType && version.clusterType.toLocaleUpperCase() === 'K8S' ? version.imageName : version.kernelName) : ''"></u-compare-item>
              <u-compare-item label="队列" :content="version && version.queueName"></u-compare-item>
              <div v-if="type === 'SQL'">
                <u-compare-item label="checkpointInterval" :content="version && version.runParameter['checkpointInterval']"></u-compare-item>
                <u-compare-item label="env.parallelism" :content="version && version.runParameter['env.parallelism']"></u-compare-item>
                <u-compare-item label="trigger.interval" :content="version && version.runParameter['trigger.interval']"></u-compare-item>
                <u-compare-item label="state_ttl" :content="version && version.runParameter['state_ttl']"></u-compare-item>
                <u-compare-item label="zone_offset.of_hour" :content="version && version.runParameter['zone_offset.of_hour']" v-if="version && version.kernelName === 'SLOTH_FLINK_SQL_1100'"></u-compare-item>
              </div>
              <div v-else>
                <u-compare-item label="parallelism" :content="version && version.runParameter['parallelism']"></u-compare-item>
                <u-compare-item label="jm.memory" :content="version && version.runParameter['jm.memory']"></u-compare-item>
                <u-compare-item label="tm.cpu" :content="version && version.runParameter['tm.cpu']" v-if="version && version.clusterType && version.clusterType.toLocaleUpperCase() === 'K8S'"></u-compare-item>
                <u-compare-item label="tm.number" v-if="isTmNumberExist(version)" :content="version && version.runParameter['tm.number']"></u-compare-item>
                <u-compare-item label="slot" :content="version && version.runParameter['slot']"></u-compare-item>
              </div>
            </div>
            <div class="right">
              <u-compare-item label="集群" :content="compareParams.runParameter['clusterName']"></u-compare-item>
              <u-compare-item label="内核版本" :content="compareParams.runParameter['clusterType'] && compareParams.runParameter['clusterType'].toLocaleUpperCase() === 'K8S' ? compareParams.runParameter['imageName'] : compareParams.runParameter['kernelName']"></u-compare-item>
              <u-compare-item label="队列" :content="compareParams.runParameter['queueName']"></u-compare-item>
              <div v-if="type === 'SQL'">
                <u-compare-item label="checkpointInterval" :content="compareParams.runParameter['checkpointInterval']"></u-compare-item>
                <u-compare-item label="env.parallelism" :content="compareParams.runParameter['env.parallelism']"></u-compare-item>
                <u-compare-item label="trigger.interval" :content="compareParams.runParameter['trigger.interval']"></u-compare-item>
                <u-compare-item label="state_ttl" :content="compareParams.runParameter['state_ttl']"></u-compare-item>
                <u-compare-item label="zone_offset.of_hour" :content="compareParams.runParameter['zone_offset.of_hour']" v-if="compareParams.runParameter['kernelName'] && compareParams.runParameter['kernelName'] === 'SLOTH_FLINK_SQL_1100'"></u-compare-item>
              </div>
              <div v-else>
                <u-compare-item label="parallelism" :content="compareParams.runParameter['parallelism']"></u-compare-item>
                <u-compare-item label="jm.memory" :content="compareParams.runParameter['jm.memory']"></u-compare-item>
                <u-compare-item label="tm.cpu" :content="compareParams.runParameter['tm.cpu']" v-if="compareParams.runParameter['clusterType'] && compareParams.runParameter['clusterType'].toLocaleUpperCase() === 'K8S'"></u-compare-item>
                <u-compare-item label="tm.number" v-if="isTmNumberExist(compareParams.runParameter)" :content="compareParams.runParameter['tm.number']"></u-compare-item>
                <u-compare-item label="slot" :content="compareParams.runParameter['slot']"></u-compare-item>
              </div>
            </div>
          </div>
        </ndc-tab-panel>
        <ndc-tab-panel name="config">
          <div class="m-compare-config" style="height: 100%"></div>
        </ndc-tab-panel>
        <ndc-tab-panel name="file">
         <div class="m-compare-file">
           <div class="left">
             <div class="file g-text-nowrap" v-for="(item, index) in version && version.fileList" :key="index" :title="item.name">{{item.name}}</div>
           </div>
           <div class="right">
             <div class="file g-text-nowrap" v-for="(item, index) in compareParams.fileList" :key="index" :title="item.name">{{item.name}}</div>
           </div>
         </div>
        </ndc-tab-panel>
        <ndc-tab-panel name="resource">
          <div class="m-compare-params">
            <div class="left">
              <div v-if="version && version.resourceDesc">
                <u-compare-item label="配置方式" content="智能配置"></u-compare-item>
                <u-compare-item v-for="(item, index) in Object.keys(version.resourceDesc.resOverview || {})" :key="index" :label="item" :content="version.resourceDesc.resOverview && version.resourceDesc.resOverview[item]"></u-compare-item>
              </div>
              <div v-else>
                <u-compare-item label="配置方式" content="手动配置"></u-compare-item>
                <u-compare-item label="tm.memory" :content="version && version.runParameter['tm.memory']"></u-compare-item>
              </div>
            </div>
            <div class="right">
              <div v-if="compareParams && compareParams.resourceDesc">
                <u-compare-item label="配置方式" content="智能配置"></u-compare-item>
                <u-compare-item v-for="(item, index) in Object.keys(compareParams.resourceDesc.resOverview || {})" :key="index" :label="item" :content="compareParams.resourceDesc.resOverview && compareParams.resourceDesc.resOverview[item]"></u-compare-item>
              </div>
              <div v-else>
                <u-compare-item label="配置方式" content="手动配置"></u-compare-item>
                <u-compare-item label="tm.memory" :content="compareParams && compareParams.runParameter['tm.memory']"></u-compare-item>
              </div>
            </div>
          </div>
        </ndc-tab-panel>
      </ndc-tabs>
      <div class="m-compare-version g-flex-ac">
        <div style="width: 50%;font-size: 12px;">- - 版本{{version && version.version}}</div>
        <div style="width: 50%;font-size: 12px;">- - 当前版本</div>
      </div>
    </template>
    <template v-slot:footer>
      <div class="g-flex-ac" style="flex-direction: row-reverse;">
        <ndc-button theme="primary" @click="rollbackVersion" :style="{padding:'0 5px'}">回滚到版本{{version && version.version || ''}}</ndc-button>
        <ndc-button class="g-mr-16" theme="primary" @click="removeVersion" :style="{padding:'0 5px'}">删除版本{{version && version.version || ''}}</ndc-button>
        <ndc-button class="g-mr-16" @click="hide">取消</ndc-button>
      </div>
    </template>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';
import UCompareItem from './compare-item.vue';

import { ITab, IVersion } from '@utils/types';
import { DIFF_EDITOR_OPTIPONS } from '../../constant';
import { isTmNumberExist } from '../../utils';

const SQL_TABS = [{
  name: 'code',
  label: '代码对比'
}, {
  name: 'params',
  label: '参数对比'
}, {
  name: 'config',
  label: '配置对比'
}, {
  name: 'file',
  label: '关联文件'
}, {
  name: 'resource',
  label: '资源配置'
}];

const JAR_TABS = [{
  name: 'job',
  label: '任务对比'
}, {
  name: 'params',
  label: '参数对比'
}, {
  name: 'config',
  label: '配置对比'
}, {
  name: 'file',
  label: '关联文件'
}, {
  name: 'resource',
  label: '资源配置'
}];

interface ICompareModalProps {
  type: string;
  compareParams: any;
  version: IVersion;
  rollback: any;
  remove: any;
  onHide: any;
}

@Component({
  components: {
    UCompareItem
  }
})
export default class MCompareModal extends Vue {
  private tabs: ITab[] = [];
  private activeTab: string = '';
  private visible: boolean = false;
  private compareParams: any = {
    runParameter: {}
  };
  private type: string = 'SQL';
  private version: IVersion | null = null;
  private codeDiffEditor?: monaco.editor.IStandaloneDiffEditor;
  private paramsDiffEditor?: monaco.editor.IStandaloneDiffEditor;
  private initParamsEditor: boolean = false;
  private rollback?: any;
  private remove?: any;
  private onHide?: any;

  public show({ type, compareParams, version, rollback, remove, onHide }: ICompareModalProps) {
    this.initParamsEditor = false;
    this.type = type;
    this.tabs = type === 'SQL' ? SQL_TABS : JAR_TABS;
    this.activeTab = type === 'SQL' ? 'code' : 'job';
    this.compareParams = compareParams || {};
    this.version = version;
    this.rollback = rollback;
    this.remove = remove;
    this.onHide = onHide;
    this.visible = true;
    this.$nextTick(() => {
      if (type === 'SQL') {
        if (!this.codeDiffEditor) {
          const codeElm = this.$el.getElementsByClassName('m-compare-code')[0] as HTMLElement;
          this.codeDiffEditor = monaco.editor.createDiffEditor(codeElm, DIFF_EDITOR_OPTIPONS);
        }
        const originalModel = monaco.editor.createModel(version.rawSql || '', 'sql');
        const modifiedModel = monaco.editor.createModel(compareParams.rawSql || '', 'sql');
        this.codeDiffEditor && this.codeDiffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
      }
    });

    window.addEventListener('scroll', this.handleScroll, true);
  }

  public hide() {
    if (this.onHide && typeof this.onHide === 'function') {
      this.onHide();
    }

    window.removeEventListener('scroll', this.handleScroll, true);

    this.$el && this.$el.parentNode && this.$el.parentNode.removeChild(this.$el);
    this.$destroy();
  }

  private beforeDestroy() {
    this.codeDiffEditor && this.codeDiffEditor.dispose();
    this.paramsDiffEditor && this.paramsDiffEditor.dispose();
  }

  private isTmNumberExist(args: any) {
    return isTmNumberExist(args);
  }

  private rollbackVersion(e: MouseEvent) {
    const buttonDom = e.target as any;
    const { x, y } = buttonDom.getBoundingClientRect();
    this.rollback && this.rollback(this.version, {
      left: x - 225,
      top: y - 186
    });
  }

  private removeVersion(e: MouseEvent) {
    const buttonDom = e.target as any;
    const { x, y } = buttonDom.getBoundingClientRect();
    this.remove && this.remove(this.version, {
      left: x - 225,
      top: y - 206
    });
  }

  private handleScroll(e: Event) {
    const target = e.target as Element;
    const left: number = target.scrollLeft;
    const dom = this.$el.getElementsByClassName(target.className === 'job-left' ? 'job-right' : 'job-left')[0];
    dom && (dom.scrollLeft = left);
  }

  private onChangeTab(val: string) {
    if (val === 'config' && !this.initParamsEditor) {
      this.$nextTick(() => {
        if (!this.paramsDiffEditor) {
          const paramsElm = this.$el.getElementsByClassName('m-compare-config')[0] as HTMLElement;
          this.paramsDiffEditor = monaco.editor.createDiffEditor(paramsElm, DIFF_EDITOR_OPTIPONS);
        }
        const originalModel = monaco.editor.createModel((this.version && this.version.extRunParameter) || '', 'shell');
        const modifiedModel = monaco.editor.createModel(this.compareParams.extRunParameter || '', 'shell');
        this.paramsDiffEditor && this.paramsDiffEditor.setModel({
          original: originalModel,
          modified: modifiedModel
        });
        this.initParamsEditor = true;
      });
    }
  }
}
</script>

<style lang="scss">
.m-compare {
  &-modal {
    .ndc-modal-header {
      height: 40px;
      background: #eeeeee;
      border-radius: 4px 4px 0px 0px;
      padding: unset;
      .content {
        span {
          margin-left: 20px;
          font-size: 16px;
          line-height: 16px;
          font-family: MicrosoftYaHei;
          color: #152038;
        }
        .ndc-icon-close {
          &::before {
            font-size: 8px;
            margin-right: 17px;
          }
        }
      }
    }
    .ndc-modal-content {
      padding: 16px 24px 8px 24px;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .ndc-modal-footer {
      padding: 24px;
    }
    .ndc-tabs {
      flex: 1;
      height: 0;
    }
    .ndc-tab {
      height: 100%;
      border: $border;
    }
    .ndc-tabs-content {
      margin-top: 8px;
    }
  }
  &-version {
    height: 24px;
    line-height: 24px;
    flex-shrink: 0;
  }
  &-job,
  &-params,
  &-file {
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    display: flex;
    .left,
    .right {
      width: 50%;
      line-height: 32px;
      padding: 8px 16px;
      box-sizing: border-box;
    }
    .left {
      border-right: $border;
      flex-shrink: 0;
    }
    .right {
      flex: 1;
    }
  }
}
</style>

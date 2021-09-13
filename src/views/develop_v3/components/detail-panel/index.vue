<template>
  <div class="m-detail-panel">
    <div class="panel-close">
      <u-text-button v-if="activeTab === 'metadata'" @click="quote(info.rawSql)">
        <img class="icon" src="../../../../assets/images/icon_online.svg" />
        <span>引用</span>
      </u-text-button>
      <div class="g-split-line" v-if="activeTab === 'metadata'"></div>
      <i class="ndc-icon-close" @click="onClick" />
    </div>
    <ndc-tabs
      is-card
      :tabs="tabs"
      :disabled-tabs="disabledTabs"
      :value="activeTab"
    >
      <ndc-tab-panel name="metadata">
        <m-sql-editor
          ref="editor"
          :value="info.rawSql"
          :options="{
            readOnly: true
          }"
        ></m-sql-editor>
      </ndc-tab-panel>
      <ndc-tab-panel name="tag">
        <u-info>
          <u-info-item label="名称">
            <span :title="info.name">{{info.name}}</span>
          </u-info-item>
          <u-info-item label="创建人">{{info.creator}}</u-info-item>
          <u-info-item label="创建时间">{{info.createTime}}</u-info-item>
        </u-info>
      </ndc-tab-panel>
      <ndc-tab-panel name="file">
        <u-info>
          <u-info-item label="ID">{{info.id}}</u-info-item>
          <u-info-item label="名称">{{info.name}}</u-info-item>
          <u-info-item label="上传人">{{info.creator}}</u-info-item>
          <u-info-item label="上传时间">{{info.createTime}}</u-info-item>
          <u-info-item label="标签">{{info.tags}}</u-info-item>
          <u-info-item label="备注" :title="info.description">{{info.description}}</u-info-item>
          <u-info-item label="MD5" size="large" :title="info.fileMd5">{{info.fileMd5}}</u-info-item>
        </u-info>
      </ndc-tab-panel>
    </ndc-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator';
import { ITab } from '@utils/types';

import MSqlEditor from '../sql-editor/index.vue';
import MIde from '../../ide_sql.vue';
import { EDITOR_CMD } from '../../constant';

@Component({
  components: {
    MSqlEditor
  }
})
export default class MDetailPanel extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private info!: any;

  @Prop({
    default: ''
  })
  private activeTab!: string;

  @Inject('ide')
  private ide!: MIde;

  private tabs: ITab[] = [{
    name: 'metadata',
    label: '元数据详情'
  }, {
    name: 'tag',
    label: '标签详情'
  }, {
    name: 'file',
    label: '文件详情'
  }];

  private get disabledTabs() {
    return ['metadata', 'tag', 'file'].filter(t => t !== this.activeTab);
  }

  public resize() {
    const editor = this.$refs.editor as MSqlEditor;
    editor && editor.resize();
  }

  private onClick() {
    this.$emit('close');
  }

  private quote(sql: string) {
    this.ide && this.ide.executeCommand(EDITOR_CMD.quote, sql);
  }
}
</script>

<style lang="scss">
.m-detail-panel {
  background: #e9ebf0;
  height: 100%;
  position: relative;
  box-sizing: border-box;
  padding-top: 16px;
  .ndc-tabs-header {
    .tab {
      color: #333;
      justify-content: center;
    }
  }
  .ndc-tabs-content {
    height: calc(100% - 28px);
    background: #fff;
  }
  .panel-close {
    position: absolute;
    z-index: 1;
    top: 6px;
    right: 24px;
    height: 32px;
    line-height: 32px;
    display: flex;
    align-items: center;
    .g-split-line {
      background: #b1b6c0;
    }
    .ndc-icon-close {
      font-size: 12px;
      font-weight: 600;
      color: #333;
      cursor: pointer;
    }
  }
}
</style>

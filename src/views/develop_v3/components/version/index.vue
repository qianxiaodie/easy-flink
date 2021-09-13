<template>
  <div class="m-version">
    <div class="m-version-header g-flex-ac">
      <div class="m-version-id">ID</div>
      <div class="m-version-creator">提交人</div>
      <div class="m-version-time">提交时间</div>
      <div class="m-version-option">操作</div>
    </div>
    <div class="m-version-body" v-if="versionList.length">
      <ndc-virtual-list ref="list" :data="versionList">
        <template v-slot:item="scope">
          <div class="g-flex-ac m-version-row">
            <div class="m-version-id">{{ scope.item.version }}</div>
            <div class="m-version-creator" :title="scope.item.editor">{{ scope.item.editor }}</div>
            <div class="m-version-time">{{ scope.item.deployTime }}</div>
            <div class="m-version-option">
              <span class="g-text-link" @click="compare(scope.item)" :class="opCodesFlag ? '' :'changeCursor'">对比</span>
              <span class="g-text-link g-ml-8" @click="rollback(scope.item)" :class="opCodesFlag ? '' :'changeCursor'">回滚</span>
              <span class="g-text-link g-ml-8" @click="remove(scope.item)" :class="opCodesFlag ? '' :'changeCursor'">删除</span>
            </div>
          </div>
        </template>
      </ndc-virtual-list>
    </div>
    <div class="m-version-empty" v-else>
      <img src="@/assets/images/null.svg" alt="" />
      暂无数据
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Inject } from 'vue-property-decorator';
import MIdePanel from '../ide-panel/index.vue';
import MCompareModal from '../compare-modal/compare.vue';

import createCompareModal from '../compare-modal';
import { IVersion } from '@utils/types';
import { EDITOR_CMD } from '../../constant';

@Component
export default class MVersion extends Vue {
  @Prop({
    default: ''
  })
  jobId!: string

  @Prop({
    default: 'SQL'
  })
  type!: string

  // sidebar 传值权限
  @Prop({
    default: false
  })
  private opCodesFlag!: boolean;
  @Inject()
  private idePanel!: MIdePanel

  private versionList: IVersion[] = []
  private compareModalInstance: MCompareModal | null = null

  public async refresh() {
    if (this.jobId) {
      try {
        const list = await this.$request('getJobVersion', { jobId: this.jobId });
        this.versionList = list.sort((a: IVersion, b: IVersion) => b.version - a.version);
        this.$nextTick(() => {
          const list = this.$refs.list as any;
          list && list.resize();
        });
      } catch (e) {
        this.$handleException(e);
      }
    }
  }

  private compare(version: IVersion) {
    if (!this.opCodesFlag) {

    } else {
      if (!this.compareModalInstance) {
        this.compareModalInstance = createCompareModal();
      }
      const compareParams = this.idePanel.genCompareParams(true);
      this.compareModalInstance &&
      this.compareModalInstance.show({
        type: this.type,
        compareParams,
        version,
        rollback: this.rollback,
        remove: this.remove,
        onHide: this.hide
      });
    }
  }

  private hide() {
    this.compareModalInstance = null;
  }

  private rollback(version: IVersion, options: any = {}) {
    if (!this.opCodesFlag) {

    } else {
      const self = this;
      this.$ndcconfirm({
        ...options,
        content: '回滚到这个版本吗？',
        onConfirm() {
          self.idePanel.executeCommand(EDITOR_CMD.rollback, version);
          self.compareModalInstance && self.compareModalInstance.hide();
        }
      });
    }
  }

  private async remove(version: IVersion, options: any = {}) {
    if (!this.opCodesFlag) {

    } else {
      const self = this;
      this.$ndcconfirm({
        ...options,
        content: '删除这个版本吗？',
        desc: '版本删除后将无法恢复，确认删除吗？',
        async onConfirm() {
          try {
            await self.$request('deleteJobVersion', {
              jobId: self.jobId,
              versionId: version.version
            });
            self.refresh();
            self.compareModalInstance && self.compareModalInstance.hide();
          } catch (e) {
            self.$handleException(e, '删除版本失败');
          }
        }
      });
    }
  }
}
</script>

<style lang="scss">
@mixin td {
  flex-shrink: 0;
  padding: 0 8px 0 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 12px;
  color: #666;
  box-sizing: border-box;
}

.m-version {
  display: flex;
  flex-direction: column;
  &-header {
    line-height: 32px;
    height: 32px;
    background: #eeeeee;
    flex-shrink: 1;
    font-size: 12px;
    color: #666;
  }
  &-body {
    flex: 1;
  }
  &-empty {
    line-height: 40px;
    text-align: center;
    color: #999;
    img {
      display: flex;
      margin: 70px auto 0;
    }
  }
  .ndc-virtual-list-item {
    padding: 0;
    height: 40px;
    line-height: 40px;
    border-bottom: 1px solid #e2e7f0;
    box-sizing: border-box;
    background: #fff;
  }
  &-id {
    @include td();
    width: 60px;
  }
  &-creator {
    @include td();
    width: 110px;
  }
  &-time {
    @include td();
    width: 144px;
  }
  &-option {
    @include td();
    flex: 1;
    .g-text-link {
      color: #3b68b7;
    }
    .changeCursor{
      color: #999999;
      &:hover{
        cursor: not-allowed;
      }
    }
  }
}
</style>

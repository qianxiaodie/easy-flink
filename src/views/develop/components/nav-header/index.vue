<template>
  <div class="m-nav-header">
    <div class="header-icons" v-if="iconVisible">
      <slot name="left"></slot>
      <!-- <ndc-tooltip v-if="tagVisible" position="top" content="标签筛选">
        <i class="ndc-icon-tag header-label" :class="{'active': tagsVisible}" @click="toggleLabel" />
      </ndc-tooltip>-->
      <slot name="right"></slot>
    </div>

    <div class="tag-panel" v-show="tagsVisible">
      <div class="arrow" :style="panelArrowStyle"></div>
      <div
        class="tag"
        :class="{'active': selectedTags.findIndex(s => s.id === item.id) !== -1}"
        v-for="item in tagList"
        :key="item.id"
        @click="toggleTag(item)"
      >{{item.name}}</div>
    </div>

    <div class="tag-label" v-if="!tagsVisible && selectedTags.length">
      <div class="desc">已选标签</div>
      <div class="tag" v-for="(item, index) in selectedTags" :key="index">
        {{item.name}}
        <div class="close" @click="closeTag(index)">
          <i class="ndc-icon-close" />
        </div>
      </div>
    </div>

    <div class="split-line" v-if="iconVisible"></div>

    <div class="search-bar">
      <u-searchbox :placeholder="placeholder" @confirm="onSearchConfirm" @clear="onSearchClear"></u-searchbox>
      <!-- <i class="ndc-icon-refresh" @click="onClickRefresh" /> -->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { State } from 'vuex-class';
import { ITag } from '@utils/types';
import { MODULE_NAMESPACE } from '@utils/constant';

@Component
export default class MNavHeader extends Vue {
  @Prop({
    default: '请输入关键字'
  })
  private placeholder!: string

  @Prop({
    default: true
  })
  private tagVisible!: boolean

  @Prop({
    default: true
  })
  private iconVisible!: boolean

  @State('tagList', MODULE_NAMESPACE.develop)
  private tagList!: ITag[]

  private tagsVisible: boolean = false
  private selectedTags: ITag[] = []
  private right: number = 0

  private get panelArrowStyle() {
    return {
      right: this.right + 'px'
    };
  }

  private mounted() {
    const elm = this.$el.getElementsByClassName('header-label');
    if (elm && elm.length) {
      const elRect = this.$el.getBoundingClientRect() as DOMRect;
      const labelElm = elm[0];
      const labelRect = labelElm.getBoundingClientRect() as DOMRect;
      const right = elRect.width + elRect.x - labelRect.x - 36;
      this.right = right < 0 ? 0 : right;
    }
  }

  private toggleLabel() {
    if (!this.tagList || !this.tagList.length) {
      return this.$ndcconfirm({
        content: '标签未创建，请先去创建标签',
        cancelButton: ''
      });
    }
    this.tagsVisible = !this.tagsVisible;
  }

  private toggleTag(tag: ITag) {
    const index = this.selectedTags.findIndex((s) => s.id === tag.id);
    if (index !== -1) {
      this.selectedTags.splice(index, 1);
    } else {
      this.selectedTags.push(tag);
    }
    this.emitTagsChange();
  }

  private closeTag(index: number) {
    this.selectedTags.splice(index, 1);
    this.emitTagsChange();
  }

  private emitTagsChange() {
    this.$emit('tags-change', this.selectedTags);
  }

  private onSearchConfirm(e: any) {
    this.$emit('keywords-change', e.value);
  }

  private onSearchClear() {
    this.$emit('keywords-change', '');
  }

  private onClickRefresh() {
    this.$emit('refresh');
  }
}
</script>

<style lang="scss" scoped>
.m-nav-header {
  padding: 12px 16px 10px 16px;
  box-sizing: border-box;
  .header-icons {
    display: flex;
    justify-content: flex-end;
    [class^='ndc-icon-'] {
      display: block;
      font-size: 14px;
      width: 14px;
      height: 14px;
      color: #717b94;
      &.active:before {
        color: #3B68B7;
      }
      &:hover {
        color: #3b68b7;
      }
    }
    .icon-line {
      height: 12px;
      width: 1px;
      background-color: #d2d7e0;
      margin: 4px 8px;
      &:nth-child(4) {
        display: none;
      }
    }
  }
  .split-line {
    /*height: 1px;*/
    height: 0;
    background-color: #d2d7e0;
    margin: 12px 0 8px 0;
  }
  .search-bar {
    width: 100%;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    .u-searchbox-input {
      height: 24px;
      line-height: 24px;
      font-size: 12px;
      padding: 0 24px;
    }
    .u-searchbox-search,
    .u-searchbox-error {
      font-size: 12px;
    }
    .ndc-icon-refresh {
      margin-left: 8px;
      font-size: 16px;
      flex-shrink: 0;
      color: #7a85a0;
      cursor: pointer;
      &:hover {
        color: #3B68B7;
      }
    }
    .u-searchbox {
      width: 100%;
    }
  }
  .tag-panel {
    position: relative;
    margin-top: 16px;
    background: #f5f7fa;
    border-radius: 2px;
    padding: 4px;
    display: flex;
    flex-wrap: wrap;
    .arrow {
      position: absolute;
      top: -22px;
      width: 0;
      height: 0;
      border: 12px solid transparent;
      border-bottom-color: #f5f7fa;
    }
  }
  .tag {
    padding: 0 8px;
    margin: 4px;
    background: #e1e6ee;
    border-radius: 2px;
    font-size: 12px;
    line-height: 20px;
    color: #666;
    cursor: pointer;
    user-select: none;
    word-break: break-all;
    &.active {
      background: #3B68B7;
      color: #fff;
    }
  }
  .tag-label {
    margin-top: 6px;
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    .desc {
      font-size: 12px;
      color: #666;
      line-height: 20px;
      margin-right: 6px;
    }
    .tag {
      font-size: 12px;
      padding: 0 8px;
      margin: 2px;
      line-height: 20px;
      display: flex;
      align-items: center;
      .close {
        margin-left: 4px;
        width: 16px;
        height: 16px;
        border-radius: 8px;
        &:hover {
          background: #eee;
        }
        .ndc-icon-close {
          display: block;
          font-size: 16px;
          transform: scale(0.5);
          color: #868f9e;
        }
      }
    }
  }
}
</style>

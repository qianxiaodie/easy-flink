<template>
  <div class="u-select" :class="{'disabled': disabled}">
    <input class="u-select-input" ref="input" @click.stop v-if="searchable && searchInputVisible" v-model="keyword" :placeholder="currentLabel" />
    <div class="u-select-searchbox" v-if="searchable && !searchInputVisible"
      :class="{
        'disabled': disabled,
        'placeholder': !selected
      }"
      @click="togglePanel"
    >{{currentLabel}}</div>
    <div class="u-select-label g-text-nowrap" :title="currentLabel" v-else :class="{'disabled': disabled, 'placeholder': !selected}" @click="togglePanel">
      <slot name="label" :option="selected">
        {{currentLabel}}
      </slot>
    </div>

    <div class="ndc-select-down">
      <i class="ndc-icon-pull-down" :class="{'expand': panelVisible}" @click="togglePanel"></i>
    </div>
    <i class="u-select-clear ndc-icon-error" v-if="clearable && selected" @click="clear"></i>

    <transition name="expand">
      <div class="u-select-panel" :style="panelStyle" v-show="panelVisible">
        <div v-if="internalOptions.length">
          <div class="u-select-option g-text-nowrap"
            v-for="(item, index) in internalOptions" :key="index"
            :class="{
              'selected': isSelected(item),
              'disabled': item.disabled
            }"
            @click="onClick(item)"
          >
            <slot name="option" :option="item">
              <span>{{item[labelKey] || item[trackKey]}}</span>
            </slot>
          </div>
        </div>
        <div class="u-select-empty" v-else>
          <span>{{ keyword ? noMatchText : noDataText}}</span>
        </div>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Model, Prop, Watch } from 'vue-property-decorator';
import { isEqual } from 'lodash';

import { ITreeOption } from '@utils/types';

const filterFunc = (node: ITreeOption): boolean => {
  if (!node.parent) {
    return true;
  }
  if (!node.parent.expanded) {
    return false;
  }
  return filterFunc(node.parent);
};

@Component
export default class USelect extends Vue {
  @Model('change', {
    type: [String, Number]
  })
  private value!: string | number;

  @Prop({
    default() {
      return [];
    }
  })
  private options!: ITreeOption[];

  @Prop({
    default: 'key'
  })
  private trackKey!: string;

  @Prop({
    default: 'label'
  })
  private labelKey!: string;

  @Prop({
    default: '请选择'
  })
  private placeholder!: string;

  @Prop({
    default: false
  })
  private disabled!: boolean;

  @Prop({
    default: false
  })
  private clearable!: boolean;

  @Prop({
    default: false
  })
  private searchable!: boolean;

  @Prop({
    default: false
  })
  private addResourceFlag!: boolean;

  @Prop({
    default: false
  })
  private isTree!: boolean;

  @Prop({
    default: '无数据'
  })
  private noDataText!: string;

  @Prop({
    default: '无结果'
  })
  private noMatchText!: string;

  @Prop({
    default() {
      return [];
    }
  })
  private expandedKeys!: [];

  private selected: ITreeOption | null = null;
  private panelVisible: boolean = false;
  private keyword: string = '';
  private searchInputVisible: boolean = false;
  private panelStyle: any = {};

  @Watch('value')
  private onValueChanged(val: string | number) {
    this.setSelect(val);
  }

  @Watch('options')
  private onOptionsChanged() {
    if (this.value && this.selected && this.selected.exist !== false) {
      const val = this.options.find(o => o[this.trackKey] === this.value);
      if ((!val && this.selected) || (val && isEqual(val, this.selected))) {
        return;
      }
      return this.setSelect(this.value);
    }
    if (this.value && (!this.selected || this.selected.exist === false)) {
      this.setSelect(this.value);
    }
  }

  @Watch('panelVisible')
  private onPanelVisibleChanged(val: boolean) {
    if (this.searchable) {
      this.keyword = '';
      this.searchInputVisible = val;
      if (val) {
        this.$nextTick(() => {
          const input = this.$refs.input as any;
          input && input.focus();
        });
      }
    }
  }

  private get internalOptions(): ITreeOption[] {
    const options = this.isTree ? this.options.filter(filterFunc) : this.options;
    return this.searchable ? options.filter(o => (o[this.trackKey] && o[this.trackKey].includes(this.keyword)) || (o[this.labelKey] && o[this.labelKey].includes(this.keyword))) : options;
  }

  private get currentLabel(): string {
    const selected = this.selected;
    return selected ? selected[this.labelKey] || selected[this.trackKey] : this.placeholder;
  }

  private mounted() {
    window.addEventListener('resize', this.onResize);
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.onResize);
  }

  private togglePanel() {
    if (this.disabled) {
      return;
    }
    if (this.panelVisible) {
      this.hidePanel();
    } else {
      this.panelVisible = true;
      this.genPanelStyle();
      setTimeout(() => {
        window.addEventListener('scroll', this.hidePanelByScroll, true);
        document.body.addEventListener('click', this.hidePanel, { once: true });
      }, 0);
      this.$emit('before-show');
    }
  }

  private hidePanelByScroll(e: any) {
    if (e.target.className !== 'u-select-panel') {
      this.hidePanel();
    }
  }

  private hidePanel() {
    this.panelVisible = false;
    window.removeEventListener('scroll', this.hidePanelByScroll);
    document.body.removeEventListener('click', this.hidePanel);
  }

  private genPanelStyle() {
    if (this.$el) {
      this.panelStyle = {};
      const { left, top, width, height, bottom } = this.$el.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      this.panelStyle.left = left + 'px';
      this.panelStyle.width = width + 'px';
      if (top + height + 250 > bodyRect.bottom) {
        this.panelStyle.bottom = '0px';
        this.panelStyle.marginBottom = (bodyRect.bottom - bottom + height) + 'px';
        this.panelStyle.borderTop = '1px solid #d2d7e0';
        this.panelStyle.boderBottom = 'none';
      } else {
        this.panelStyle.top = (top + height) + 'px';
      }
    }
  }
  private isSelectedFlag:boolean = false
  private isSelected(item: ITreeOption) {
    this.isSelectedFlag = this.selected !== null;
    this.$emit('isSelectedFlag', this.isSelectedFlag);
    return this.selected && this.selected[this.trackKey] === item[this.trackKey];
  }

  private onClick(item: ITreeOption) {
    this.selected = item;
    this.emitChange();
    this.panelVisible = false;
  }

  private onResize() {
    if (this.panelVisible) {
      this.genPanelStyle();
    }
  }
  private setSelect(val: string | number) {
    // debugger
    const arr = this.options.filter(a => a[this.trackKey] === val);
    // 可能出现的文件夹id和文件id相同 （临时解决方案）
    if ( this.addResourceFlag ) {
      arr.forEach(i => {
        if (!i.isFolder) {
          this.selected = i;
        }
      });
    } else {
      this.selected = arr.length ? arr[0] : null;
    }
    // this.selected = arr.length ? arr[0] : null;
    if (val && !this.selected) {
      const re = {} as any;
      re[this.labelKey] = val;
      re.exist = false;
      this.selected = re;
    }
  }

  private clear() {
    this.selected = null;
    this.emitChange();
  }

  private emitChange() {
    const val = (this.selected && this.selected[this.trackKey]) || '';
    this.$emit('update:value', val);
    this.$emit('change', val);
  }
}
</script>

<style lang="scss">
.u-select {
  position: relative;
  height: 32px;
  width: 100%;
  border: 1px solid #d2d7e0;
  border-radius: 4px;
  box-sizing: border-box;
  &:hover,
  &:focus {
    border-color: #3B68B7 !important;
  }
  &.disabled {
    &:hover,
    &:focus {
      border-color: #d3ddee;
    }
  }
  &-label {
    line-height: 30px;
    height: 100%;
    width: 100%;
    padding: 0 40px 0 16px;
    box-sizing: border-box;
    color: #333;
    cursor: pointer;
    user-select: none;
    &.disabled {
      cursor: not-allowed;
      color: #687381;
    }
    &.placeholder {
      color: #687381;
    }
  }
  &-input {
    line-height: 30px;
    height: 100%;
    width: 100%;
    padding: 0 40px 0 16px;
    box-sizing: border-box;
    color: #333;
    border: none;
    border-radius: 4px;
  }
  &-searchbox {
    line-height: 30px;
    height: 100%;
    width: 100%;
    padding: 0 40px 0 16px;
    box-sizing: border-box;
    color: #333;
    cursor: pointer;
    &.disabled {
      cursor: not-allowed;
    }
    &.placeholder {
      color: #687381;
    }
  }
  &-down {
    position: absolute;
    right: 8px;
    top: 50%;
    transform: translateY(-50%);
    .ndc-icon-pull-down {
      cursor: pointer;
      display: block;
      transform: rotate(0deg);
      transition: transform .2s linear;
      &.expand {
        transform: rotate(180deg);
      }
      &:before {
        color: #7a85a0;
      }
    }
  }
  &-clear {
    position: absolute;
    right: 32px;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    &:before {
      color: #7a85a0;
    }
  }
  &-panel {
    position: fixed;
    z-index: 99;
    border: 1px solid #d2d7e0;
    border-top: none;
    border-radius: 2px;
    padding: 8px 0;
    min-width: 300px;
    max-height: 300px;
    overflow: auto;
    box-sizing: border-box;
    background-color: #fff;
  }
  &-option {
    width: 100%;
    padding: 0 16px;
    line-height: 32px;
    box-sizing: border-box;
    color: #333;
    background-color: #fff;
    user-select: none;
    &:hover,
    &.selected {
      background-color: #f5f7fa;
      color: #3B68B7;
    }
  }
  &-empty {
    width: 100%;
    padding: 0 16px;
    line-height: 32px;
    box-sizing: border-box;
    color: #687381;
    user-select: none;
  }
}

@keyframes transform {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(180deg);
  }
}

.expand-enter-active, .expand-leave-active {
  transition: all .2s ease;
}

.expand-enter-to {
  overflow: hidden;
}

.expand-enter, .expand-leave-to {
  max-height: 0;
  padding: 0;
  overflow: hidden;
}
</style>

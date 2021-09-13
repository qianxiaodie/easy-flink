<template>
  <div class="u-multi-select" @keydown="onKeydown">
    <div class="multi-select-content" :class="{'active': active, 'disabled': disabled}">
      <div class="list">
        <div class="item" v-for="(item, index) in value" :key="index">
          {{handleActualValue(item)}}
          <div class="multi-select-close" @click="remove(item)">
            <i class="ndc-icon-close" />
          </div>
        </div>
        <div class="input">
          <input ref="input" :disabled="disabled" :placeholder="value.length ? '' : placeholder" class="multi-select-text" :class="{'disabled': disabled}" type="text" @input="onInput" @blur="onBlur" @focus="onFocus" @click="onClickInput">
        </div>
      </div>
    </div>

    <div class="multi-select-panel" :style="panelStyle" v-show="panelVisible">
      <div v-if="actualOptions.length">
        <div class="multi-select-option"
          v-for="(item, index) in actualOptions" :key="index"
          :class="{
            'selected': isSelected(item),
            'active': index === activeIndex
          }"
          @click="onClick(item)"
        >
          {{showValue ? item[labelKey] + '-' + item[valueKey] : item[labelKey] }}
          <i v-if="isSelected(item)" class="ndc-icon-tick" />
        </div>
      </div>
      <div class="multi-select-empty" v-else>无结果</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { cloneDeep } from 'lodash';
import { isObject } from '../../utils';

@Component
export default class UMultiSelect extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private value!: any[];

  @Prop({
    default() {
      return [];
    }
  })
  private options!: any[];

  @Prop({
    default: 'label'
  })
  private labelKey!: string;

  @Prop({
    default: 'value'
  })
  private valueKey!: string;

  @Prop({
    default: '请输入'
  })
  private placeholder!: string;

  @Prop({
    default: true
  })
  private showValue!: boolean;

  @Prop({
    default: false
  })
  private disabled!: boolean;

  private actualOptions: any[] = [];
  private panelVisible: boolean = false;
  private panelStyle: any = {};
  private active: boolean = false;
  private activeIndex: number = -1;

  private handleActualValue(val) {
    if (isObject(val)) {
      return val[this.labelKey] || val[this.valueKey];
    }
    const item = this.options.find(o => o[this.valueKey] === val);
    return item ? item[this.labelKey] : val;
  }

  private showPanel() {
    if (!this.panelVisible && !this.disabled) {
      this.panelVisible = true;
      const input = this.$refs.input as HTMLInputElement;
      this.actualOptions = input.value ? this.options.filter(o => o[this.valueKey] && o[this.valueKey].includes(input.value)) : cloneDeep(this.options);
      this.genPanelStyle();
      setTimeout(() => {
        window.addEventListener('scroll', this.hidePanelByScroll as EventListenerOrEventListenerObject, true);
        window.addEventListener('resize', this.genPanelStyle);
        document.body.addEventListener('click', this.hidePanelByClick);
      }, 0);
    }
  }

  private hidePanelByScroll(e: MouseEvent) {
    const target = e.target as any;
    if (target.className !== 'multi-select-panel') {
      this.hidePanel();
    }
  }

  private hidePanelByClick(e: MouseEvent) {
    const target = e.target as any;
    if (!target.className.startsWith('multi-select')) {
      this.hidePanel();
    }
  }

  private hidePanel() {
    if (this.panelVisible) {
      this.panelVisible = false;
      this.activeIndex = -1;
      const input = this.$refs.input as HTMLInputElement;
      input && (input.value = '');
      window.removeEventListener('scroll', this.hidePanelByScroll as EventListenerOrEventListenerObject);
      window.removeEventListener('resize', this.genPanelStyle);
      document.body.removeEventListener('click', this.hidePanelByClick);
    }
  }

  private genPanelStyle() {
    if (this.$el) {
      this.panelStyle = {};
      const { left, top, width, height, bottom } = this.$el.getBoundingClientRect();
      const bodyRect = document.body.getBoundingClientRect();
      this.panelStyle.left = left + 'px';
      this.panelStyle.minWidth = width + 'px';
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

  private isSelected(item: any) {
    return this.value.some(u => (typeof u === 'string' ? u : u[this.valueKey]) === item[this.valueKey]);
  }

  private downActiveIndex() {
    for (let i = this.activeIndex + 1; i < this.actualOptions.length; i++) {
      const option = this.actualOptions[i];
      if (this.isSelected(option)) {
        continue;
      }
      return this.activeIndex = i;
    }
    this.activeIndex = this.actualOptions.length - 1;
  }

  private upActiveIndex() {
    for (let i = this.activeIndex - 1; i > 0; i--) {
      const option = this.actualOptions[i];
      if (this.isSelected(option)) {
        continue;
      }
      return this.activeIndex = i;
    }
    this.activeIndex = 0;
  }

  private remove(item: any) {
    this.$emit('remove', item);
    const val = cloneDeep(this.value);
    const itemVal = typeof item === 'string' ? item : item[this.valueKey];
    const index = val.findIndex(v => (typeof v === 'string' ? v === itemVal : v[this.valueKey] === itemVal));
    if (index !== -1) {
      val.splice(index, 1);
      this.$emit('input', val);
      this.$emit('change', val);
    }
  }

  private onClick(item: any) {
    if (this.isSelected(item)) {
      return;
    }
    this.$emit('insert', item);
    const val = cloneDeep(this.value);
    val.push(item);
    this.$emit('input', val);
    this.$emit('change', val);
    // this.hidePanel();
  }

  private onInput(e: Event) {
    if (this.disabled) {
      return;
    }
    const target = e.target as any;
    const val = target.value;
    this.actualOptions = val ? this.options.filter(o => o[this.valueKey] && o[this.valueKey].includes(val)) : cloneDeep(this.options);
    this.showPanel();
  }

  private onFocus() {
    if (this.disabled) {
      return;
    }
    this.active = true;
  }

  private onClickInput() {
    if (this.disabled) {
      return;
    }
    this.showPanel();
  }

  private onBlur() {
    this.active = false;
  }

  private onKeydown(e: KeyboardEvent) {
    if (this.panelVisible) {
      switch (e.keyCode) {
        case 38: // 上
          this.upActiveIndex();
          e.preventDefault();
          break;
        case 40: // 下
          this.downActiveIndex();
          break;
        case 13: { // 回车
          if (this.activeIndex !== -1) {
            this.onClick(this.actualOptions[this.activeIndex]);
          }
          break;
        }
        default:
          break;
      }
    }
    if (e.keyCode === 8) { // 退格
      this.onBackSpace();
    }
  }

  private onBackSpace() {
    const input = this.$refs.input as HTMLInputElement;
    if (input && !input.value && this.value.length) {
      this.remove(this.value[this.value.length - 1]);
    }
  }
}
</script>

<style lang="scss">
.u-multi-select {
  width: 100%;
  background: #fff;
  .multi-select {
    &-content {
      height: 36px;
      padding: 1px 16px;
      border: 1px solid #d2d7e0;
      border-radius: 2px;
      box-sizing: border-box;
      overflow-y: auto;
      &.active,
      &:hover {
        border-color: #2b75f6;
      }
      &.disabled {
        border-color: #d2d7e0;
        cursor: not-allowed;
      }
      .list {
        list-style: none;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        .item {
          display: block;
          position: relative;
          max-width: 100%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          line-height: 24px;
          height: 24px;
          background: #e1e6ee;
          border-radius: 3px;
          padding: 0 24px 0 8px;
          margin: 4px;
          color: #666;
          box-sizing: border-box;
          .multi-select-close {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 16px;
            height: 16px;
            border-radius: 8px;
            cursor: pointer;
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
        .input {
          flex: 1;
          .multi-select-text {
            width: 100%;
            border: none;
            &.disabled {
              background: #fff !important;
              cursor: not-allowed;
            }
          }
        }
      }
    }
    &-panel {
      position: fixed;
      z-index: 99;
      border: 1px solid #d2d7e0;
      border-top: none;
      border-radius: 2px;
      padding: 8px 0;
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
      position: relative;
      &:hover,
      &.active {
        background-color: #f5f7fa;
        color: #3B68B7;
      }
      &.selected {
        background-color: #f5f5f5;
        color: #999;
        cursor: not-allowed;
        &:hover {
          background-color: #f5f5f5;
          color: #999;
        }
      }
      .ndc-icon-tick {
        position: absolute;
        right: 8px;
        top: 50%;
        transform: translateY(-50%);
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
}
</style>

<template>
  <div class="u-alarm-input" @keydown="onKeydown">
    <div class="alarm-input-content" :class="{'active': active}">
      <div class="list">
        <div class="user" v-for="(item, index) in users" :key="index">
          {{item.name}}
          <div class="alarm-input-close" @click="remove(item)">
            <i class="ndc-icon-close" />
          </div>
        </div>
        <div class="input">
          <input ref="input" :placeholder="users.length ? '' : '请输入报警人'" class="alarm-input-text" type="text" @input="onInput" @blur="onBlur" @focus="onFocus" @click="onClickInput">
        </div>
      </div>
    </div>

    <div class="alarm-input-panel" :style="panelStyle" v-show="panelVisible">
      <div v-if="actualOptions.length">
        <div class="alarm-input-option"
          v-for="(item, index) in actualOptions" :key="index"
          :class="{
            'selected': isSelected(item),
            'active': index === activeIndex
          }"
          @click="onClick(item)"
        >
          {{item.name + '-' + item.email}}
          <i v-if="isSelected(item)" class="ndc-icon-tick" />
        </div>
      </div>
      <div class="alarm-input-empty" v-else>无结果</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { cloneDeep } from 'lodash';

@Component
export default class UAlarmInput extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private users!: any[];

  @Prop({
    default() {
      return [];
    }
  })
  private options!: any[];

  private actualOptions: any[] = [];
  private panelVisible: boolean = false;
  private panelStyle: any = {};
  private active: boolean = false;
  private activeIndex: number = -1;

  private showPanel() {
    if (!this.panelVisible) {
      this.panelVisible = true;
      const input = this.$refs.input as HTMLInputElement;
      this.actualOptions = input.value ? this.options.filter(o => o.email.includes(input.value)) : cloneDeep(this.options);
      this.genPanelStyle();
      setTimeout(() => {
        window.addEventListener('scroll', this.hidePanelByScroll as EventListenerOrEventListenerObject, true);
        document.body.addEventListener('click', this.hidePanelByClick);
      }, 0);
    }
  }

  private hidePanelByScroll(e: MouseEvent) {
    const target = e.target as any;
    if (target.className !== 'alarm-input-panel') {
      this.hidePanel();
    }
  }

  private hidePanelByClick(e: MouseEvent) {
    const target = e.target as any;
    if (!target.className.startsWith('alarm-input')) {
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

  private isSelected(user: any) {
    return this.users.some(u => u.email === user.email);
  }

  private downActiveIndex() {
    for (let i = this.activeIndex + 1; i < this.actualOptions.length; i++) {
      const option = this.actualOptions[i];
      if (this.users.some(u => u.email === option.email)) {
        continue;
      }
      return this.activeIndex = i;
    }
    this.activeIndex = this.actualOptions.length - 1;
  }

  private upActiveIndex() {
    for (let i = this.activeIndex - 1; i > 0; i--) {
      const option = this.actualOptions[i];
      if (this.users.some(u => u.email === option.email)) {
        continue;
      }
      return this.activeIndex = i;
    }
    this.activeIndex = 0;
  }

  private remove(user: any) {
    this.$emit('remove', user);
  }

  private onClick(user: any) {
    if (this.isSelected(user)) {
      return;
    }
    this.$emit('insert', user);
    this.hidePanel();
  }

  private onInput(e: Event) {
    const target = e.target as any;
    const val = target.value;
    this.actualOptions = val ? this.options.filter(o => o.email.includes(val)) : cloneDeep(this.options);
    this.showPanel();
  }

  private onFocus() {
    this.active = true;
  }

  private onClickInput() {
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
    if (input && !input.value && this.users.length) {
      this.remove(this.users[this.users.length - 1]);
    }
  }
}
</script>

<style lang="scss">
.u-alarm-input {
  width: 464px;
  background: #fff;
  .alarm-input {
    &-content {
      height: 37px;
      padding: 1px 12px;
      border: 1px solid #d9dde3;
      border-radius: 2px;
      box-sizing: border-box;
      overflow-y: auto;
      &.active,
      &:hover {
        border-color:#3B68B7;
      }
      .list {
        list-style: none;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        width: 100%;
        .user {
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
          .alarm-input-close {
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
          input {
            width: 100%;
            border: none;
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

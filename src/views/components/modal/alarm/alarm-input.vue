<template>
  <div class="u-alarm-input" @keydown="onKeydown">
    <div class="alarm-input-content" :class="{'active': active}">
      <div class="list">
        <div class="user" v-for="(item, index) in users" :key="index">
          {{item.name}}
          <!-- <div class="alarm-input-close" > -->
            <img @click="remove(item)" src="@/assets/images/icon／眼睛显示 copy备份.png" alt="">
            <!-- <i class="ndc-icon-close" /> -->
          <!-- </div> -->
        </div>
        <div class="input">
          <input ref="input" :placeholder="users.length ? '' : '请输入报警人工号'" class="alarm-input-text" type="text" @input="onInput" @blur="onBlur" @focus="onFocus" @click="onClickInput">
        </div>
      </div>
    </div>
    <!-- <ndc-button v-show="panelVisible" theme="primary" style="width:60px;margin-left:20px;padding:0" @click="onClick(usernum)">添加</ndc-button> -->

    <div class="alarm-input-panel" :style="panelStyle" v-show="panelVisible">
      <ndc-virtual-list ref="list" v-if="actualOptions.length" :data="actualOptions">
        <template v-slot:item="scope">
          <div class="alarm-input-option"
            :class="{
              'selected': isSelected(scope.item)
            }"
            @click="onClick(scope.item)"
          >
            {{scope.item.name + '-' + scope.item.email}}
            <i v-if="isSelected(scope.item)" class="ndc-icon-tick" />
          </div>
        </template>
      </ndc-virtual-list>
      <div class="alarm-input-empty" v-else>无结果</div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

import { cloneDeep } from 'lodash';
import { getUserList } from './user';

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
  private usernum:string = ""
  private actualOptions: any[] = [];
  private panelVisible: boolean = false;
  private panelStyle: any = {};
  private active: boolean = false;

  private showPanel() {
    if (this.panelVisible) {
      const panelHeight = this.actualOptions.length ? (this.actualOptions.length * 32) + 17 : 49;
      this.panelStyle.height = (panelHeight > 305 ? 305 : panelHeight) + 'px';
    } else {
      this.panelVisible = true;
      const input = this.$refs.input as HTMLInputElement;
      this.actualOptions = input.value ? this.options.filter(o => o.email.includes(input.value)) : cloneDeep(this.options);
      this.genPanelStyle();
      setTimeout(() => {
        window.addEventListener('scroll', this.hidePanelByScroll as EventListenerOrEventListenerObject, true);
        window.addEventListener('resize', this.genPanelStyle);
        document.body.addEventListener('click', this.hidePanelByClick);
      }, 0);
    }
    this.$nextTick(() => {
      const list = this.$refs.list as any;
      list && list.resize();
    });
  }

  private hidePanelByScroll(e: MouseEvent) {
    const target = e.target as any;
    if (target.className !== 'alarm-input-panel' && target.className !== 'ndc-virtual-list') {
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
      const panelHeight = this.actualOptions.length ? (this.actualOptions.length * 32) + 17 : 49;
      this.panelStyle.height = (panelHeight > 305 ? 305 : panelHeight) + 'px';
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

  private remove(user: any) {
    this.$emit('remove', user);
  }

  private onClick(user: any) {
    if (this.isSelected(user)) {
      return;
    }
    this.$emit('insert', user);
    // this.users.push({name:this.usernum})
    this.hidePanel();
    // console.log(user,'usernum',this.users)
    // this.usernum = ""
  }

  private async onInput(e: Event) {
    const target = e.target as any;
    const val = target.value;
    let res = await getUserList(val);
    console.log(val, 'input value', res);
    this.actualOptions = res;
    // this.actualOptions = val ? this.options.filter(o => o.email.includes(val)) : cloneDeep(this.options);
    // this.showPanel();
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
  width: 100%;
  background: #fff;
  // display: flex;
  .alarm-input {
    &-content {
      width: 320px;
      height: 32px;
      border-radius: 3px;
      border: 1px solid #BBBBBB;
      padding: 1px 12px;
      box-sizing: border-box;
      overflow-y: auto;
      &.active,
      &:hover {
        border-color: #3B68B7;
      }
      .list {
        list-style: none;
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        height: 28px;
        width: 100%;
        .user {
          display: block;
          display: flex;
          align-items: center;
          position: relative;
          width: 76px;
          font-size: 14px;
          // max-width: 100%;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          line-height: 24px;
          height: 24px;
          background: #EEE;
          border-radius: 3px;
          padding: 0 8px;
          margin: 0 4px;
          color: #666;
          box-sizing: border-box;
          img{
            margin-left:8px ;
            height: 14px;
            cursor: pointer;
            // line-height: 24px;
            // vertical-align: middle;
          }
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
          line-height: 28px;
          input {
            width: 100%;
            border: none;
            height: 28px;
            box-sizing: border-box;
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
      max-height: 304px;
      overflow: auto;
      box-sizing: border-box;
      background-color: #fff;
      .ndc-virtual-list-item {
        padding: 0;
      }
    }
    &-option {
      width: 100%;
      padding: 0 16px;
      line-height: 28px;
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
      line-height: 28px;
      box-sizing: border-box;
      color: #687381;
      user-select: none;
    }
  }
}
</style>

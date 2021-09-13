<template>
  <div class="steps">
    <div :class="currentStepsz == 1 ? 'Steps-active' : 'Steps-first'">
      <span>1</span>
      <span>安装参数</span>
    </div>
    <div :class="currentStepsz == 2 ? 'Steps-active' : 'Steps-first'">
      <span>2</span>
      <span>信息确认</span>
    </div>
    <div :class="currentStepsz == 3 ? 'Steps-third-active' : 'Steps-third'">
      <span>3</span>
      <span>部署日志</span>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Inject, Mixins, Prop, Vue } from 'vue-property-decorator';
import MIdePanel from '../ide-panel/index.vue';
import MCompareModal from '../compare-modal/compare.vue';

import createCompareModal from '../compare-modal';
import { IVersion } from '@utils/types';
import { EDITOR_CMD } from '../../constant';

@Component
export default class MStepsModal extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private currentStepsz!: any

  public mounted() {
    console.log(this.currentStepsz);
  }
}
</script>

<style lang="scss">
.steps {
  font-size: 14px;
  margin-left: 100px;
  display: flex;
  flex-direction: row;
  margin-top: 5px;
  .Steps-first,
  .Steps-third {
    position: relative;
    width: 200px;
    height: 32px;
    padding-left: 20px;
    padding-top: 7px;
    box-sizing: border-box;
    border-radius: 3px 2px 2px 2px;
    background-color: #eeeeee;
    span:first-of-type {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background-color: rgba(0, 0, 0, 0.3);
      text-align: center;
      margin-right: 8px;
      color: white;
    }
  }
  .Steps-first ::after {
    position: absolute;
    top: 3px;
    right: -11px;
    display: block;
    content: close-quote;
    height: 24px;
    width: 24px;
    z-index: 1;
    background-color: #eeeeee;
    transform: rotate(45deg);
    border-right: 3px solid #ffffff;
    border-top: 3px solid #ffffff;
  }
  .Steps-active,
  .Steps-third-active {
    position: relative;
    width: 200px;
    height: 32px;
    padding-left: 20px;
    padding-top: 7px;
    box-sizing: border-box;
    border-radius: 3px 2px 2px 2px;
    background-color: #3b68b7;
    color: white;
    span:first-of-type {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: 10px;
      background-color: rgba(0, 0, 0, 0.3);
      text-align: center;
      margin-right: 8px;
      color: white;
    }
  }
  .Steps-active ::after {
    position: absolute;
    top: 3px;
    right: -11px;
    display: block;
    content: close-quote;
    height: 24px;
    width: 24px;
    z-index: 1;
    background-color: #3b68b7;
    transform: rotate(45deg);
    border-right: 3px solid #ffffff;
    border-top: 3px solid #ffffff;
  }
}
</style>

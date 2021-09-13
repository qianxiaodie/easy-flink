<template>
  <div class="u-wave-icon">
    <div class="dot" :style="{'background-color': color}"></div>
    <div class="inner-circle" :style="circleStyle"></div>
    <div class="outer-circle" :style="circleStyle"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class UWaveIcon extends Vue {
  @Prop({
    default: '#01d787'
  })
  private color!: string;

  private get circleStyle() {
    return {
      border: `1px solid ${this.color}`,
      boxShadow: `1px 1px 10px ${this.color}`
    };
  }
}
</script>

<style lang="scss">
.u-wave-icon {
  position: relative;
  width: 16px;
  height: 16px;
  margin-right: 8px;

  /* 保持大小不变的小圆点 */
  .dot {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    z-index: 2;
  }

  /* 产生动画（向外扩散变大）的圆圈 第一个圆 */
  .inner-circle {
    position: absolute;
    z-index: 1;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-sizing: border-box;
    animation: circleAnimationIn 2s ease-out;
    animation-iteration-count: infinite;
  }

  /* 产生动画（向外扩散变大）的圆圈 第二个圆 */
  .outer-circle {
    position: absolute;
    z-index: 1;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    box-sizing: border-box;
    animation: circleAnimationOut 2s ease-out;
    animation-iteration-count: infinite;
  }
}

@keyframes circleAnimationIn {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  25% {
    transform: scale(0.4);
    opacity: 0.1;
  }
  50% {
    transform: scale(0.5);
    opacity: 0.3;
  }
  75% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
}

@keyframes circleAnimationOut {
  0% {
    transform: scale(0.3);
    opacity: 0;
  }
  25% {
    transform: scale(0.3);
    opacity: 0.1;
  }
  50% {
    transform: scale(0.4);
    opacity: 0.3;
  }
  75% {
    transform: scale(0.5);
    opacity: 0.5;
  }
  100% {
    transform: scale(0.8);
    opacity: 0;
  }
}
</style>

<template>
  <div class="u-info">
    <div v-if="head" class="info-head">
      <div class="info-head-icon"></div>
      <div class="name">{{head}}</div>
    </div>
    <div class="info-con">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UInfo extends Vue {
  @Prop({
    default: ''
  })
  private head!: string;
}
</script>

<style lang="scss">
.u-info {
  width: 100%;
  margin-bottom: 0;
  .info-head {
    position: relative;
    box-sizing: border-box;
    width: 100%;
    height: 40px;
    padding-left: 12px;
    line-height: 40px;
    font-weight: normal;
		font-size: 16px;
		&-icon {
			position: absolute;
			width: 2px;
			height: 12px;
			background-color: #3274e6;
			top: 50%;
			transform: translateY(-50%);
			left: 0;
		}
    .name {
      float: left;
      font-weight: normal;
      font-size: 16px;
    }
  }
  .info-con {
    box-sizing: border-box;
    width: 100%;
    overflow: hidden;
    padding: 8px 12px;
  }
}
</style>

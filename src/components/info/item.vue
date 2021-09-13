<template>
  <div class="u-info-item" :class="itemClass" :title="title">
    <span v-if="label" :style="labelStyle" class="info-label">{{label}}</span>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UInfoItem extends Vue {
  @Prop({
    default: ''
  })
  private label!: string;

  @Prop({
    default: ''
  })
  private title!: string;

  @Prop({
    default: 'normal'
  })
  private size!: string;

  @Prop({
    default: ''
  })
  private labelStyle!: string;

  private get itemClass(): any {
    const result: any = {};
    result['info-item-' + this.size] = true;
    return result;
  }
}
</script>

<style lang="scss">
.u-info {
  &-item {
    float: left;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    line-height: 48px;
    text-overflow: ellipsis;
    color: #666;
    padding: 0 8px;
    box-sizing: border-box;
    &.info-item-normal {
      width: 33.33%;
    }
    &.info-item-large {
      width: 95%;
    }
    .info-label {
      display: inline-block;
      min-width: 90px;
      margin-right: 12px;
      color: #808080;
    }
}
}
</style>

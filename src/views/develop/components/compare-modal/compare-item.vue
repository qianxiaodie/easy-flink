<template>
  <div class="u-compare-item g-flex-ac">
    <div class="label">{{label}}</div>
    <div class="content" :class="{'g-text-nowrap': ellipsis}" :title="content">
      <slot>{{content}}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UCompareItem extends Vue {
  @Prop({
    default: ''
  })
  private label!: string;

  @Prop({
    default: ''
  })
  private content!: string;

  @Prop({
    default: true
  })
  private ellipsis!: boolean;
}
</script>

<style lang="scss">
.u-compare-item {
  .label {
    width: 130px;
    color: #999;
    flex-shrink: 0;
  }
  .content {
    color: #333;
    flex: 1;
    white-space: nowrap;
  }
}
</style>

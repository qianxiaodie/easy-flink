<template>
  <div class="u-config" :class="itemClass">
    <span v-if="label" :style="labelStyle" class="u-config-label">{{label}}</span>
    <div class="u-config-content">
      <slot></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UConfig extends Vue {
  @Prop({
    default: ''
  })
  private label!: string;

  @Prop({
    default: 'normal'
  })
  private size!: string;

  @Prop({
    default: 'width: 90px'
  })
  private labelStyle!: string;

  private get itemClass() {
    const _c: any = {};
    _c['u-config-' + this.size] = true;
    return _c;
  }
}
</script>

<style lang="scss">
.u-config {
  display: flex;
  align-items: center;
  color: #333;
  line-height: 48px;
  &-label {
    text-align: right;
    flex-shrink: 0;
  }
  &-content {
    padding-left: 16px;
    flex: 1;
    width: 0;
    box-sizing: border-box;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
  &-normal {
    width: 33.3%;
  }
  &-large {
    width: 95%;
  }
}
</style>

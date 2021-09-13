<template>
  <div class="u-info-section" :class="{'info-table': hasTable}">
    <div class="info-title" v-if="title">{{title}}</div>
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UInfoSection extends Vue {
  @Prop({
    default: ''
  })
  private title!: string;

  @Prop({
    default: false
  })
  private hasTable!: boolean;
}
</script>

<style lang="scss">
.u-info {
  &-section {
    overflow: hidden;
    margin-bottom: 16px;
    &:last-child {
      margin-bottom: 0;
    }
    &.info-table {
      padding-bottom: 10px;
    }
  }
  .info-title {
    line-height: 48px;
    color: #808080;
  }
}
</style>

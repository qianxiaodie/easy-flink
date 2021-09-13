<template>
  <div class="u-info-empty" v-if="!list.length">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UInfoEmpty extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private list!: any[];
}
</script>

<style lang="scss">
.u-info {
  &-empty {
    width: 100%;
    padding: 12px;
    color: #808080;
    background-color: #fff;
    text-align: center;
  }
}
</style>

<template>
  <div class="u-info-all" v-if="!active">
    <a href="javascript:void(0)" @click="toggle">显示全部</a>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UInfoAll extends Vue {
  @Prop({
    default: false
  })
  private active!: boolean;

  private toogle() {
    this.$emit('update:active', !this.active);
  }
}
</script>

<style lang="scss">
.u-info-all {
  margin: 10px 0;
  text-align: center;
}
</style>

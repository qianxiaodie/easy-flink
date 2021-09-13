<template>
  <div class="u-info-expander" v-if="text">
    <a href="javascript:void(0)" @click="toggle">{{text}}</a>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UInfoExpander extends Vue {
  @Prop({
    default: false
  })
  private active!: boolean;

  @Prop({
    default: '收起部分'
  })
  private activeText!: string;

  @Prop({
    default: '展开全部'
  })
  private deactiveText!: string;

  private get text(): string {
    return this.active ? this.activeText : this.deactiveText;
  }

  private toggle() {
    this.$emit('update:active', !this.active);
  }
}
</script>

<style lang="scss">
.u-info {
  &-expander {
    clear: both;
    margin: 10px 0;
    text-align: center;
  }
}
</style>

<template>
  <div class="u-text-button" :class="{'disabled': disabled}" @click="onClick">
    <i class="icon" v-if="icon" :class="icon" />
    <div class="label g-flex-ac">
      <slot>{{label}}</slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UTextButton extends Vue {
  @Prop({
    default: ''
  })
  private icon!: string;

  @Prop({
    default: ''
  })
  private label!: string;

  @Prop({
    default: false
  })
  private disabled!: boolean;

  private onClick(e: MouseEvent) {
    if (this.disabled) {
      return;
    }
    this.$emit('click', e);
  }
}
</script>

<style lang="scss">
.u-text-button {
  display: flex;
  align-items: center;
  cursor: pointer;
  user-select: none;
  color: #555555;
  &.disabled {
    color: #999;
    cursor: not-allowed;
    &:hover {
      color: #999;
    }
  }
  &:hover {
    color: #3B68B7;
  }
  & + .u-text-button {
    margin-left: 24px;
  }
  .icon {
    display: block;
    font-size: 14px;
    margin-right: 8px;
  }
  .label {
    font-size: 12px;
  }
}
</style>

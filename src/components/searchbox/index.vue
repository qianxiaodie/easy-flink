<template>
  <div class="u-searchbox">
    <input
      v-model="value"
      :placeholder="placeholder"
      type="text"
      class="u-searchbox-input"
      @keyup.enter="onEnter"
      @change="onChange"
      @input="onSearch"
    >
<!--		<i class="u-searchbox-error ndc-icon-error" v-if="value" @click="clear" />-->
		<i class="u-searchbox-search ndc-icon-search" />
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class USearchbox extends Vue {
  @Prop({
    default: '请输入关键字'
  })
  private placeholder!: string;

  private value: string = '';

  private onSearch(event: Event) {
    this.$emit('confirm', {
      event,
      value: this.value.trim()
    });
  }

  private onEnter(event: Event) {
    this.$emit('enter', {
      event,
      value: this.value.trim()
    });
  }

  private onChange(event: Event) {
    this.$emit('change', {
      event,
      value: this.value.trim()
    });
  }

  private clear() {
    this.value = '';
    this.$emit('clear');
  }
}
</script>

<style lang="scss">
.u-searchbox {
  position: relative;
  width: 300px;
  &-input {
    display: inline-block;
    box-sizing: border-box;
    width: 100%;
    height: 32px;
    padding: 4px 25px 4px 12px;
    border: 1px solid #d2d7e0;
    border-radius: 3px;
    font-size: 14px;
    line-height: 32px;
    color: #333;
    transition: border-color 0.2s;

    &:hover,
    &:focus {
      border-color: #3B68B7;
    }
  }
  &-input:focus + &-search {
    color: #3B68B7;
  }
  &-error,
  &-search {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    color: #7a85a0;
    font-size: 16px;
  }
  &-error {
    right: 8px;
    cursor: pointer;
  }
  &-search {
    right: 8px;
  }
}
</style>

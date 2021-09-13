<template>
  <div class="u-info-block">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class UInfoBlock extends Vue {}
</script>

<style lang="scss">
.u-info {
  &-block {
    float: left;
    box-sizing: border-box;
    width: 32%;
    padding: 12px 38px;
    margin-left: 2%;
    background-color: #fff;
    border: 1px solid #d7e1ef;
    &:hover {
      box-shadow: 0 0 6px rgba(75, 143, 245, 0.28);
    }
    &:nth-child(3n + 1) {
      margin-left: 0;
    }
    &:nth-child(n + 4) {
      margin-top: 20px;
    }
    .info-item {
      width: 100%;
      margin: 4px 0;
      padding: 0;
    }
  }
}
</style>

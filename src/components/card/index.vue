<template>
  <div class="u-card">
    <slot></slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class UCard extends Vue {}
</script>

<style lang="scss">
.u-card {
  border: 1px solid #e2e5e9;
  border-radius: 3px;
  background: #fff;
  padding: 16px 24px;

  & + .u-card {
    margin-top: 24px;
  }

  & > .u-info {
    .u-accordion {
      margin-top: 16px;
    }
  }

  & > .m-form {
    padding: 20px 0 8px 42px;
    .u-accordion {
      margin-top: 16px;
    }
  }
}
</style>

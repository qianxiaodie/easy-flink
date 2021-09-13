<template>
  <div class="m-admin-list">
    <div class="list-header" v-if="headerVisible">
      <div class="g-flex-ac">
        <slot name="header"></slot>
      </div>
      <u-searchbox v-if="searchable" :placeholder="placeholder" @enter="onConfirm" @change="onConfirm" @clear="onClear"></u-searchbox>
    </div>
    <div class="list-body">
     <slot></slot>
    </div>
    <div class="list-footer" v-if="footerVisible">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class MAdminList extends Vue {
  @Prop({
    default: '请输入关键字'
  })
  private placeholder!: string;

  @Prop({
    default: false
  })
  private searchable!: boolean;

  @Prop({
    default: true
  })
  private headerVisible!: boolean;

  @Prop({
    default: true
  })
  private footerVisible!: boolean;

  private onConfirm(e: any) {
    this.$emit('search', e.value);
  }

  private onClear() {
    this.$emit('search', '');
  }
}
</script>

<style lang="scss">
.m-admin-list {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 24px;
  box-sizing: border-box;
  .list-header {
    padding: 0 8px 16px 0;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .list-body {
    height: 0;
    flex: 1;
    .ndc-table {
      height: 100%;
    }
  }
  .list-footer {
    padding-top: 16px;
  }
}
</style>

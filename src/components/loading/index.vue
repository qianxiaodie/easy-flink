<template>
  <div class="u-loading">
    <i class="ndc-icon-close" v-if="closable" @click="close()"></i>
    <img class="u-loading-img" src="../../assets/images/loading.gif" />
    <div class="u-loading-text">{{loadingText}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from "vue-property-decorator";

@Component
export default class ULoading extends Vue {
  @Prop({
    default: "加载中..."
  })
  private loadingText!: string;

  @Prop({
    default: false
  })
  private closable!: boolean;

  private close() {
    this.$emit('close');
  }
}
</script>

<style lang="scss">
.u-loading {
  position: absolute;
  z-index: 999;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, .2);
  .ndc-icon-close {
    font-size: 16px;
    font-weight: 600;
    position: absolute;
    top: 20px;
    right: 24px;
    cursor: pointer;
  }
  &-img {
    width: 30px;
    height: 30px;
  }
  &-text {
    margin-top: 8px;
    user-select: none;
    color: #fff;
  }
}
</style>

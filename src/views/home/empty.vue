<template>
  <div class="m-home-empty">
    <img src="../../assets/images/sloth_gray.png" />
    <div class="title">暂无权限，无法查看页面</div>
    <div class="desc g-flex-ac">如需申请权限，请登录<span class="g-text-link" @click="jumpToMammut"></span>联系管理员</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import { State } from 'vuex-class';
// import { MODULE_NAMESPACE } from '@utils/constant';
// import { IUserConfig } from '@utils/types';

@Component
export default class HomeEmpty extends Vue {
  // @State('userConfig', MODULE_NAMESPACE.global)
  // private userConfig!: IUserConfig;

  private jumpToMammut() {
    // const url = (this.userConfig && this.userConfig.mammutUrl) || '';
    // window.open(url, '_blank');
  }
}
</script>

<style lang="scss">
.m-home-empty {
  flex: 1;
  height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  .title {
    font-size: 18px;
    line-height: 32px;
    margin: 10px 0;
    color: #999;
  }
  .desc {
    font-size: 14px;
    line-height: 28px;
    color: #999;
  }
}
</style>

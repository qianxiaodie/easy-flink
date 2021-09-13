<template>
  <div class="m-home-content" id="homecontent">
    <!-- <keep-alive :include="keepAliveList"> -->
      <router-view />
    <!-- </keep-alive> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
// import { State } from 'vuex-class';
// import { MODULE_NAMESPACE } from '@utils/constant';

@Component
export default class HomeContent extends Vue {
  // @State('keepAliveList', MODULE_NAMESPACE.global)
  // private keepAliveList!: string[]
  mounted() {
    this.scroll();
    setTimeout(this.scroll, 500);
  }
  private scroll() {
    // debugger;
    // const obj = document.getElementById('homecontent');
    //
    // obj.scrollTop = 0;
  }
}
</script>

<style lang="scss">
.m-home-content {
  height: 100%;
  flex: 1;
  overflow: hidden;
  position: relative;
  // background: #000;
  // padding-bottom: 37px;
}
</style>

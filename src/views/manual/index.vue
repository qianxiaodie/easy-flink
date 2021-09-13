<template>
  <div class="m-manual">
    <iframe ref="iframe" :src="src" scrolling="no" style="width: 100%;height: 100%;display: block;" frameborder="0"></iframe>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class MManual extends Vue {
  private src: string = 'sloth/static/gitbook/index.html';
  private created() {
    // 修改中台的高度
    const manualStyle = document.getElementById('HTAI_BASIC_CONTAINER') || ({} as any)
    manualStyle.style.height = 'calc((100% - 56px) - 0px)'
    // 判断环境，修改iframe的src
    const src = process.env.NODE_ENV === 'production' ? this.src : 'sloth/static/gitbook/index.html';
    this.src = src + '?noCache=' + Math.floor(Math.random() * 100000);
  }
}
</script>

<style lang="scss" scoped>
.m-manual {
  width: 100%;
  height: 100%;
}
</style>

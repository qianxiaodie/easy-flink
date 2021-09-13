<template>
  <div class="m-login"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class MLogin extends Vue {
  private async created() {
    console.log(8888);
    try {
      const { protocol, hostname, port } = window.location;
      const origin = port ? `${protocol}//${hostname}:${port}` : `${protocol}//${hostname}`;
      const url = await this.$request('login', {
        returnTo: `${origin}/#/openid`
      });
      if (url) {
        window.location.href = url;
      } else {
        this.$ndcconfirm({
          content: '登录异常',
          cancelButton: ''
        });
      }
    } catch (e) {
      this.$handleException(e, '登录失败');
    }
  }
}
</script>

<style lang="scss">
.m-login {
  width: 100%;
	height: 100%;
}
</style>

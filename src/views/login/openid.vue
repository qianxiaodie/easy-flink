<template>
  <div class="m-openid"></div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';
import { IUser } from '@utils/types';

@Component
export default class MOpenid extends Vue {
  @Action('getUserInfo', MODULE_NAMESPACE.global)
  private getUserInfo: any;

  private async created() {
    try {
      await this.getUserInfo();
      this.$router.replace({ path: '/sloth' });
    } catch (e) {
      this.$router.replace({ path: '/login' });
    }
  }
}
</script>

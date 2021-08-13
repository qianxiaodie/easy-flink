<template>
  <div class="m-home" v-if="isInit">
    <home-header :is-empty="isEmpty" />
    <home-empty v-if="isEmpty" />
    <home-content v-else />
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import HomeHeader from './header.vue';
import HomeContent from './content.vue';
import HomeEmpty from './empty.vue';
import { Action, Mutation, State } from 'vuex-class';
import { MODULE_NAMESPACE } from '@utils/constant';

@Component({
  components: {
    HomeHeader,
    HomeContent,
    HomeEmpty
  }
})
export default class Home extends Vue {
  private isInit: boolean = false;
  private isEmpty: boolean = false;

  private async created() {
    try {
  
    } catch (e) {
      this.$handleException(e);
    } finally {
      this.isInit = true;
    }
  }
}
</script>

<style lang="scss">
.m-home {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  min-width: 1360px;
  /*min-height: 665px;*/
}
</style>

<template>
  <config-list type="token"></config-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ConfigList from './list.vue';

@Component({
  components: {
    ConfigList
  }
})
export default class MConfigToken extends Vue {}
</script>

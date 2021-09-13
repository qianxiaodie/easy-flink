<template>
  <config-list type="kernel"></config-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ConfigList from './list.vue';

@Component({
  components: {
    ConfigList
  }
})
export default class MConfigKernel extends Vue {}
</script>

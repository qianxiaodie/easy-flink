<template>
  <config-list type="kafka"></config-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ConfigList from './list.vue';

@Component({
  components: {
    ConfigList
  }
})
export default class MConfigKafka extends Vue {}
</script>

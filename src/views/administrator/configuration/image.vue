<template>
  <config-list type="image"></config-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ConfigList from './list.vue';

@Component({
  components: {
    ConfigList
  }
})
export default class MConfigImage extends Vue {}
</script>

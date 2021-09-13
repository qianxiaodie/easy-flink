<template>
  <statistics-template type="job"></statistics-template>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import StatisticsTemplate from './template.vue';

@Component({
  components: {
    StatisticsTemplate
  }
})
export default class MStatisticsJob extends Vue {}
</script>

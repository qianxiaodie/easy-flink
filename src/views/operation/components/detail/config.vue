<template>
  <div class="m-job-config">
    <m-sql-editor
      ref="editor"
      :value="jobDetail.extRunParameter"
      :options="{
        readOnly: true,
        language: 'shell'
      }"
    ></m-sql-editor>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import MSqlEditor from '../../../develop/components/sql-editor/index.vue';
import { IJob } from '@utils/types';

@Component({
  components: {
    MSqlEditor
  }
})
export default class MJobConfig extends Vue {
  @Prop()
  private jobDetail!: IJob;

  public resize() {
    const editor = this.$refs.editor as MSqlEditor;
    editor && editor.resize();
  }
}
</script>

<style lang="scss">
.m-job-config {
  width: 100%;
  height: 100%;
  padding-top: 24px;
  box-sizing: border-box;
}
</style>

<template>
  <div class="m-json-editor" style="height: 100%;"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';

import { debounce } from 'lodash';

@Component
export default class MJsonEditor extends Vue {
  @Prop({
    default: ''
  })
  private json!: string;

  private editor?: monaco.editor.IStandaloneCodeEditor;
  private debounceResize?: any;

  @Watch('logs')
  private onValueChanged(val: string) {
    this.editor && this.editor.setValue(val);
  }

  public resize() {
    this.editor && this.editor.layout();
  }

  private created() {
    this.debounceResize = debounce(this.resize, 500);
    window.addEventListener('resize', this.debounceResize);
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.debounceResize);
    this.editor && this.editor.dispose();
  }

  private mounted() {
    const model = monaco.editor.createModel(this.json, 'json');
    this.editor = monaco.editor.create(this.$el as HTMLElement, {
      model: model
    });
  }
}
</script>

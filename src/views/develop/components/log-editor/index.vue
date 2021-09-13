<template>
  <div class="m-log-editor" style="height: 100%;"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';

import { debounce } from 'lodash';
import { EDITOR_OPTIONS } from '../../constant';

@Component
export default class MLogEditor extends Vue {
  @Prop({
    default: ''
  })
  private logs!: string;

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
    const editor = this.editor = monaco.editor.create(this.$el as HTMLElement, Object.assign({}, EDITOR_OPTIONS, {
      theme: 'logTheme',
      language: 'logLanguage',
      readOnly: true
    }));
    editor.setValue(this.logs);
  }
}
</script>

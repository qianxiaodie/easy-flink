<template>
  <div class="u-log-editor" style="min-height: 600px;height:100%;max-height:1080px"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';

import { debounce } from 'lodash';

const EDITOR_OPTIONS: any = {
  theme: 'logTheme',
  language: 'logLanguage',
  fontSize: 12,
  folding: true,
  suggestLineHeight: 20,
  autoIndent: true,
  renderLineHighlight: 'none',
  scrollBeyondLastLine: false,
  contextmenu: false,
  readOnly: true,
  fixedOverflowWidgets: true
};

@Component
export default class ULogEditor extends Vue {
  @Prop({
    default: ''
  })
  private logs!: string;

  @Prop({
    default() {
      return {};
    }
  })
  private options!: any;

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
    console.log('进入log-editor===>',debounce)
    this.debounceResize = debounce(this.resize, 500);
    window.addEventListener('resize', this.debounceResize);
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.debounceResize);
    this.editor && this.editor.dispose();
  }

  private mounted() {
    const editor = this.editor = monaco.editor.create(this.$el as HTMLElement, Object.assign({}, EDITOR_OPTIONS, this.options));
    editor.setValue(this.logs);
  }
}
</script>

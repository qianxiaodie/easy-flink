<template>
  <div class="m-sql-editor" style="height: 100%" :readOnly="true"></div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from 'vue-property-decorator';
import * as monaco from 'monaco-editor';
import { State, Action } from 'vuex-class';
import { debounce } from 'lodash';
import { EDITOR_OPTIONS, DIFF_EDITOR_OPTIPONS } from '../../constant';
// import { Action } from 'vuex-class';
import { MODULE_NAMESPACE } from '@/utils/constant';
// 引入获取权限请求
import { getOpCodes } from '@/utils/getOpcodes';
// import { cloneDeep } from 'lodash';
interface EditorCommand {
  [commandName: string]: string | null
}

@Component
export default class MSqlEditor extends Vue {
  @Model('change', {
    type: String
  })
  private value!: string

  @Prop({
    default() {
      return {};
    }
  })
  private options!: any

  private editor?: monaco.editor.IStandaloneCodeEditor
  private debounceResize?: any
  private oldValue: string = ''
  private commandMap: EditorCommand = {}

  @Watch('value')
  private onValueChanged(val: string = '') {
    if (this.oldValue !== val && this.editor) {
      this.editor.setValue(val);
    }
  }

  @Action('getOpcodes', MODULE_NAMESPACE.global)
  private getOpcodes: any

  public resize() {
    this.editor && this.editor.layout();
  }

  public insert(val: string) {
    const editor = this.editor;
    if (editor) {
      const line = editor.getPosition();
      let lineNumber = (line && line.lineNumber) || 1;
      let column = (line && line.column) || 1;
      if (lineNumber === 1 && column === 1) {
        const model = editor.getModel();
        const modelRange = model && model.getFullModelRange();
        if (modelRange) {
          lineNumber = modelRange.endLineNumber;
          column = modelRange.endColumn;
        }
      }
      const range = new monaco.Range(lineNumber, column, lineNumber, column);
      const id = { major: 1, minor: 1 };
      const op = { identifier: id, range: range, text: val, forceMoveMarkers: true };
      editor.executeEdits('sql', [op]);
    }
  }

  public executeCommand(command: string) {
    const cmd = this.commandMap[command];
    const editor = this.editor as any;
    cmd && editor && editor._commandService.executeCommand(cmd);
  }

  private created() {
    this.debounceResize = debounce(this.resize, 500);
    window.addEventListener('resize', this.debounceResize);
  }

  private beforeDestroy() {
    window.removeEventListener('resize', this.debounceResize);
    this.editor && this.editor.dispose();
  }

  /**
   * Monaco Editor
   * API： https://microsoft.github.io/monaco-editor/api/modules/monaco.editor.html
   * 主要配置： https://microsoft.github.io/monaco-editor/api/interfaces/monaco.editor.ieditoroptions.html
   */
  private async mounted() {
    // const editor = (this.editor = monaco.editor.create(this.$el as HTMLElement, Object.assign({}, EDITOR_OPTIONS, this.options)))
    // this.addCommand()
    // this.editor1 = cloneDeep(EDITOR_OPTIONS)
    // console.log('sql编译器挂在',this.options)
    // await getOpCodes({}).then(response => {
    //   if (response.opCodes.includes('rtdev_proj.devtest') === false) {
    //     EDITOR_OPTIONS.readOnly = true;
    //     console.log(EDITOR_OPTIONS.readOnly,'只读？')
    //   }
    // });
    // console.log(this.editor1,'EDITOR_OPTIONS!!!')
    if (!this.options.readOnly) {
      await getOpCodes({}).then(response => {
        if (response.opCodes.includes('rtdev_proj.devtest') === false) {
          EDITOR_OPTIONS.readOnly = true;
        }
      });
    }
    const editor = (this.editor = monaco.editor.create(this.$el as HTMLElement, Object.assign({}, EDITOR_OPTIONS, this.options)));
    this.addCommand();
    editor.setValue(this.value || '');

    editor.onDidChangeModelContent((e) => {
      const val = editor.getValue();
      this.$emit('update:value', val);
      this.$emit('change', val);
      this.oldValue = val;
    });
  }

  private addCommand() {
    if (this.editor) {
      const saveBinding = this.editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KEY_S, () => {
        this.$emit('save');
      });
      this.commandMap['save'] = saveBinding;

      const formatBinding = this.editor.addCommand(monaco.KeyMod.Alt | monaco.KeyMod.Shift | monaco.KeyCode.KEY_F, () => {
        this.formatSql();
      });
      this.commandMap['format'] = formatBinding;
    }
  }

  private formatSql() {
    const action = this.editor && this.editor.getAction('editor.action.formatDocument');
    action && action.run();
  }
}
</script>

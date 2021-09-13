/**
 * sql编辑器中关键字和格式化配置
 */
import * as monaco from 'monaco-editor';
import { language as sqlLanguage } from '@lib/sql';
// import { language as sqlLanguage } from '@lib/sql';
import sqlFormatter from 'sql-formatter';

const registerSql = () => {
  // SQL 关键字提示
  monaco.languages.registerCompletionItemProvider('sql', {
    provideCompletionItems: (model, position, context, token) => {
      const textUntilPosition = model.getValueInRange({
        startLineNumber: position.lineNumber,
        startColumn: 1,
        endLineNumber: position.lineNumber,
        endColumn: position.column
      });
      const match = textUntilPosition.match(/(\S+)$/);
      const suggestions: monaco.languages.CompletionItem[] = [];
      if (match) {
        const matchStr = match[0].toUpperCase();
        sqlLanguage.keywords.forEach((item: string) => {
          if (item.startsWith(matchStr)) {
            suggestions.push({
              label: item,
              kind: monaco.languages.CompletionItemKind.Keyword,
              insertText: item
            } as monaco.languages.CompletionItem);
          }
        });
        sqlLanguage.operators.forEach((item: string) => {
          if (item.startsWith(matchStr)) {
            suggestions.push({
              label: item,
              kind: monaco.languages.CompletionItemKind.Operator,
              insertText: item
            } as monaco.languages.CompletionItem);
          }
        });
        sqlLanguage.builtinFunctions.forEach((item: string) => {
          if (item.startsWith(matchStr)) {
            suggestions.push({
              label: item,
              kind: monaco.languages.CompletionItemKind.Function,
              insertText: item
            } as monaco.languages.CompletionItem);
          }
        });
      }
      return {
        suggestions: Array.from(new Set(suggestions))
      };
    }
  });
  // 格式化 SQL
  monaco.languages.registerDocumentFormattingEditProvider('sql', {
    provideDocumentFormattingEdits(model) {
      let formatted = sqlFormatter.format(model.getValue());
      formatted = formatted.replace(/\s-\s/g, '-')

      // 格式化 最后一行最后添加分号
      // let str = (formatted as string).split('\n') as string[];
      // str.forEach( row => {
      //   if((row.trim().charAt(0) === '-' && row.trim().charAt(1) === '-') || row.trim() === ''){
      //     return
      //   } else {
      //     if (str[str.length - 1].slice(-1) === ';'){
      //       return
      //     } else {
      //       str[str.length - 1] = str[str.length - 1].replace(str[str.length - 1], `${str[str.length - 1]};`)
      //       formatted = str.join('\n')
      //     }
      //   }
      // })
      return [{
        range: model.getFullModelRange(),
        text: formatted
      }];
    }
  });
};

const registerLogLanguage = () => {
  monaco.languages.register({ id: 'logLanguage' });
  monaco.languages.setMonarchTokensProvider('logLanguage', {
    tokenizer: {
      root: [
        [/INFO.*/, 'custom-info'],
        [/ERROR.*/, 'custom-error'],
        [/WARN.*/, 'custom-warn'],
        [/DEBUG.*/, 'custom-debug'],
        [/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2},\d{3}/, 'custom-date']
      ]
    }
  });

  const themeData: monaco.editor.IStandaloneThemeData = {
    base: 'vs',
    inherit: true,
    colors: {},
    rules: [
      { token: 'custom-info', foreground: '808080' },
      { token: 'custom-error', foreground: 'ff0000', fontStyle: 'bold' },
      { token: 'custom-warn', foreground: 'ffa500' },
      { token: 'custom-debug', foreground: 'ffa500' },
      { token: 'custom-date', foreground: '008800' },
    ]
  };

  // monaco.editor.defineTheme('slothSql', themeData);
  monaco.editor.defineTheme('logTheme', themeData);
};
registerSql();
registerLogLanguage();

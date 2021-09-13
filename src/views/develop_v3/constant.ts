export const DIFF_EDITOR_OPTIPONS: any = {
  theme: 'vs',
  fontSize: 12,
  folding: true,
  suggestLineHeight: 20,
  autoIndent: true,
  renderLineHighlight: 'none',
  scrollBeyondLastLine: false,
  contextmenu: false,
  readOnly: true,
  fixedOverflowWidgets: true,
}


export const EDITOR_OPTIONS = Object.assign({}, DIFF_EDITOR_OPTIPONS, {
  language: 'sql',
  readOnly: false
  // contextmenu: true
})

export const JOB_TYPES = [
  {
    key: 'SQL',
    title: 'SQL任务'
  },
  {
    key: 'JAR',
    title: 'JAR任务'
  }
]

export const JOB_EVENTS = {
  new: 'job_new',
  mount: 'job_mount'
}

export const EDITOR_CMD = {
  init: 0,
  resize: 1,
  format: 2,
  debug: 3,
  checkGrammar: 4,
  autoSave: 5,
  save: 6,
  release: 7,
  rollback: 8,
  mark: 9,
  resource: 10,
  quote: 11,
  deploy:12
}

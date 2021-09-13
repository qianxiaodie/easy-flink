export const STATUS_MAP = {
  'READY': '未启动',
  'STARTING': '启动中',
  'RUNNING': '运行',
  'STOPPING': '停止中',
  'STOPPED': '停止',
  'CRASHED': '集群异常',
  'FAILED': '运行失败',
  'FINISHED': '已完成'
};

export const STATUS_OPTIONS = [{
  label: '未启动',
  value: 'READY'
}, {
  label: '启动中',
  value: 'STARTING'
}, {
  label: '运行',
  value: 'RUNNING'
}, {
  label: '停止中',
  value: 'STOPPING'
}, {
  label: '停止',
  value: 'STOPPED'
}, {
  label: '集群异常',
  value: 'CRASHED'
}, {
  label: '运行失败',
  value: 'FAILED'
}];

export const RUNTIME_STATUS_MAP = {
  'NORMAL': '正常',
  'FAILED': '失败',
  'ABNORMAL': '异常'
};

export const RECORD_STATUS_MAP = {
  'START_FAILED': '启动失败',
  'RUN_FAILED': '运行失败',
  'STOPPED': '停止',
  'STOP_FAILED': '停止失败',
  'RUNNING': '运行',
  'STARTING': '启动中',
  'STOPPING': '停止中',
  'FINISHED': '已完成',
  'INIT':'异常'
};

export const NORMAL_LIST_COLUMNS = [{
  name: 'jobName',
  title: '名称'
}, {
  name: 'jobStatus',
  title: '任务状态',
  width: '8%',
  filters: [{
    key: 'ALL',
    value: '全部'
  }, {
    key: 'RUNNING',
    value: '运行'
  }, {
    key: 'STOPPED',
    value: '停止'
  }, {
    key: 'READY',
    value: '未启动'
  }, {
    key: 'STARTING',
    value: '启动中'
  }, {
    key: 'STOPPING',
    value: '停止中'
  }, {
    key: 'CRASHED',
    value: '集群异常'
  }, {
    key: 'FAILED',
    value: '运行失败'
  }]
}, {
  name: 'runtimeStatus',
  title: '运行状态',
  width: '8%',
  filters: [{
    key: 'ALL',
    value: '全部'
  }, {
    key: 'NORMAL',
    value: '正常'
  }, {
    key: 'ABNORMAL',
    value: '异常'
  }, {
    key: 'FAILED',
    value: '失败'
  }, {
    key: 'OTHERS',
    value: '-（其他）'
  }]
}, {
  name: 'tagIds',
  title: '标签',
  filters: [],
  width: '8%'
}, {
  name: 'startTime',
  title: '启动时间',
  order: 'desc',
  width: '12.5%'
}, {
  name: 'clusterId',
  title: '集群',
  filters: [],
  width: '10%'
}, {
  name: 'jobType',
  title: '类型',
  width: '6%',
  filters: [{
    key: 'ALL',
    value: '全部'
  }, {
    key: 'SQL',
    value: 'SQL'
  }, {
    key: 'JAR',
    value: 'JAR'
  }]
}, {
  name: 'creator',
  title: '创建人',
  width: '10%',
  filters: []
}, {
  name: 'resourceUse',
  title: '资源用量',
  width: '8%'
}, {
  name: 'operation',
  title: '操作',
  width: '220px'
}];

export const JOB_STATUS_FILTERS = [{
  key: 'ALL',
  value: '全部'
}, {
  key: 'RUNNING',
  value: '运行'
}, {
  key: 'STOPPED',
  value: '停止'
}, {
  key: 'READY',
  value: '未启动'
}, {
  key: 'STARTING',
  value: '启动中'
}, {
  key: 'STOPPING',
  value: '停止中'
}, {
  key: 'CRASHED',
  value: '集群异常'
}, {
  key: 'FAILED',
  value: '运行失败'
}];

export const RUNTIME_STATUS_FILTERS = [{
  key: 'ALL',
  value: '全部'
}, {
  key: 'NORMAL',
  value: '正常'
}, {
  key: 'ABNORMAL',
  value: '异常'
}, {
  key: 'FAILED',
  value: '失败'
}, {
  key: 'OTHERS',
  value: '-（其他）'
}];

export const JOB_TYPE_FILTERS = [{
  key: 'ALL',
  value: '全部'
}, {
  key: 'SQL',
  value: 'SQL'
}, {
  key: 'JAR',
  value: 'JAR'
}];

export const RECORD_COLUMNS = [{
  name: 'id',
  title: '数据ID',
  width: '7.5%'
}, {
  name: 'clusterName',
  title: '集群'
}, {
  name: 'kernelName',
  title: '内核版本'
}, {
  name: 'status',
  title: '任务状态',
  ellipsis: true,
  width: '9.5%'
}, {
  name: 'startTime',
  title: '启动时间',
  ellipsis: true,
  width: '19%'
}, {
  name: 'finishTime',
  title: '停止时间',
  ellipsis: true,
  width: '19%'
}, {
  name: 'options',
  title: '操作日志',
  width: '180px'
}];

export const TASK_COLUMNS = [{
  name: 'subTaskId',
  title: 'SubTask',
  width: '16%'
}, {
  name: 'containerId',
  title: 'ContainerId'
}, {
  name: 'subTaskHost',
  title: 'Sub TaskHost',
  width: '28%'
}, {
  name: 'options',
  title: '操作',
  width: '62px'
}];

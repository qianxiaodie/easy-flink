export interface IColumn {
  name: string;
  title: string;
  width?: string;
  filters?: any[];
  format?: Function;
  orderable?: boolean;
};

export const USER_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id'
}, {
  name: 'email',
  title: '用户名'
}, {
  name: 'options',
  title: '操作'
}];

export const RECORD_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '80px'
}, {
  name: 'jobId',
  title: 'JobId',
  width: '80px'
}, {
  name: 'method',
  title: '方法名称',
  width: '14%'
}, {
  name: 'methodDesc',
  title: '方法描述',
  width: '10%'
}, {
  name: 'operator',
  title: '操作人',
  width: '22%'
}, {
  name: 'product',
  title: '产品名称'
}, {
  name: 'opTime',
  title: '调用时间',
  width: '170px'
}, {
  name: 'callFrom',
  title: '来源'
}, {
  name: 'options',
  title: '操作',
  width: '80px'
}];

export const TOKEN_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '80px'
}, {
  name: 'product',
  title: '产品名',
  width: '14%'
}, {
  name: 'applier',
  title: '申请人',
  width: '260px'
}, {
  name: 'description',
  title: '申请信息',
  width: '14%'
}, {
  name: 'apikey',
  title: 'key'
}, {
  name: 'options',
  title: '操作',
  width: '140px'
}];

export const CLUSTER_COLUMNS: IColumn[] = [{
  name: 'clusterId',
  title: '集群id',
  width: '140px'
}, {
  name: 'clusterName',
  title: '集群名称'
}, {
  name: 'clusterType',
  title: '集群类型'
}, {
  name: 'options',
  title: '操作',
  width: '240px'
}];

export const KERNEL_COLUMNS: IColumn[] = [{
  name: 'kernelId',
  title: 'id',
  width: '140px'
}, {
  name: 'kernelName',
  title: '内核名称'
}, {
  name: 'kernelType',
  title: '内核类型'
}, {
  name: 'options',
  title: '操作',
  width: '140px'
}];

export const DOCKING_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '80px'
}, {
  name: 'product',
  title: '产品名称',
  width: '25%'
}, {
  name: 'contact',
  title: '对接人'
}, {
  name: 'receiveType',
  title: '报警方式',
  format: function(val: string) {
    const arr = (val || '').split(',');
    const result: string[] = [];
    if (arr.includes('sendCorpWechat')) {
      result.push('企业微信');
    }
    // if (arr.includes('sendPOPO')) {
    //   result.push('popo');
    // }
    if (arr.includes('sendEmail')) {
      result.push('邮箱');
    }
    // if (arr.includes('sendVoice')) {
    //   result.push('电话');
    // }
    if (arr.includes('sendSMS')) {
      result.push('短信');
    }
    // if (arr.includes('sendStone')) {
    //   result.push('stone');
    // }
    return result.join(',');
  }
}, {
  name: 'options',
  title: '操作',
  width: '140px'
}];

export const YARN_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '100px'
}, {
  name: 'queueName',
  title: '队列名称'
}, {
  name: 'product',
  title: '产品名称'
}, {
  name: 'description',
  title: '队列描述'
}, {
  name: 'clusterName',
  title: '集群名称'
}, {
  name: 'options',
  title: '操作',
  width: '140px'
}];

export const IMAGE_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '80px'
}, {
  name: 'imageName',
  title: '镜像名称'
}, {
  name: 'image',
  title: '镜像地址',
  width: '28%'
}, {
  name: 'kernelName',
  title: '关联内核'
}, {
  name: 'flinkPath',
  title: 'flink内核地址'
}, {
  name: 'options',
  title: '操作',
  width: '100px'
}];

export const FLINK_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '80px'
}, {
  name: 'clusterName',
  title: '集群名称',
  width: '20%'
}, {
  name: 'kernelName',
  title: '内核名称',
  width: '20%'
}, {
  name: 'flinkConfPath',
  title: 'flinkConf路径'
}, {
  name: 'options',
  title: '操作',
  width: '100px'
}];

export const ALARM_COLUMNS: IColumn[] = [{
  name: 'id',
  title: 'id',
  width: '70px'
}, {
  name: 'product',
  title: '产品名',
  filters: [],
  width: '100px'
}, {
  name: 'jobName',
  title: '任务名',
  width: '120px'
}, {
  name: 'type',
  title: '报警类型',
  filters: [],
  width: '120px'
}, {
  name: 'content',
  title: '报警内容'
}, {
  name: 'alarmUsers',
  title: '接收人',
  width: '260px'
}, {
  name: 'alarmTime',
  title: '报警时间',
  width: '165px'
}];

export const KAFKA_COLUMNS = [{
  name: 'id',
  title: 'id',
  width: '80px'
}, {
  name: 'bootstrapName',
  title: 'Kafka 集群名称',
  width: '25%'
}, {
  name: 'bootstrapServers',
  title: 'Kafka 集群地址'
}, {
  name: 'options',
  title: '操作',
  width: '120px'
}];

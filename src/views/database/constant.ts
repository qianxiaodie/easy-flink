export const datasourceColumns: any[] = [{
  name: 'id',
  title: 'id',
  width: '6%'
}, {
  name: 'name',
  title: '名称'
}, {
  name: 'dsType',
  title: '类型',
  width: '7%'
}, {
  name: 'displayTag',
  title: '类别',
  width: '7%'
}, {
  name: 'creator',
  title: '创建人',
  width: '12%'
}, {
  name: 'lastModify',
  title: '修改人',
  width: '12%'
}, {
  name: 'createTime',
  title: '创建时间',
  width: '14%'
}, {
  name: 'updateTime',
  title: '修改时间',
  width: '14%'
}, {
  name: 'options',
  title: '操作',
  width: '96px'
}];

export const datasourceModalData: any = {
  name: '',
  dsType: '',
  tag: '',
  envId: '',
  readAuth: {
    roles: [],
    users: []
  },
  writeAuth: {
    roles: [],
    users: []
  },
  editAuth: {
    roles: [],
    users: []
  },
  info: []
};

export const tableColumns: any[] = [{
  name: 'table',
  title: '表名称'
}, {
  name: 'type',
  title: '类型',
  width: '12.5%'
}, {
  name: 'catalog',
  title: '数据源',
  width: '15%'
}, {
  name: 'createTime',
  title: '创建时间',
  width: '12%'
}, {
  name: 'updateTime',
  title: '修改时间',
  width: '12%'
}, {
  name: 'creator',
  title: '创建人',
  width: '10%'
}, {
  name: 'modifier',
  title: '修改人',
  width: '10%'
}, {
  name: 'options',
  title: '操作',
  width: '140px'
}];

export const metadataModalData: any = {
  db: '',
  table: '',
  comments: '',
  type: '',
  catalog: '',
  formatType: '',
  topic: '',
  delimiter: '',
  fields: [],
  metadata: []
};

export const fieldColumns: any[] = [{
  name: 'name',
  title: '列',
  width: '35%'
}, {
  name: 'type',
  title: '类型',
  width: '25%'
}, {
  name: 'comments',
  title: '描述',
  width: '40%'
}];

export const configColumns: any[] = [{
  name: 'key',
  title: '键',
  width: '35%'
}, {
  name: 'value',
  title: '值',
  width: '65%'
}];

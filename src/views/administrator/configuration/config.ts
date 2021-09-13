import { IColumn, TOKEN_COLUMNS, CLUSTER_COLUMNS, KERNEL_COLUMNS, DOCKING_COLUMNS, YARN_COLUMNS, IMAGE_COLUMNS, FLINK_COLUMNS, KAFKA_COLUMNS } from '../constant';
import { MODAL_TYPE } from '../../components/modal/constant';

interface IApiOption {
  api: string;
  title: string;
  visible: boolean;
}

interface IAdminConfig {
  [propName: string]: IConfig;
};

export interface IConfig {
  name: string;
  columns: IColumn[];
  create: IApiOption;
  edit: IApiOption;
  list: IApiOption;
  remove: IApiOption;
  view: IApiOption;
  submit?: IApiOption;
  modalType: number;
  modalData: any;
}

export interface IToken {
  id: number;
  product: string;
  applier: string;
  description: string;
  apikey: string;
  secret: string;
};

export const config: IAdminConfig = {
  token: {
    name: 'Token',
    columns: TOKEN_COLUMNS,
    modalType: MODAL_TYPE.token,
    create: {
      api: 'createToken',
      title: '添加',
      visible: true
    },
    edit: {
      api: '',
      title: '编辑',
      visible: false
    },
    list: {
      api: 'getTokenList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeToken',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: true
    },
    modalData: {
      product: '',
      applier: '',
      description: '',
      secret: ''
    }
  },
  cluster: {
    name: '集群',
    columns: CLUSTER_COLUMNS,
    modalType: MODAL_TYPE.cluster,
    create: {
      api: 'createCluster',
      title: '添加',
      visible: true
    },
    edit: {
      api: 'updateCluster',
      title: '编辑',
      visible: true
    },
    list: {
      api: 'getAdminClusterList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeCluster',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    },
    submit: {
      api: '',
      title: '任务提交用户',
      visible: true
    },
    modalData: {
      clusterName: '',
      clusterType: 'YARN',
      flinkConfPath: '',
      clusterConfPath: '',
      checkpointPath: '',
      clusterUrlPref: '',
      clusterUrlPrefWithDomain: '',
      yarnName: '',
      clusterTags: 'SLOTH',
      taskSubmitter: 'sloth',
      defaultQueue: 'root.sloth',
      publicCluster: true,
      productList: [],
      costing: false,
      esPath: '',
      kerberosOn: false,
      principal: '',
      keytab: '',
      esLogLevel: {
        'info': ['log'],
        'error': ['log.error']
      }
    }
  },
  kernel: {
    name: '内核',
    columns: KERNEL_COLUMNS,
    modalType: MODAL_TYPE.kernel,
    modalData: {
      kernelName: '',
      kernelType: '',
      jarPath: '',
      implName: '',
      shell: true,
      shellPath: '',
      flinkPath: '',
      launchParameters: '',
      extendParameters: '',
      taskType: 'ALL'
    },
    create: {
      api: 'createKernel',
      title: '添加',
      visible: true
    },
    edit: {
      api: 'updateKernel',
      title: '编辑',
      visible: true
    },
    list: {
      api: 'getAdminKernelList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeKernel',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    }
  },
  docking: {
    name: '产品对接人',
    columns: DOCKING_COLUMNS,
    modalType: MODAL_TYPE.docking,
    modalData: {
      product: '',
      contact: []
    },
    create: {
      api: 'createDocking',
      title: '添加',
      visible: true
    },
    edit: {
      api: 'updateDocking',
      title: '编辑',
      visible: true
    },
    list: {
      api: 'getDockingList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeDocking',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    }
  },
  yarn: {
    name: '队列',
    columns: YARN_COLUMNS,
    modalType: MODAL_TYPE.yarn,
    modalData: {
      queueName: '',
      product: '',
      description: '',
      clusterId: ''
    },
    create: {
      api: 'createYarn',
      title: '添加',
      visible: true
    },
    edit: {
      api: '',
      title: '编辑',
      visible: false
    },
    list: {
      api: 'getAdminYarnList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeYarn',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    }
  },
  image: {
    name: '镜像',
    columns: IMAGE_COLUMNS,
    modalType: MODAL_TYPE.image,
    modalData: {
      imageName: '',
      image: '',
      kernelId: '',
      flinkPath: ''
    },
    create: {
      api: 'createImage',
      title: '添加',
      visible: true
    },
    edit: {
      api: '',
      title: '编辑',
      visible: false
    },
    list: {
      api: 'getAdminImageList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeImage',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    }
  },
  flink: {
    name: 'Flink Conf',
    columns: FLINK_COLUMNS,
    modalType: MODAL_TYPE.flink,
    modalData: {
      cluterId: '',
      clusterType: 'YARN',
      kernelId: '',
      imageId: '',
      flinkConfPath: ''
    },
    create: {
      api: 'createFlinkConf',
      title: '添加',
      visible: true
    },
    edit: {
      api: '',
      title: '编辑',
      visible: false
    },
    list: {
      api: 'getFlinkConfList',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeFlinkConf',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    }
  },
  kafka: {
    name: 'Kafka 集群管理',
    columns: KAFKA_COLUMNS,
    modalType: MODAL_TYPE.kafka,
    modalData: {
      bootstrapServers: '',
      bootstrapName: ''
    },
    create: {
      api: 'createKafkaMetaInfo',
      title: '添加',
      visible: true
    },
    edit: {
      api: 'updateKafkaMetaInfo',
      title: '编辑',
      visible: true
    },
    list: {
      api: 'getKafkaMetaInfos',
      title: '刷新',
      visible: false
    },
    remove: {
      api: 'removeKafkaMetaInfo',
      title: '删除',
      visible: true
    },
    view: {
      api: '',
      title: '查看',
      visible: false
    }
  }
};

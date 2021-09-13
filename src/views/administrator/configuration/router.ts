const Config = () => import('./index.vue');
const ConfigToken = () => import('./token.vue');
const ConfigCluster = () => import('./cluster.vue');
const ConfigKernel = () => import('./kernel.vue');
const ConfigDoking = () => import('./docking.vue');
const ConfigYarn = () => import('./yarn.vue');
const ConfigImage = () => import('./image.vue');
const ConfigFlink = () => import('./flink.vue');
const ConfigKafka = () => import('./kafka.vue');

export default [{
  path: 'config',
  component: Config,
  children: [{
    path: '',
    redirect: {
      name: 'ConfigToken'
    }
  }, {
    path: 'token',
    name: 'ConfigToken',
    component: ConfigToken
  }, {
    path: 'cluster',
    name: 'ConfigCluster',
    component: ConfigCluster
  }, {
    path: 'kernel',
    name: 'ConfigKernel',
    component: ConfigKernel
  }, {
    path: 'doking',
    name: 'ConfigDoking',
    component: ConfigDoking
  }, {
    path: 'yarn',
    name: 'ConfigYarn',
    component: ConfigYarn
  }, {
    path: 'image',
    name: 'ConfigImage',
    component: ConfigImage
  }, {
    path: 'flink',
    name: 'ConfigFlink',
    component: ConfigFlink
  }, {
    path: 'kafka',
    name: 'ConfigKafka',
    component: ConfigKafka
  }]
}];

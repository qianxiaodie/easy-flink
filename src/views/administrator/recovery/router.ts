const Recovery = () => import('./index.vue');
const RecoveryJob = () => import('./job.vue');

export default [{
  path: 'recovery',
  component: Recovery,
  children: [{
    path: '',
    redirect: {
      name: 'RecoveryJob'
    }
  }, {
    path: 'job',
    name: 'RecoveryJob',
    component: RecoveryJob
  }]
}];

const Statistics = () => import('./index.vue');
const StatisticsJob = () => import('./job.vue');
const StatisticsTaskCount = () => import('./task-count.vue');
const StatisticsResource = () => import('./resource.vue');

export default [{
  path: 'statistics',
  component: Statistics,
  children: [{
    path: '',
    redirect: {
      name: 'StatisticsJob'
    }
  }, {
    path: 'job',
    name: 'StatisticsJob',
    component: StatisticsJob
  }, {
    path: 'taskcount',
    name: 'StatisticsTaskCount',
    component: StatisticsTaskCount
  }, {
    path: 'resource',
    name: 'StatisticsResource',
    component: StatisticsResource
  }]
}];

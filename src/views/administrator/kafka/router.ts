const Kafka = () => import('./index.vue');
const KafkaMetric = () => import('./metric.vue');

export default [{
  path: 'kafka',
  component: Kafka,
  children: [{
    path: '',
    redirect: {
      name: 'KafkaMetric'
    }
  }, {
    path: 'metric',
    name: 'KafkaMetric',
    component: KafkaMetric
  }]
}];

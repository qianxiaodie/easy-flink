const Audit = () => import('./index.vue');
const AuditRecoed = () => import('./record.vue');
const AuditAlarm = () => import('./alarm.vue');

export default [{
  path: 'audit',
  component: Audit,
  children: [{
    path: '',
    redirect: {
      name: 'AuditRecoed'
    }
  }, {
    path: 'record',
    name: 'AuditRecoed',
    component: AuditRecoed
  }, {
    path: 'alarm',
    name: 'AuditAlarm',
    component: AuditAlarm
  }]
}];

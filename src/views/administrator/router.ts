import AuditRouter from './audit/router';
import AuthRouter from './authentication/router';
import ConfigRouter from './configuration/router';
import RecoveryRouter from './recovery/router';
import StatisticsRouter from './statistics/router';
import KafkaRouter from './kafka/router';
const Admin = () => import('./index.vue');

const AdminRouter = [{
  path: '',
  redirect: 'auth'
}, ...AuditRouter, ...AuthRouter, ...ConfigRouter, ...RecoveryRouter, ...StatisticsRouter, ...KafkaRouter];

export default [{
  path: 'admin',
  component: Admin,
  children: AdminRouter
}];

import Database from './home.vue';
import DatabaseMetadata from './metadata.vue';
import DatabaseDatasource from './data-source.vue';
import DatabaseTableDetail from './table-detail.vue';

export default [{
  path: 'database',
  component: Database,
  children: [{
    path: '',
    redirect: {
      name: 'DatabaseMetadata'
    }
  }, {
    path: 'metadata',
    name: 'DatabaseMetadata',
    component: DatabaseMetadata
  }, {
    path: 'datasource',
    name: 'DatabaseDatasource',
    component: DatabaseDatasource
  }, {
    path: 'metadata/tabledetail',
    name: 'DatabaseTableDetail',
    component: DatabaseTableDetail
  }]
}];

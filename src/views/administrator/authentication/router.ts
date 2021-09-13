const Auth = () => import('./index.vue');
const UserList = () => import('./user-list.vue');

export default [{
  path: 'auth',
  component: Auth,
  children: [{
    path: '',
    redirect: {
      name: 'UserList'
    }
  }, {
    path: 'userlist',
    name: 'UserList',
    component: UserList
  }]
}];

import Vue from 'vue';
import Router from 'vue-router';


const Home = () => import('./views/home/index.vue');
const Develop = () => import('./views/develop/index.vue');
const Listinfo = () => import('./views/develop/components/content')
const Database = () => import('./views/develop/components/Database/index.vue')
const Newbuilt = () => import('./views/develop/components/newbuilt/index.vue')
const Config = () => import('./views/develop/components/newbuilt/edit.vue')
// const Login = () => import('./views/login/index.vue');


const HomeRouter = [
  {
    path: '',
    redirect: 'develop'
  },
  {
    path: 'develop',
    name: 'Develop',
    component: Develop,
    children: [
      {
        path: '',
        redirect: 'database'
      },
      {
        path: 'listinfo',
        name: 'listinfo',
        component: Listinfo,
      }, {
        path: 'database',
        name: 'database',
        component: Database,
      }, {
        path: 'configbuilt',
        name: 'newbuilt',
        component: Newbuilt,
      }, {
        path: 'config',
        name: 'config',
        component: Config,
      }
    ]
  }];


let routes = [{
  path: '/',
  redirect: 'sloth'
}, {
  path: 'sloth',
  component: Home,
  children: HomeRouter
},
  // {
  //   path: '/login',
  //   name: 'login',
  //   component: Login
  // }
];

routes = routes.map(route => ({
  ...route,
  path: `/${route.path}`
}));

const router = new Router({
  routes
});

Vue.use(Router);

/*const originalPush = Router.prototype.push
Router.prototype.push = function push(location) {
  return originalPush.call(this, location).catch(err => err)
}*/

router.beforeEach((to, from, next) => {
  to.meta.title && (document.title = to.meta.title);
  next();
});

export default router;

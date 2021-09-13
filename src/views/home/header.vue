<template>
  <div class="m-home-header g-flex-jsb">
		<div class="g-flex">
			<div class="logo g-flex-ac">
        <img src="../../assets/images/logo.svg" />
        <div class="logo-desc">Fast Data</div>
      </div>
      <div class="tabs">
        <span>实时数仓</span>
        <span>实时计算</span>
        <span>数据探索</span>
        <span>数据血缘</span>
      </div>
		</div>
	</div>
</template>

<script lang="ts">
import { Component, Vue, Inject, Prop } from 'vue-property-decorator';
// import { State, Mutation } from 'vuex-class';
// import { MODULE_NAMESPACE } from '@utils/constant';
// import MApp from '../../App.vue';
// import ModalMixin from '../components/modal/mixin';
// import { MODAL_TYPE } from '../components/modal/constant';
// import { cloneDeep } from 'lodash';
// import { IProduct } from '@utils/types';

// interface Nav {
// 	path: string;
// 	title: string;
// }

// const NAV_LIST: Nav[] = [
// //   {
// //   path: '/sloth/overview',
// //   title: '总览'
// // },
//   {
//     path: '/sloth/develop',
//     title: '开发'
//   }
//    ];

// const USER_ITEMS: any[] = [{
//   key: 'product',
//   title: '用户视角'
// }, {
//   key: 'admin',
//   title: '管理员视角'
// }, {
//   key: 'logout',
//   title: '退出'
// }];

@Component
export default class HomeHeader extends Vue {
//   @Inject('app')
//   private app!: MApp;

  @Prop({
    default: false
  })
  private isEmpty!: boolean;

//   private navList: Nav[] = NAV_LIST;
//   private projectModalInstance: ModalMixin | null = null;
//   private isAdmin: boolean = false;

//   @State('product', MODULE_NAMESPACE.global)
//   private product!: string;

//   @State('productList', MODULE_NAMESPACE.global)
//   private productList!: IProduct[];

//   @State('userName', MODULE_NAMESPACE.global)
//   private userName!: string;

//   @State('userId', MODULE_NAMESPACE.global)
//   private userId!: string;

//   private get products() {
//     const list = cloneDeep(this.productList);
//     return list.map(l => ({
//       key: l.product,
//       title: l.product
//     }));
//   }

//   private get userItems(): any[] {
//     return this.isAdmin ? USER_ITEMS : [{
//       key: 'logout',
//       title: '退出'
//     }];
//   }

//   @Mutation('SET_PRODUCT', MODULE_NAMESPACE.global)
//   private setProduct: any;

//   @Mutation('LOG_OUT', MODULE_NAMESPACE.global)
//   private logout: any;

//   @Mutation('SET_KEEPALIVELIST', MODULE_NAMESPACE.global)
//   private setKeepAliveList!: any;

//   @Mutation('SET_DATABASEKEEPALIVELIST', MODULE_NAMESPACE.global)
//   private setDatabaseKeepAliveList!: any;

//   private async created() {
//     try {
//       const result = await this.$request('judgeUserIdentify');
//       this.isAdmin = result.isAdmin || false;
//     } catch (e) {
//       this.isAdmin = false;
//     }
//   }

//   public beforeDestroy() {
//     this.projectModalInstance && this.projectModalInstance.hide();
//     this.projectModalInstance = null;
//   }

//   private switchProject(item: any) {
//     const key = typeof item === 'string' ? item : item.key || '';
//     if (!key || key === this.product) {
//       return;
//     }
//     const product = this.productList.find(p => p.product === key);
//     if (product) {
//       this.setProduct(product);
//       this.setKeepAliveList([]);
//       this.setDatabaseKeepAliveList([]);
//       // 项目切换时，清空缓存的任务列表
//       localStorage.removeItem('sloth_tabs');
//       localStorage.removeItem('sloth_activetab');
//     }
//     if (this.$route.name === 'Overview') {
//       this.app && this.app.reload();
//     } else {
//       this.$router.replace({
//         name: 'Overview'
//       });
//     }
//   }

//   private execute(item: any) {
//     if (item.key === 'logout') {
//       this.confirmLogout();
//     }
//     if (item.key === 'admin') {
//       this.switchToAdmin();
//     }
//     if (item.key === 'product') {
//       this.switchToProduct();
//     }
//   }

//   private async confirmLogout() {
//     try {
//       const url = await this.$request('logout');
//       this.logout();
//       if (url) {
//         window.location.href = url;
//       } else {
//         this.$router.push({ name: 'login' });
//       }
//     } catch (e) {
//       this.$handleException(e, '退出失败');
//     }
//   }

//   private switchToAdmin() {
//     if (this.$route.path.startsWith('/sloth/admin')) {
//       return;
//     }
//     this.$router.push({
//       name: 'UserList'
//     });
//   }

//   private switchToProduct() {
//     if (this.$route.path.startsWith('/sloth/admin')) {
//       this.$router.push({
//         name: 'Overview'
//       });
//     }
//   }

//   private tapToManual() {
//     window.open('#/manual', '_blank');
//   }

//   private showMoreProject() {
//     if (!this.projectModalInstance) {
//       this.projectModalInstance = this.$createModalInstance(MODAL_TYPE.project);
//     }
//     this.projectModalInstance && this.projectModalInstance.show({
//       product: '',
//       productList: this.products
//     }, (args: any) => {
//       this.switchProject(args.product);
//       return true;
//     });
//   }
}
</script>

<style lang="scss">
.m-home-header {
  .router-link-active {
    text-decoration: none;
  }
  min-width: 1360px;
  flex: 0 0 52px;
  position: relative;
  height: 52px;
  padding: 0 32px;
  box-sizing: border-box;
	background-color: #3B68B7;
	.logo {
		width: 240px;
		height: 52px;
    &-desc {
      font-size: 20px;
      color: #fff;
      font-weight: 600;
      margin-left: 16px;
      cursor: default;
    }
  }
  .tabs{
    font-size: 16px;
    color: #fff;
    line-height: 52px;
    span{
      margin: 0 10px;
    }
  }
  .nav {
    line-height: 52px;
  }
  .user {
    line-height: 52px;
    color: rgba(255, 255, 255, .75);
    user-select: none;
    .item {
      text-align: left !important;
      &:hover {
        color: #fff;
      }
    }
  }
  .item {
    text-align: center;
    height: 100%;
    font-size: 14px;
    cursor: pointer;
    position: relative;
    margin: 0 20px;
    &:after {
      position: absolute;
      content: '';
      width: 0;
      height: 3px;
      border-radius: 1px;
      background: #fff;
      left: 50%;
      transform: translateX(-50%);
      transition: width .3s;
      bottom: -1px;
    }
    a {
      position: relative;
      display: block;
      height: 100%;
      color: rgba(255, 255, 255, .75);
    }
    &.active,
    &:hover {
      a {
        color: #fff;
      }
      &:after {
        width: 100%;
      }
    }
  }
}
</style>

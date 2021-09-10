<template>
  <div id="app">
    <a-locale-provider :locale="locale">
      <router-view v-if="isRouterAlive" />
    </a-locale-provider>
  </div>
</template>
<script lang="ts">
// import fr_FR from 'ant-design-vue/lib/locale-provider/fr_FR';
import moment from 'moment';
import 'moment/locale/fr';
import { Component, Vue, Provide } from 'vue-property-decorator';
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN';

// import Axios from 'axios';
//测试注释
moment.locale('fr');

@Component
export default class MApp extends Vue {
  @Provide()
  private app = this

  // @Action('getUserConfig', MODULE_NAMESPACE.global)
  // private getUserConfig: any

  // @Action('getOpCodes', MODULE_NAMESPACE.global)
  // private getOpCodes: any

  private isRouterAlive: boolean = false

  private userRole: any = []
  // private opCodesFlage: boolean = true
  private locale: string = zhCN
  private async created() {
    // 获取 文档head对象
    let head = document.getElementsByTagName('head')[0];
    // 构建 <script>
    let script = document.createElement('script');
    // 设置src属性
    script.async = false;
    script.src = "/HTAI/v2/sloth/static/config.js";
    // 加入到head对象中
    head.appendChild(script);
  }
  private async mounted() {
    try {
    } catch (e) {
      this.$handleException(e);
    } finally {
      this.isRouterAlive = true;
    }
    console.log('APP文件加载', this.isRouterAlive, localStorage.getItem('userInfo'));
  }

  public reload() {
    this.isRouterAlive = false;
    this.$nextTick(() => {
      this.isRouterAlive = true;
    });
  }
}
</script>

<style lang="scss">
@import './scss/index.scss';
#app {
  width: 100%;
  height: 100%;
}
</style>

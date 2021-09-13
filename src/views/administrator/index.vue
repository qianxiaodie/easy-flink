
<template>
  <div class="m-administrator" v-if="isInit">
    <div class="m-administrator-left">
      <div class="nav" v-for="(nav, index) in navs" :key="index">
        <div class="nav-folder" @click="toggleNav(nav)">
          <div>{{nav.title}}</div>
          <i class="ndc-icon-pull-down" :class="{'expand': nav.expand}"></i>
        </div>
        <collapse>
          <div class="nav-children" v-show="nav.expand">
            <div class="nav-item" :class="{'active': $route.path === child.path}" v-for="(child, idx) in nav.children" :key="idx">
              <router-link :title="child.title" :to="{path: child.path}">
                {{child.title}}
              </router-link>
            </div>
          </div>
        </collapse>
      </div>
    </div>
    <div class="m-administrator-right">
      <router-view />
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import collapse from '@components/collapse-transition';

interface NAVTYPE {
  title: string;
  key?: string;
  path?: string;
  children?: NAVTYPE[];
  expand?: boolean;
}

const NAV_ITEMS: NAVTYPE[] = [{
  title: '鉴权',
  key: 'auth',
  expand: true,
  children: [{
    title: '用户列表',
    path: '/sloth/admin/auth/userlist'
  }]
}, {
  title: '统计',
  key: 'statistics',
  expand: false,
  children: [{
    title: '任务数统计',
    path: '/sloth/admin/statistics/taskcount'
  }, {
    title: '任务统计',
    path: '/sloth/admin/statistics/job'
  }, {
    title: '任务资源统计',
    path: '/sloth/admin/statistics/resource'
  }]
}, {
  title: '恢复预案',
  key: 'recovery',
  expand: false,
  children: [{
    title: '任务管理',
    path: '/sloth/admin/recovery/job'
  }]
}, {
  title: '配置',
  key: 'config',
  expand: false,
  children: [{
    title: 'openapi token',
    path: '/sloth/admin/config/token'
  }, {
    title: '集群配置',
    path: '/sloth/admin/config/cluster'
  }, {
    title: '内核配置',
    path: '/sloth/admin/config/kernel'
  }, {
    title: '产品对接人',
    path: '/sloth/admin/config/doking'
  }, {
    title: 'yarn队列',
    path: '/sloth/admin/config/yarn'
  }, {
    title: '镜像配置',
    path: '/sloth/admin/config/image'
  }, {
    title: 'Flink Conf 配置',
    path: '/sloth/admin/config/flink'
  }, {
    title: 'Kafka 集群配置',
    path: '/sloth/admin/config/kafka'
  }]
}, {
  title: '操作审计',
  key: 'audit',
  expand: false,
  children: [{
    title: '操作记录',
    path: '/sloth/admin/audit/record'
  }, {
    title: '报警记录',
    path: '/sloth/admin/audit/alarm'
  }]
}, {
  title: 'Kafka监控',
  key: 'kafka',
  expand: false,
  children: [{
    title: '指标监控',
    path: '/sloth/admin/kafka/metric'
  }]
}];

@Component({
  components: {
    collapse
  }
})
export default class MAdministrator extends Vue {
  private navs: NAVTYPE[] = NAV_ITEMS;
  private isInit: boolean = false;

  private async created() {
    try {
      const items = NAV_ITEMS;
      const result = await this.$request('judgeUserIdentify');
      if (!result.isAdmin) {
        this.$router.replace({
          path: '/sloth'
        });
        return;
      }
      this.navs = items.map(nav => {
        nav.expand = this.$route.path.includes(`/sloth/admin/${nav.key}/`);
        return nav;
      });
      this.isInit = true;
    } catch (e) {
      this.$router.replace({
        path: '/sloth'
      });
    }
  }

  private toggleNav(item: NAVTYPE) {
    item.expand = !item.expand;
  }
}
</script>

<style lang="scss">
.m-administrator {
  width: 100%;
  height: 100%;
  display: flex;
  &-left {
    width: 200px;
    height: 100%;
    border-right: $border;
    .nav-folder {
      padding: 10px 10px 10px 28px;
      cursor: pointer;
      user-select: none;
      display: flex;
      align-items: center;
      justify-content: space-between;
      .ndc-icon-pull-down {
        cursor: pointer;
        display: block;
        transform: rotate(0deg);
        transition: transform .2s linear;
        &.expand {
          transform: rotate(180deg);
        }
        &:before {
          color: #7a85a0;
        }
      }
    }
    .nav-item {
      user-select: none;
      width: 100%;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      padding: 10px 0 10px 28px;
      &:before {
        position: absolute;
        content: '';
        height: 0;
        width: 3px;
        border-radius: 1px;
        background: #3B68B7;
        top: 50%;
        transform: translateY(-50%);
        transition: height .3s;
        left: -1px;
      }
      a {
        position: relative;
        display: block;
        height: 100%;
        color: #666;
        padding-left: 20px;
        text-decoration: none;
      }
      &.active,
      &:hover {
        background: #f5f7fa;
        a {
          color: #3B68B7;
        }
        &:before {
          height: 100%;
        }
      }
    }
  }
  &-right {
    width: 0;
    flex: 1;
    height: 100%;
    overflow: auto;
  }
}
</style>

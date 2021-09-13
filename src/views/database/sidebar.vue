<template>
  <div class="m-database-sidebar">
    <div class="list">
      <div class="item" :class="{'active': $route.path === item.path || $route.path.startsWith(item.path)}" v-for="(item, idx) in navList" :key="idx">
        <router-link :title="item.title" :to="{path: item.path}">
          {{item.title}}
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

interface INav {
  path: string;
  title: string;
}

@Component
export default class MDatabaseSidebar extends Vue {
  private navList: INav[] = [{
    path: '/sloth/database/metadata',
    title: '元数据管理'
  }, {
    path: '/sloth/database/datasource',
    title: '数据源登记'
  }];
}
</script>

<style lang="scss">
.m-database-sidebar {
  .list {
    padding-top: 10px;
    .item {
      user-select: none;
      width: 100%;
      font-size: 14px;
      cursor: pointer;
      position: relative;
      padding: 10px 0;
      a {
        position: relative;
        display: block;
        height: 100%;
        color: #666;
        padding-left: 20px;
        text-decoration: none;
      }
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
      &:hover,
      &.active {
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
}
</style>

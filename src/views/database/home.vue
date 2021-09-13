<template>
  <div class="m-database">
    <sidebar />
    <div class="m-database-content">
      <keep-alive :include="databaseKeepAliveList">
        <router-view />
      </keep-alive>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import Sidebar from './sidebar.vue';
import { State } from 'vuex-class';
import { MODULE_NAMESPACE } from '../../utils/constant';

@Component({
  components: {
    Sidebar
  }
})
export default class MDatabaseHome extends Vue {
  @State('databaseKeepAliveList', MODULE_NAMESPACE.global)
  private databaseKeepAliveList!: string[];
}
</script>

<style lang="scss">
.m-database {
  width: 100%;
  height: 100%;
  display: flex;
  &-sidebar {
    border-right: $border;
    width: 200px;
    box-sizing: border-box;
  }
  &-content {
    flex: 1;
    width: 0;
    overflow: auto;
    background: #f6f9fb;
    padding: 24px;
    box-sizing: border-box;
    .ndc-table {
      thead tr th {
        padding: 8px 0 8px 16px;
      }
      tbody tr td {
        padding: 12px 0 12px 16px;
      }
    }
  }
}
</style>

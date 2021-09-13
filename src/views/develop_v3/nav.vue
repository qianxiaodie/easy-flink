<template>
  <div class="m-nav">
    <!-- sql任务 -->
    <m-sql-nav v-show="nav === 'sql'"></m-sql-nav>
    <!-- jar任务 -->
    <m-jar-nav v-show="nav === 'jar'"></m-jar-nav>
    <!-- 任务 -->
    <!-- <m-job-nav v-show="nav==='job'"></m-job-nav> -->
    <!-- 元数据 -->
    <!-- <m-metadata-nav v-show="nav==='metadata'"></m-metadata-nav> -->
    <!-- 标签 -->
    <!-- <m-tag-nav v-show="nav==='tag'"></m-tag-nav> -->
    <!-- 文件 -->
    <m-file-nav v-show="nav === 'file'"></m-file-nav>
    <!-- 数仓表 -->
    <!-- <m-database-nav v-show="nav==='database'"></m-database-nav> -->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import MJobNav from './components/job-nav/index.vue';
import MSqlNav from './components/sql-nav/index.vue';
import MJarNav from './components/jar-nav/index.vue';
import MMetadataNav from './components/metadata-nav/index.vue';
import MTagNav from './components/tag-nav/index.vue';
import MFileNav from './components/file-nav/index.vue';
import MDatabaseNav from './components/database-nav/index.vue';
import { Action } from 'vuex-class';
import { MODULE_NAMESPACE } from '@/utils/constant';
@Component({
  components: {
    MJobNav,
    MSqlNav,
    MJarNav,
    MMetadataNav,
    MTagNav,
    MFileNav,
    MDatabaseNav
  }
})
export default class MNav extends Vue {
  @Prop()
  nav!: string

  @Watch('nav')
  private onNavChanged(val: string) {
    console.log('navel===>.', val);

    if (val === 'metadata') {
      return this.getMetadataList();
    }
    if (val === 'sql') {
      return this.getJobList();
    }
    if (val === 'jar') {
      return this.getJobList({ jobType: 'JAR' });
    }
    if (val === 'tag') {
      return this.getTagList();
    }
    if (val === 'file') {
      return this.getResourceList();
    }
    if (val === 'database') {
      return this.getMetadataTableList();
    }
  }
  created() {
    this.getJobList();
    this.getJobList({ jobType: 'JAR' });
    this.getResourceList();
  }
  mounted() {}
  @Action('getMetadataList', MODULE_NAMESPACE.develop_v3)
  private getMetadataList!: any

  @Action('getJobList', MODULE_NAMESPACE.develop_v3)
  private getJobList!: any

  @Action('getTagList', MODULE_NAMESPACE.develop_v3)
  private getTagList!: any

  @Action('getResourceList', MODULE_NAMESPACE.develop_v3)
  private getResourceList!: any

  @Action('getMetadataTableList', MODULE_NAMESPACE.develop_v3)
  private getMetadataTableList!: any
}
</script>

<style lang="scss">
.m-nav {
  height: 100%;
  min-width: 200px;
  overflow-x: auto;
  &-tree {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    .ndc-tree-item {
      img {
        display: block;
        width: 14px;
        height: 14px;
        margin-right: 8px;
      }
    }
  }
}
</style>

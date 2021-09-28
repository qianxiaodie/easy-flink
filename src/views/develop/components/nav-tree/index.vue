<template>
  <div class="m-job-nav">
    <div class="m-job-nav-head">
      集群
      <a-select v-model="cluster" style="width: 160px" @change="handleclusterChange">
        <a-select-option
          v-for="(item,index) in hiveList"
          :key="index"
          :value="item.hiveCatalog"
        >{{item.hiveCatalog}}</a-select-option>
      </a-select>
    </div>
    <a-input-search
      v-model="keyword"
      placeholder="请输入数据库名称"
      style="width: 200px"
      @search="onSearch"
    />

    <div class="m-nav-tree">
      <a-menu v-model="database" style="width: 256px" mode="vertical">
        <a-menu-item :key="item" v-for="(item,index) in databaselist" @click="handleClick(item)">
          <!-- <a-icon type="mail" /> -->
          <a-icon type="database" />
          <!-- <a-icon class='myIcon yibiaopanIcon'> background -->
          {{item}}
        </a-menu-item>
      </a-menu>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Mixins, Inject, Watch } from "vue-property-decorator";

import { State, Mutation, Action } from "vuex-class";
import { MODULE_NAMESPACE } from "@utils/constant";
import { ICluster } from "@utils/types";

@Component({
  components: {}
})
export default class NavTree extends Vue {
  @Mutation("SET_DATBASE", MODULE_NAMESPACE.state)
  private setDatabase!: any;

  @Mutation("SET_CATALOG", MODULE_NAMESPACE.state)
  private setCatalog!: any;

  private cluster: string = "";
  private hiveList: ICluster[] = [
    {
      id: 0,
      value: "全部"
    }
  ];
  private database: Array = [];
  private selectedKeys: string = "0";
  private list: [];
  private keyword: string = " ";

  @Watch("cluster")
  private onClusterChanged(val) {
    console.log(val, "cluster");
    localStorage.setItem("cluster", val);
  }
  @Watch("database")
  private onDatabaseChanged(val) {
    console.log(val, "database3");
    // localStorage.setItem("database", val);
  }
  get databaselist() {
    const list = this.list || [];
    console.log("databaselist");
    if (this.keyword) {
      return list.filter(value => {
        //过滤数组元素
        return value.includes(this.keyword); //如果包含字符返回true
      });
    } else {
      return list;
    }
  }

  private async created() {
    await this.getHiveCatalogs();
    await this.getHiveDatabases();
    this.keyword = "";

    // this.database.push(this.list[0]);
    this.database.push(localStorage.getItem("database") || this.list[0]);
    this.setDatabase(this.database[0]);

    localStorage.setItem("database", this.database);
  }

  private mounted() {}

  private async getHiveCatalogs() {
    let result = await this.$request("getHiveCatalogs", {
      // userId: "wangtao03",
      productId: "1"
    });
    result = result.result;
    this.hiveList = result;
    this.cluster = this.hiveList[0].hiveCatalog || "";
    this.setCatalog(this.cluster);
    console.log(this.hiveList, "hiveList");
    return result;
  }

  private async getHiveDatabases() {
    let result = await this.$request("getHiveDatabases", {
      userId: "wangtao03",
      catalog: this.cluster
    });
    result = result.result;
    this.list = result;
    // console.log(result, "resdatabaselist");
    // this.database=result[0]
    return result;
  }
  private handleclusterChange(val) {
    this.setCatalog(val);
    console.log(this.cluster, val);
  }

  private onSearch(value) {
    console.log(value);
  }

  private onJobTreeRightClick(e: any) {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
  }

  private handleClick(val) {
    console.log(this.database, val, "database");
    this.setDatabase(val);
    localStorage.setItem("database", val);
  }
}
</script>

<style lang="scss" scoped>
.m-job-nav {
  width: 200px;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 28px;
  &-head {
    width: 100%;
    display: flex;
    align-items: center;
    height: 50px;
    justify-content: space-between;
  }
}
.m-nav-tree {
  overflow-y: scroll;
  overflow-x: hidden;
  height: 85%;
}
</style>

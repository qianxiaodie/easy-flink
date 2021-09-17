<template>
  <div class="card-container">
    <div class="m-content-tit">
      <a-icon type="left" @click="back()" />表名
      <span></span>
    </div>
    <Baseinfo></Baseinfo>
    <!-- <a-tabs type="card" default-active-key="1">
      <a-tab-pane key="1" tab="基本信息">
        <Baseinfo></Baseinfo>
      </a-tab-pane>
      <a-tab-pane key="2" tab="数据合并">
        <datamerge></datamerge>
      </a-tab-pane>
    </a-tabs>-->
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { Action, State } from "vuex-class";
import Baseinfo from "../baseinfo/index.vue";
import datamerge from "../datamerge/index.vue";
import { MODULE_NAMESPACE } from "@utils/constant";

@Component({
  components: {
    Baseinfo,
    datamerge
  }
})
export default class Content extends Vue {
  @State("dataBase", MODULE_NAMESPACE.state)
  private dataBase!: object;

  @Watch("dataBase")
  private onDataBaseChanged(val: any) {
    console.log(val, "content database改变");
    // this.$router.push({
    //   name:"database"
    // })
  }

  private back() {
    this.$router.back();
  }

  private callback(key) {
    console.log(key);
  }
}
</script>
<style lang="scss">
$color: #3b68b7;
$border: 1px solid #333;
.card-container {
  width: 100%;
  height: 100%;
  overflow: hidden;
  // border: $border;
  box-sizing: border-box;
  // padding: 16px 0;
  .m-content-tit {
    // padding-top: 16px;
    width: 100%;
    line-height: 40px;
    font-size: 16px;
    color: #fff;
    text-align: center;
    border: $border;
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    align-items: center;
    // border-bottom: $border;
  }
}
.card-container > .ant-tabs-card > .ant-tabs-content {
  height: 120px;
  margin-top: -16px;
  box-sizing: border-box;
}

.card-container > .ant-tabs-card > .ant-tabs-content > .ant-tabs-tabpane {
  background: #fff;
  padding: 16px;
  box-sizing: border-box;
}

.card-container > .ant-tabs-card > .ant-tabs-bar {
  border-color: #fff;
}
.ant-tabs {
  height: 100%;
}
.card-container > .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab {
  background: transparent;
  box-sizing: border-box;
  margin: 0;
  background: #f3f3f3;
  border-radius: 0;
  border-left: $border;
  border-right: $border;
  border-bottom: 3px solid #ccc;
  border-top: none;
}
.card-container .ant-tabs-nav-container .ant-tabs-nav-scroll {
  background: #f3f3f3;
  box-sizing: border-box;
  height: 40px;
  overflow: hidden;
}

.card-container .ant-tabs-nav .ant-tabs-tab:hover {
  color: $color;
}

.card-container > .ant-tabs-card > .ant-tabs-bar .ant-tabs-tab-active {
  background: #fff;
  box-sizing: border-box;
  color: $color;
  border-top: 2px solid $color;
  border-left: $border;
  border-right: $border;
  border-bottom: none;
}
</style>
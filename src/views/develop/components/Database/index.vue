<template>
  <div class="m-database">
    <div class="m-database-content-tit">
      <div></div>
      <div>库名</div>
      <a-button type="primary" @click="newbuilt">Create</a-button>
    </div>

    <div class="m-database-contain">
      <div class="m-database-tit">
        <a-input-search
          v-model="tableName"
          placeholder="请输入表名称"
          style="width: 200px"
          @search="onSearch"
        />&nbsp;
        <a-icon style="cursor:pointer;color:#ccc" @click="onSearch" type="redo" />
      </div>

      <a-table :columns="columns" :data-source="listData" bordered :pagination="false">
        <a slot="tags" slot-scope="text,tags" href="javascript:;">
          <span class="link" @click="detailEvent(text,tags)">detail</span>
          <span class="link" @click="eduit(text,tags)">edit</span>
          <span class="link" @click="delEvent(text,tags)">delete</span>
        </a>
      </a-table>

      <div style="width:100%;margin-top:16px">
        <Pagination
          :total="total"
          :page.sync="page"
          :page-size.sync="pageSize"
          :total-visible="true"
          :small="true"
          :size-visible="true"
          :jump-visible="true"
        ></Pagination>
      </div>

      <a-modal v-model="visible" title="提示" @ok="deleteTable">
        <div class="ant-modal-confirm-body">
          <a-icon type="question-circle" :style="{ fontSize: '22px', color: '#faad14' }" />
          <span class="ant-modal-confirm-title">删除表</span>
          <div class="ant-modal-confirm-content">表删除后无法恢复，确认删除吗</div>
        </div>
      </a-modal>
    </div>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Watch } from "vue-property-decorator";
import { Action, State } from "vuex-class";
import Pagination from "@components/pagination/src/pagination.vue";
import { MODULE_NAMESPACE } from "@utils/constant";
@Component({
  components: {
    Pagination
  }
})
export default class database extends Vue {
  @State("dataBase", MODULE_NAMESPACE.state)
  private dataBase!: any;

  @Watch("dataBase")
  private onDataBaseChanged(val: any) {
    console.log(val, "db database改变");
    this.refresh();
    // this.dataBase = val;
  }

  @State("catalog", MODULE_NAMESPACE.state)
  private catalog!: any;

  @Watch("catalog")
  private onCatalogChanged(val: any) {
    console.log(val, "catalog改变");
    this.refresh();
    // this.catalog = val;
  }

  private columns: object = [
    {
      dataIndex: "tableName",
      title: "表名"
    },
    {
      dataIndex: "status",
      title: "同步状态"
    },
    {
      dataIndex: "storage",
      title: "存储总量"
    },
    {
      dataIndex: "snapshotCount",
      title: "快照数量"
    },
    {
      dataIndex: "visibleTime",
      title: "最新数据可见时间点"
    },
    {
      title: "操作",
      dataIndex: "tags",
      key: "tags",
      scopedSlots: { customRender: "tags" }
    }
  ];

  private listData: object = [];

  private total: number = 10;
  private page: number = 1;
  private pageSize: number = 10;
  private visible: boolean = false;
  private detail: object = {};
  private tableName: string = "";
  private deltable: string = "";

  private delEvent(text, item) {
    this.visible = true;
    this.deltable = item.tableName;
  }

  private async deleteTable() {
    console.log(this.deltable);
    let result = await this.$request("deleteTable", {
      creator: "",
      userId: "",
      productId: "1",
      catalog: this.catalog,
      database: this.dataBase,
      // catalog: localStorage.getItem('cluster'),
      // database: localStorage.getItem("database"),
      tableName: this.deltable
    });
    console.log(result, "delete");
    this.visible = false;
    this.refresh();
    this.deltable = "";
  }

  private eduit(item, tags) {
    console.log(item, tags);
    this.$router.push({
      name: "config",
      query: {
        catalog: this.catalog,
        database: this.dataBase,
        tableName: tags.tableName
        // catalog: localStorage.getItem('cluster'),
        // database: localStorage.getItem("database"),
      }
    });
  }
  private newbuilt() {
    this.$router.push({
      name: "newbuilt",
      query: {
        catalog: this.catalog,
        database: this.dataBase
        // catalog: localStorage.getItem('cluster'),
        // database: localStorage.getItem("database"),
      }
    });
  }
  private detailEvent(text, item) {
    console.log(text, item);
    this.$router.push({
      name: "listinfo",
      query: {
        tableName: item.tableName,
        catalog: this.catalog,
        database: this.dataBase
        // catalog: localStorage.getItem('cluster'),
        // database: localStorage.getItem("database"),
      }
    });
  }
  private handleOk(e) {
    console.log(e);
    this.visible = false;
  }

  private onSearch() {
    this.refresh();
  }

  private mounted() {
    if (this.dataBase && this.catalog) {
      this.refresh();
    }
  }

  public async refresh() {
    let result = await this.$request("getTablelistInfos", {
      creator: "",
      userId: "",
      productId: "1",
      catalog: this.catalog,
      database: this.dataBase,
      // catalog: localStorage.getItem('cluster'),
      // database: localStorage.getItem("database"),
      tableName: this.tableName //筛选
    });
    result = result.result;
    this.listData = result.list;
    this.total = result.total;
    console.log(result);
  }
}
</script>
<style lang="scss" scoped>
.link {
  color: #1890ff;
  cursor: pointer;
  margin: 0 2px;
}
.m-database {
  width: 100%;
  height: 100%;
  // padding: 16px 0;
  &-tit {
    margin: 10px 0;
  }
  &-content {
    // width: 100%;
    width: 80%;
    &-tit {
      width: 100%;
      font-size: 16px;
      height: 40px;
      color: #fff;
      text-align: center;
      border-bottom: $border;
      border-right: $border;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
    }
  }
  &-contain {
    padding: 0 16px;
  }
}
</style>
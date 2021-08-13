<template>
  <div class="m-datamerge">
    <a-table :scroll="{ y: 400 }" :columns="columns" :data-source="listData" bordered :pagination="false">
      <span slot="action" slot-scope="text" class="link" @click="showModal(text)">详情</span>
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

    <a-modal v-model="visible" title="合并历史-全表级" :footer="null">
      <Detail :detailinfo="detail"></Detail>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import Pagination from "@components/pagination/src/pagination.vue";
import Detail from "./detail.vue";
@Component({
  components: {
    Pagination,
    Detail
  }
})
export default class Datamerge extends Vue {
  private columns: object = [
    {
      dataIndex: "compactRange",
      title: "范围",
      width: "80px"
    },
    {
      dataIndex: "commitTime",
      title: "提交时间",
      width: "150px"
    },
    {
      dataIndex: "visibleTime",
      title: "最新可见数据点",
      width: "150px"
    },
    {
      dataIndex: "duration",
      title: "耗时",
      width: "80px"
    },
    {
      title: "合并前文件",
      children: [
        {
          title: "数量",
          dataIndex: "totalFilesStatBeforeCompact.fileCnt",
          key: "totalFilesStatBeforeCompact",
          width: "80px"
        },
        {
          title: "平均大小",
          dataIndex: "totalFilesStatBeforeCompact.averageSize",
          key: "averageSizeBeforeCompact",
          width: "80px"
        }
      ]
    },
    {
      title: "合并后文件",
      children: [
        {
          title: "数量",
          dataIndex: "totalFilesStatAfterCompact.fileCnt",
          key: "totalFilesStatAfterCompact1",
          width: "80px"
        },
        {
          title: "平均大小",
          dataIndex: "totalFilesStatAfterCompact.averageSize",
          key: "totalFilesStatAfterCompact2",
          width: "80px"
        }
      ]
    },
    {
      dataIndex: "snapshotInfo.snapshotId",
      title: "快照id",
      width: "80px"
    },
    {
      dataIndex: "snapshotInfo.totalSize",
      title: "快照大小",
      width: "80px"
    },
    {
      title: "操作",
      width: "80px",
      scopedSlots: { customRender: "action" }
    }
  ];

  private listData: object = [
    {
      id: "1",
      companyName: "re"
    },
    {
      id: "1",
      companyName: "re"
    }
  ];

  private total: number = 10;
  private page: number = 1;
  private pageSize: number = 10;
  private visible: boolean = false;
  private detail: object = {};

  private async showModal(text) {
    this.visible = true;
    this.detail = text;
    // console.log(text);
    // const result = await this.getTableMajorCompactTaskInfo(text.traceId)
    // console.log(result,'detail')
    // this.detail = result
  }
  private async getTableMajorCompactTaskInfo(traceId) {
    let result = await this.$request("getTableMajorCompactTaskInfo", {
      creator: "",
      userId: "",
      productId: "1",
      catalog: this.$route.query.catalog,
      database: this.$route.query.database,
      tableName: this.$route.query.tableName,
      traceId:traceId,
    });
    result = result.result
    this.listData = result.list;
    this.total = result.total;
    console.log(result);
    return result
  }
  private handleOk(e) {
    console.log(e);
    this.visible = false;
  }

  private created() {
    this.refresh();
  }

  private async refresh() {
    let that = this
    let result = await this.$request("getTableMajorCompactRecordList", {
      creator: "",
      userId: "",
      productId: "1",
      catalog: "easyops-cluster",
      database: "mammut_service",
      tableName: this.$route.query.tableName,
      recordId:""
    });
    result = result.result
    this.listData = result.list;
    result.list.forEach(e => {
      e.planTime=that.$moment(e.planTime).format('YYYY-MM-DD HH:mm:ss')
      e.commitTime=that.$moment(e.commitTime).format('YYYY-MM-DD HH:mm:ss')
      e.visibleTime=that.$moment(e.visibleTime).format('YYYY-MM-DD HH:mm:ss')
    });
    this.total = result.total;
    console.log(result);
  }
}
</script>
<style lang="scss" scoped>
.m-datamerge{
  height: 80%;
  overflow-y: scroll;
}
.link {
  color: #3b68b7;
  cursor: pointer;
}
.ant-table-tbody > tr > td {
  padding: 10px 2px;
}
.m-baseinfo {
  width: 100%;
  height: 100%;
  &-tit {
    font-weight: bolder;
    cursor: pointer;
  }
  &-info {
    padding: 16px 20px;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    .baseinfo-resource {
      // padding-left: 24px;
      box-sizing: border-box;
      .label {
        width: 150px !important;
      }
    }
    .info-desc {
      display: flex;
      line-height: 28px;

      .label {
        display: block;
        color: #999;
        width: 180px;
        flex-shrink: 0;
      }
      .content {
        color: #333;
      }
    }
    .title {
      line-height: 48px;
      color: #262626;
    }
  }
}
</style>
<style >
.m-datamerge .ant-table-thead > tr > th {
  padding: 2px;
  background: #eee;
  /* color: #909399; */
}
</style>
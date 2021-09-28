<template>
  <div class="m-baseinfo">
    <!-- <div class="m-baseinfo-left"> -->
    <!-- <div class="m-baseinfo-tit" @click="changeleft">
        <a-icon v-if="changebool" type="down" />
        <a-icon v-else type="up" />Change表
    </div>-->
    <div class="m-baseinfo-info">
      <div class="m-baseinfo-info-contain">
        <div class="info-desc">
          <span class="label">最新可见数据时间点</span>
          <span class="content">{{changeDetail.visibleTime||"null"}}</span>
        </div>
        <div class="info-desc">
          <span class="label">总数据量</span>
          <span class="content">{{ changeDetail.totalFilesStat.totalSize||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">删除文件数据量</span>
          <span class="content">{{ changeDetail.snapshotInfo.removedRecords||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">插入文件数据量</span>
          <span class="content">{{ changeDetail.snapshotInfo.insertFiles||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">快照数量</span>
          <span class="content">{{ changeDetail.snapshotCnt||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">平均快照大小</span>
          <span class="content">{{ changeDetail.averageSnapshotSize||"null" }}</span>
        </div>
      </div>

      <div class="m-baseinfo-info-contain">
        <div class="info-desc">
          <span class="label">平均文件大小</span>
          <span class="content">{{ changeDetail.totalFilesStat.averageSize ||"null"}}</span>
        </div>
        <div class="info-desc">
          <span class="label">删除文件个数</span>
          <span class="content">{{ changeDetail.snapshotInfo.deleteFiles||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">插入文件个数</span>
          <span class="content">{{ changeDetail.snapshotInfo.insertFile||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">最新快照ID</span>
          <span class="content">{{ changeDetail.snapshotInfo.snapshotId ||"null"}}</span>
        </div>
      </div>

      <div class="m-baseinfo-info-contain">
        <div class="info-desc">
          <span class="label">总文件个数</span>
          <span class="content">{{ changeDetail.totalFilesStat.fileCnt||"null" }}</span>
        </div>
        <div class="info-desc">
          <span class="label">删除文件平均大小</span>
          <span class="content">{{ changeDetail.snapshotInfo.deleteFilesSize ||"null"}}</span>
        </div>
        <div class="info-desc">
          <span class="label">插入文件平均大小</span>
          <span class="content">{{ changeDetail.insertaverageSize ||"null"}}</span>
        </div>
        <div class="info-desc">
          <span class="label">最新快照大小</span>
          <span class="content">{{ changeDetail.snapshotInfo.totalSize||"null" }}</span>
        </div>
      </div>
    </div>
    <!-- </div> -->
    <!-- <div class="m-baseinfo-right">
      <div class="m-baseinfo-tit" @click="changeright">
        <a-icon v-if="basebool" type="down" />
        <a-icon v-else type="up" />Base表
      </div>
      <div v-show="basebool" class="m-baseinfo-info">
        <div class="info-desc">
          <span class="label">最新可见数据时间点</span>
          <span class="content">{{ baseTableInfo.visibleTime }}</span>
        </div>
        <div class="info-desc">
          <span class="label">总数据量</span>
          <span class="content">{{ baseTableInfo.totalFilesStat.fileCnt }}</span>
        </div>
        <div class="info-desc">
          <span class="label">总文件个数</span>
          <span class="content">{{ baseTableInfo.totalFilesStat.totalFiles }}</span>
        </div>
        <div class="info-desc">
          <span class="label">平均文件大小</span>
          <span class="content">{{ baseTableInfo.totalFilesStat.averageSize }}</span>
        </div>
        <div class="info-desc">
          <span class="label">最新快照ID</span>
          <span class="content">{{ baseTableInfo.snapshotInfo.snapshotId }}</span>
        </div>
        <div class="info-desc">
          <span class="label">最新快照大小</span>
          <span class="content">{{ baseTableInfo.snapshotInfo.totalSize}}</span>
        </div>
        <div class="info-desc">
          <span class="label">平均快照大小</span>
          <span class="content">{{ baseTableInfo.averageSnapshotSize }}</span>
        </div>
      </div>
    </div>-->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import { IChange, IBase } from "../../../../utils/type";
import { dateFormat } from "../../../develop/utils";

@Component({
  components: {}
})
export default class Baseinfo extends Vue {
  private changebool: boolean = true;
  private basebool: boolean = true;
  private changeDetail: any = {
    totalFilesStat: {},
    snapshotInfo: {},
    visibleTime: ""
  };
  private baseTableInfo = {
    totalFilesStat: {},
    snapshotInfo: {}
  };

  private changeleft() {
    this.changebool = !this.changebool;
  }
  private changeright() {
    this.basebool = !this.basebool;
  }
  private mounted() {
    this.getTableBasicInfo();
  }
  private async getTableBasicInfo() {
    let result = await this.$request("getTableBasicInfo", {
      // userId: "wangtao03",
      productId: "1",
      catalog: this.$route.query.catalog,
      database: this.$route.query.database,
      refresh: true,
      tableName: this.$route.query.tableName
    });
    result = result.result;
    this.changeDetail = result.changeTableInfo || {
      totalFilesStat: {},
      snapshotInfo: {}
    };
    this.changeDetail.visibleTime =
      this.changeDetail.visibleTime &&
      dateFormat(Number(this.changeDetail.visibleTime));
    this.baseTableInfo = result.baseTableInfo || {};
    console.log(result, this.changeDetail, this.baseTableInfo, "changeDetail");
    return result;
  }
}
</script>
<style lang="scss" scoped>
.m-baseinfo {
  width: 100%;
  height: 100%;
  display: flex;
  &-tit {
    font-weight: bolder;
    cursor: pointer;
  }
  &-left {
    width: 50%;
  }
  &-right {
    width: 50%;
  }
  &-info {
    padding: 16px 20px;
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    color: #eddb9c;
    .baseinfo-resource {
      // padding-left: 24px;
      box-sizing: border-box;
      .label {
        width: 150px !important;
      }
    }
    &-contain {
      width: 30%;
    }
    .info-desc {
      display: flex;
      line-height: 44px;
      .label {
        display: block;
        color: #eddb9c;
        width: 160px;
        flex-shrink: 0;
      }
      .content {
        color: #eddb9c;
        opacity: 0.5;
      }
    }
    .title {
      line-height: 48px;
      color: #262626;
    }
  }
}
</style>
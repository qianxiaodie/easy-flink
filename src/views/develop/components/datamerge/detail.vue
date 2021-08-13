<template>
  <div class="m-baseinfo" style="min-height:400px">
    <div class="m-baseinfo-tit" @click="basechange">
      <a-icon v-if="basebool" type="down" />
      <a-icon v-else type="up" />概况
    </div>
    <div v-show="basebool" class="m-baseinfo-info">
      <div class="info-desc">
        <span class="label">记录ID</span>
        <span class="content">{{ detailinfo.recordId }}</span>
      </div>
      <div class="info-desc">
        <span class="label">最新可见数据时间点</span>
        <span class="content">{{ detailinfo.visibleTime }}</span>
      </div>
      <div class="info-desc">
        <span class="label">提交时间</span>
        <span class="content">{{ detailinfo.commitTime }}</span>
      </div>
      <div class="info-desc">
        <span class="label">任务生成最早时间</span>
        <span class="content">{{ detailinfo.planTime }}</span>
      </div>
      <div class="info-desc">
        <span class="label">耗时</span>
        <span class="content">{{ detailinfo.duration }}</span>
      </div>
    </div>

    <div class="m-baseinfo-tit" @click="filechange">
      <a-icon v-if="filebool" type="down" />
      <a-icon v-else type="up" />文件变化
    </div>
    <div v-show="filebool" class="m-baseinfo-info">
      <div class="info-desc">
        <span class="label">合并前文件数量</span>
        <span class="content">{{ detailinfo.totalFilesStatBeforeCompact.fileCnt }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前文件平均大小</span>
        <span class="content">{{ detailinfo.totalFilesStatBeforeCompact.averageSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前insert文件数量</span>
        <span class="content">{{ detailinfo.insertFilesStatBeforeCompact.fileCnt }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前insert文件平均大小</span>
        <span class="content">{{ detailinfo.insertFilesStatBeforeCompact.averageSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前Delete文件数量</span>
        <span class="content">{{ detailinfo.deleteFilesStatBeforeCompact.fileCnt }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前Delete文件平均大小</span>
        <span class="content">{{ detailinfo.deleteFilesStatBeforeCompact.averageSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前Base文件数量</span>
        <span class="content">{{ detailinfo.baseFilesStatBeforeCompact.fileCnt }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并前Base文件平均大小</span>
        <span class="content">{{ detailinfo.baseFilesStatBeforeCompact.averageSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并后文件数量</span>
        <span class="content">{{ detailinfo.totalFilesStatAfterCompact.fileCnt }}</span>
      </div>
      <div class="info-desc">
        <span class="label">合并后文件平均大小</span>
        <span class="content">{{ detailinfo.totalFilesStatAfterCompact.averageSize }}</span>
      </div>
    </div>

    <div class="m-baseinfo-tit" @click="infochange">
      <a-icon v-if="infobool" type="down" />
      <a-icon v-else type="up" />快照信息
    </div>
    <div v-show="infobool" class="m-baseinfo-info">
      <div class="info-desc">
        <span class="label">快照ID</span>
        <span class="content">{{ detailinfo.snapshotInfo.snapshotId }}</span>
      </div>
      <div class="info-desc">
        <span class="label">快照大小</span>
        <span class="content">{{ detailinfo.snapshotInfo.totalSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">新增文件个数</span>
        <span class="content">{{ detailinfo.snapshotInfo.addedFiles }}</span>
      </div>
      <div class="info-desc">
        <span class="label">移除文件个数</span>
        <span class="content">{{ detailinfo.snapshotInfo.removedFiles }}</span>
      </div>
      <div class="info-desc">
        <span class="label">新增记录数</span>
        <span class="content">{{ detailinfo.snapshotInfo.addedRecords }}</span>
      </div>
      <div class="info-desc">
        <span class="label">移除记录数</span>
        <span class="content">{{ detailinfo.snapshotInfo.removedRecords }}</span>
      </div>
      <div class="info-desc">
        <span class="label">新增文件大小</span>
        <span class="content">{{ detailinfo.snapshotInfo.addedFilesSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">移除文件大小</span>
        <span class="content">{{ detailinfo.snapshotInfo.removedFilesSize }}</span>
      </div>
      <div class="info-desc">
        <span class="label">总记录数</span>
        <span class="content">{{ detailinfo.snapshotInfo.totalRecords }}</span>
      </div>
      <div class="info-desc">
        <span class="label">总文件个数</span>
        <span class="content">{{ detailinfo.snapshotInfo.totalFiles }}</span>
      </div>
    </div>

    <div class="m-baseinfo-tit" @click="partchange">
      <a-icon v-if="partbool" type="down" />
      <a-icon v-else type="up" />概况
    </div>
    <div v-show="partbool" class="m-baseinfo-info">
      <div class="info-desc">
        <span class="label">受影响分区个数</span>
        <span class="content">{{ detailinfo.partitionCnt }}</span>
      </div>
      <div class="info-desc">
        <span class="label">受影响分区</span>
        <textarea disabled  class="content ndc-textarea" v-model="detailinfo.partitions">
            
        </textarea>
      </div>
      <div class="info-desc" style="margin-top:10px">
        <span class="label">已合并文件序列号</span>
         <textarea disabled  class="content ndc-textarea" v-model="detailinfo.baseTableMaxFileSequence">
            
        </textarea>
      </div>
     
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Prop } from "vue-property-decorator";
@Component({
  components: {}
})
export default class Detail extends Vue {
  private basebool: boolean = true;
  private filebool: boolean = true;
  private partbool: boolean = true;
  private infobool: boolean = true;
  private changeDetail: object = {
    time: "2021-06-17 20:38:32"
  };

  @Prop({
    default: {}
  })
  private detailinfo!: object;

  private created(){
    console.log(this.detailinfo,'detailinfo')
  }

  private basechange() {
    this.basebool = !this.basebool;
  }
  private filechange() {
    this.filebool = !this.filebool;
  }
  private infochange() {
    this.infobool = !this.infobool;
  }
  private partchange() {
    this.partbool = !this.partbool;
  }
}
</script>
<style lang="scss" scoped>

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
        width: 180px !important;
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
  .ndc-textarea {
	width: 200px;
	height: 120px;
	box-sizing: border-box;
	width: 100%;
	height: 100%;
	padding: 5px 10px;
	border: 1px solid #d8e1f0;
	border-radius: 4px;
	font-size: 14px;
	line-height: 22px;
	color: #666;
	transition: border-color 0.2s;
	resize: none;

	&:hover {
        pointer-events: none;
        cursor: not-allowed;
	}
}
}

</style>
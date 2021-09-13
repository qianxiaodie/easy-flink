<template>
  <div class="m-job-info">
    <div class="m-job-sql" v-if="jobDetail.jobType === 'SQL'">
      <div class="info-header">
        <div class="g-flex-ac">
          <span class="label">集群</span>
          <span class="content">{{getClusterName(jobDetail.clusterId)}}</span>
        </div>
        <div class="g-split-line small"></div>
        <div class="g-flex-ac">
          <span class="label">内核版本</span>
          <span class="content">{{getKernelName()}}</span>
        </div>
        <!-- <div class="g-split-line small"></div> -->
        <!-- <div class="g-flex-ac">
          <span class="label">队列</span>
          <span class="content">{{getQueueName()}}</span>
        </div> -->
        <div class="g-split-line small"></div>
        <div class="g-flex-ac" style="flex: 1;width:0;margin-right:24px">
          <span class="label">依赖文件</span>
          <span class="content f-eps" style="flex: 1" :title="getDependentFiles(jobDetail.fileList)">{{getDependentFiles(jobDetail.fileList)||'无'}}</span>
        </div>
      </div>
      <div class="info-body">
        <m-sql-editor
          ref="editor"
          :value="jobDetail.rawSql"
          :options="{
            readOnly: true
          }"
        ></m-sql-editor>
      </div>
    </div>
    <div class="m-job-jar" v-else>
      <div class="info-desc">
        <span class="label">JAR任务包</span>
        <span class="content">{{jobDetail.flinkJarName}}</span>
      </div>
      <div class="info-desc">
        <span class="label">main.class</span>
        <span class="content">{{jobDetail.mainClass}}</span>
      </div>
      <div class="info-desc">
        <span class="label">main.args</span>
        <span class="content">{{jobDetail.mainArgs}}</span>
      </div>
      <div class="info-desc">
        <span class="label">上传人</span>
        <span class="content">{{jobDetail.uploader}}</span>
      </div>
      <div class="info-desc">
        <span class="label">上传时间</span>
        <span class="content">{{jobDetail.uploadTime}}</span>
      </div>
      <div class="info-desc">
        <span class="label">集群</span>
        <span class="content">{{getClusterName(jobDetail.clusterId)}}</span>
      </div>
      <div class="info-desc">
        <span class="label">内核版本</span>
        <span class="content">{{getKernelName()}}</span>
      </div>
      <!-- <div class="info-desc">
        <span class="label">队列</span>
        <span class="content">{{getQueueName()}}</span>
      </div> -->
      <div class="info-desc">
        <span class="label">依赖文件</span>
        <span class="content">{{getDependentFiles(jobDetail.fileList)||'无'}}</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import MSqlEditor from '../../../develop/components/sql-editor/index.vue';
import { IJob, ICluster, IKernel, ISimpleFile, IQueue } from '@utils/types';

@Component({
  components: {
    MSqlEditor
  }
})
export default class MJobInfo extends Vue {
  @Prop()
  private jobDetail!: IJob;

  private clusterList: ICluster[] = [];
  private kernelList: IKernel[] = [];
  private queueList: IQueue[] = [];

  @Watch('jobDetail')
  private onJobDetailChanged(val: IJob, oldVal: IJob) {
    val.jobId !== oldVal.jobId && this.init();
  }

  public resize() {
    if (this.jobDetail.jobType === 'SQL') {
      const editor = this.$refs.editor as MSqlEditor;
      editor && editor.resize();
    }
  }

  private mounted() {
    // console.log(this.jobDetail.jobType,'运维类型')
    console.log(this.jobDetail,'详情')
    
    this.init();
  }

  private init() {
    this.getClusterList();
    if (this.jobDetail.clusterType && this.jobDetail.clusterType.toLocaleUpperCase() === 'K8S') {
      this.getK8sKernelList();
    } else {
      this.getKernelList();
    }
    this.getQueueList();
  }

  private async getClusterList() {
    try {
      const clusterList = await this.$request('getClusterList');
      this.clusterList = (clusterList || []).filter(c => {
        if (this.jobDetail.jobType === 'SQL') {
          return !c.clusterType || c.clusterType.toLocaleUpperCase() !== 'K8S';
        }
        return true;
      });
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getKernelList() {
    try {
      this.kernelList = await this.$request('getKernelList');
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getK8sKernelList(typeChanged: boolean = false) {
    try {
      this.kernelList = await this.$request('getK8sKernelList');
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getQueueList() {
    try {
      if (this.jobDetail.clusterId === undefined || this.jobDetail.clusterId === null) {
        return [];
      }
      this.queueList = await this.$request('getQueueList', { clusterId: this.jobDetail.clusterId });
    } catch (e) {
      this.$handleException(e);
    }
  }

  private getClusterName(id: number) {
    const cluster = this.clusterList.find(c => c.id === id);
    return (cluster && cluster.clusterName) || '';
  }

  private getKernelName() {
    if (this.jobDetail.clusterType && this.jobDetail.clusterType.toLocaleUpperCase() === 'K8S') {
      const kernel = this.kernelList.find(k => k.id === this.jobDetail.imageId);
      return (kernel && kernel.imageName) || '';
    }
    const kernel = this.kernelList.find(k => k.id === this.jobDetail.kernelId);
    return (kernel && kernel.kernelName) || '';
  }

  private getQueueName() {
    const queue = this.queueList.find(q => q.id === this.jobDetail.queueId);
    console.log(queue,'queue',this.queueList,this.jobDetail,this.jobDetail.queueId)
    return (queue && queue.queueName) || '';
  }

  private getDependentFiles(fileList: ISimpleFile[]) {
    const fileNames = fileList.map(file => file.name);
    // console.log(fileList,'fileList',fileNames)
    if(fileList){
      return fileNames.join('，');
    }else{
      return "无"
    }
    
  }
}
</script>

<style lang="scss">
.m-job-info {
  width: 100%;
  height: 100%;
  .m-job-sql {
    height: 100%;
    display: flex;
    flex-direction: column;
    .info-header {
      flex-shrink: 0;
      margin-left: 24px;
      border-bottom: $border;
      height: 40px;
      line-height: 40px;
      font-size: 12px;
      box-sizing: border-box;
      display: flex;
      align-items: center;
      .label {
        color: #999;
        user-select: none;
      }
      .content {
        color: #333;
        margin-left: 8px;
      }
    }
    .info-body {
      padding-top: 16px;
      box-sizing: border-box;
      flex: 1;
      height: 0;
    }
  }
  .m-job-jar {
    height: 100%;
    overflow-y: auto;
    padding-top: 20px;
    padding: 16px 20px;
    box-sizing: border-box;
    .info-desc {
      .content {
        word-break: break-all;
      }
    }
  }
}
</style>

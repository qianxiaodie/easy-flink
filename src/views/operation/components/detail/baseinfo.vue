<template>
  <div class="m-job-baseinfo">
     <!-- <div class="title">基本信息</div> -->
    <div class="baseinfo-sql" >
      <div class="info-desc">
        <span class="label">任务名称：</span>
        <span class="content">{{ jobDetail.jobName }}</span>
      </div>
      <div class="info-desc">
        <span class="label">任务ID：</span>
        <span class="content">{{ jobDetail.jobId === -1 ? '' : jobDetail.jobId }}</span>
      </div>
      <div class="info-desc">
        <span class="label">创建时间：</span>
        <span class="content">{{ jobDetail.createTime }}</span>
      </div>
      <div class="info-desc">
        <span class="label">创建人：</span>
        <span class="content">{{ jobDetail.creator }}</span>
      </div>
      <div class="info-desc" >
        <span class="label">最近发布人：</span>
        <span class="content">{{ jobDetail.editor }}</span>
      </div>
      <div class="info-desc" >
        <span class="label">最近发布时间：</span>
        <span class="content">{{ jobDetail.deployTime || '无'}}</span>
      </div>
    </div>

  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch, Prop } from 'vue-property-decorator';
import { IJob } from '@utils/types';
// import Bus from "@/bus";
  @Component
export default class MTest extends Vue {
@Prop()
  private jobDetail!: IJob;

    private job: IJob = {
      jobId: -1,
      jobName: '',
      clusterId: null,
      clusterType: 'YARN',
      kernelId: null,
      queueId: null,
      jobType: '',
      rawSql: ''
    }
    private activeName = 'first'
    // private jobId = -1;
    private resourceName:string = ''
    // @Watch('jobId')
    // private async getJobDetail() {
    //   try {
    //     this.job = await this.$request('getJobDetail', { jobId: this.jobId });
    //   } catch (e) {
    //     this.$handleException(e);
    //   }
    // }

    created() {
      console.log(this.jobDetail, 'jobDetail');
      // Bus.$on('base_job_info', (val) => {
      //   this.jobId = val;
      // });
      // this.resourceName = this.$route.query.name as string;
    }
    beforeDestroy() {
      console.log('---------beforedestory-----------');
      // Bus.$off('base_job_info');
    }
}
</script>

<style lang="scss">
  .m-job-baseinfo {
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  .baseinfo-sql,
  .baseinfo-jar,
  .baseinfo-resource {
    // padding-left: 24px;
    box-sizing: border-box;
    .label {
      width: 150px !important;
    }
  }
  .title {
    line-height: 48px;
    color: #262626;
  }
}
</style>

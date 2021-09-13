<template>
  <div class="baseInfo">
    <div class="header">
      <div class="headerContent">
        <span>资源名称：</span>
        <span>{{this.resourceName}}</span>
      </div>
<!--      <ndc-form class="headerContent">-->
<!--        <ndc-form-item label="资源名称：">-->
<!--          <span class="g-text-nowrap">{{ job.jobName }}</span>-->
<!--        </ndc-form-item>-->
<!--      </ndc-form>-->
    </div>
    <el-tabs v-model="activeName">
      <el-tab-pane label="基本信息" name="first">
        <ndc-form class="panel-body info">
          <ndc-form-item label="任务名称：" class="g-flex-ac">
            <span class="g-text-nowrap" :title="job.jobName">{{ job.jobName }}</span>
          </ndc-form-item>
          <ndc-form-item label="任务ID：" class="g-flex-ac">
            <span class="g-text-nowrap"  :title="job.jobId">{{ job.jobId === -1 ? '' : job.jobId }}</span>
          </ndc-form-item>
          <ndc-form-item label="创建时间：" class="g-flex-ac">
            <span class="g-text-nowrap"  :title="job.createTime">{{ job.createTime }}</span>
          </ndc-form-item>
          <ndc-form-item label="创建人：" class="g-flex-ac">
            <span class="g-text-nowrap" :title="job.creator">{{ job.creator }}</span>
          </ndc-form-item>
          <ndc-form-item label="最近修改人：" class="g-flex-ac">
            <span class="g-text-nowrap" :title="job.creator">{{ job.editor }}</span>
          </ndc-form-item>
           <ndc-form-item label="最近保存时间：" class="g-flex-ac">
            <span class="g-text-nowrap" :title="job.updateTime">{{ job.updateTime }}</span>
           </ndc-form-item>
        </ndc-form>
      </el-tab-pane>
<!--      <el-tab-pane label="配置管理" name="second">配置管理</el-tab-pane>-->
    </el-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Watch } from 'vue-property-decorator';
import { IJob } from '@utils/types';
import Bus from "@/bus";
  @Component
export default class MTest extends Vue {
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
    private jobId = -1;
    private resourceName:string = ''
    @Watch('jobId')
    private async getJobDetail() {
      try {
        this.job = await this.$request('getJobDetail', { jobId: this.jobId });
      } catch (e) {
        this.$handleException(e);
      }
    }

    created() {
      Bus.$on('base_job_id', (val) => {
        this.jobId = val;
      });
      Bus.$on('base_job_info', (val) => {
        this.job = val;
      });
      this.resourceName = this.$route.query.name as string;
    }
    beforeDestroy() {
      Bus.$off('base_job_id');
      Bus.$off('base_job_info');
    }
}
</script>

<style lang="scss" scoped>
  .baseInfo {
    .header{
      padding: 0 12px;
      width: 100%;
      height: 32px;
      line-height: 32px;
      text-align: left;
      .headerContent{
        color: #3b68b7;
      }
    }
    width: 100%;
    /deep/.el-tabs {
      .el-tabs__content{
        padding: 0 5px;
      }
     .el-tabs__nav-scroll {
        display: flex;
        justify-content: space-around;
        .el-tabs__item.is-active {
          color: #3b68b7;
        }

        .el-tabs__item:hover {
          color: #3b68b7;
        }
      }

      .el-tabs__active-bar {
        background-color: #3b68b7;
      }
      .ndc-form-item {
        .content {
          position: relative;
          width: 0px;
          flex: 1 1 0%;
        }
      }
      /*.ndc-form-item{*/
      /*  span{*/
      /*    display: inline-block;*/
      /*    width: 55%;*/
      /*    height: 33px;*/
      /*    overflow: hidden;*/
      /*    textOverflow: ellipsis;*/
      /*    whiteSpace: nowrap*/
      /*  }*/
      /*}*/
    }

    /deep/.ndc-form-item {
      padding: 0;
      text-align: right;
      height: 33px;
      span{
        text-align: left;
      }
      .label {
        font-size: 12px;
        text-align: right;
        color: #999999;
      }
      .label-2{
        width: 110px !important;
      }
    }
  }
</style>

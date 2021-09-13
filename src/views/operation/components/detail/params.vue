<template>
  <div class="m-job-params">
    <div class="title">运行参数</div>
    <div class="params-sql" v-if="jobDetail.jobType === 'SQL'">
      <div class="info-desc">
        <span class="label">checkpointInterval</span>
        <span class="content">{{runParameter['checkpointInterval']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">env.parallelism</span>
        <span class="content">{{runParameter['env.parallelism']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">trigger.interval</span>
        <span class="content">{{runParameter['trigger.interval']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">state_ttl</span>
        <span class="content">{{runParameter['state_ttl']}}</span>
      </div>
      <div class="info-desc" v-if="jobDetail.kernelType === 'SLOTH_FLINK_SQL_1100'">
        <span class="label">zone_offset.of_hour</span>
        <span class="content">{{runParameter['zone_offset.of_hour']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">tm.memory</span>
        <span class="content">{{runParameter['tm.memory']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">队列</span>
        <span class="content">{{queueName}}</span>
      </div>
    </div>
    <div class="params-jar" v-else>
      <div class="info-desc">
        <span class="label">parallelism</span>
        <span class="content">{{runParameter['parallelism']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">jm.memory</span>
        <span class="content">{{runParameter['jm.memory']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">tm.memory</span>
        <span class="content">{{runParameter['tm.memory']}}</span>
      </div>
      <!-- <div class="info-desc" v-if="jobDetail.clusterType && jobDetail.clusterType.toLocaleUpperCase() === 'K8S'">
        <span class="label">tm.memory</span>
        <span class="content">{{runParameter['tm.memory']}}</span>
      </div>-->
      <!-- <div class="info-desc" v-if="isTmNumberExist()">
        <span class="label">tm.number</span>
        
        <span class="content">{{runParameter['tm.number']}}</span>
      </div>-->
      <div class="info-desc">
        <span class="label">slot</span>
        <span class="content">{{runParameter['slot']}}</span>
      </div>
      <div class="info-desc">
        <span class="label">队列</span>
        <span class="content">{{queueName}}</span>
      </div>
    </div>
    <!-- <div class="title">资源配置</div>
    <div class="params-resource">
      <div v-if="jobDetail && jobDetail.resourceDesc">
        <div class="info-desc">
          <span class="label">配置方式</span>
          <span class="content">智能配置</span>
        </div>
        <div class="info-desc" v-for="(item, index) in Object.keys(jobDetail.resourceDesc.resOverview || {})" :key="index">
          <span class="label">{{item}}</span>
          <span class="content">{{jobDetail.resourceDesc.resOverview && jobDetail.resourceDesc.resOverview[item] || ''}}</span>
        </div>
      </div>
      <div v-else>
        <div class="info-desc">
          <span class="label">配置方式</span>
          <span class="content">手动配置</span>
        </div>
       
      </div>
    </div>-->
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator'
import { IJob } from '@utils/types'
import { isTmNumberExist } from '../../../develop/utils'

@Component
export default class MJobParams extends Vue {
  @Prop({
    default() {
      return {}
    }
  })
  private jobDetail!: IJob

  private userid: any = JSON.parse(localStorage.getItem('userInfo') as any).user_no

  private get runParameter() {
    return (this.jobDetail && this.jobDetail.runParameter) || {}
  }

  private queueName = ''

  public search() {
    this.getqueueName()
  }

  public async getqueueName() {
    const params = {
      jobId: this.jobDetail.jobId,
      userId: this.userid
    }
    const result = await this.$request('getQueueName', params)
    this.queueName = result.queueName || "无"
    console.log(params, result, 'getqueueName')
  }

  private isTmNumberExist() {
    return isTmNumberExist(this.jobDetail)
  }
}
</script>

<style lang="scss">
.m-job-params {
  width: 100%;
  height: 100%;
  padding: 16px 20px;
  box-sizing: border-box;
  .params-sql,
  .params-jar,
  .params-resource {
    padding-left: 20px;
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

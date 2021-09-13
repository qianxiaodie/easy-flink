<template>
  <div class="m-elk-page" v-if="init">
    <m-job-log ref="log" v-if="jobDetail" :job-detail="jobDetail" :conditions="conditions" :in-page="false"></m-job-log>
    <div v-else>日志获取失败</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import MJobLog from './components/detail/log.vue';
import { IJob } from '../../utils/types';

@Component({
  components: {
    MJobLog
  }
})
export default class MElkPage extends Vue {
  private jobDetail: IJob | null = null;
  private conditions: any | null = null;
  private init: boolean = false;

  private async created() {
    let urlobj:any = {};
    const url:any = window.location.href.split("?")[1];
    const urlarr = url.split("&")
    urlarr.forEach(v=>{
      urlobj[v.split("=")[0]] = v.split('=')[1]
    })
    const { jobId, containerId, startTime, endTime, keyword, type = '', level = '' } = urlobj || {};
    if (jobId) {
      try {
        this.jobDetail = await this.$request('getOperationJobDetail', {
          jobId: jobId
        });
        this.conditions = { containerId, startTime, endTime, keyword, types: (type as string).split(','), levels: (level as string).split(',') };
        console.log(this.conditions,'thistime,conditions')
      } catch (e) {
        this.$handleException(e, '任务详情获取失败');
      } finally {
        this.init = true;
        this.$nextTick(() => {
          const logComp = this.$refs.log as MJobLog;
          logComp && logComp.refresh();
        });
      }
    }
  }
}
</script>

<style lang="scss">
.m-elk-page {
  width: 100%;
  height: 100%;
}
</style>

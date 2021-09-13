<template>
  <div class="m-log-page">
    <div class="log-header">{{title}}</div>
    <div class="log-content">
      <u-log-editor :logs="log"></u-log-editor>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';

@Component
export default class MLogPage extends Vue {
  private title: string = '';
  private log: string = '';

  private async created() {
    let appdom:any = document.getElementById('app');
     if (appdom) {
       appdom.style.display = 'none';
     }
    try {
      let urlobj:any = {}
      if(window.location.href.indexOf('?')!==-1){

        const url = window.location.href.split("?")[1]
        
        const urlarr = url.split("&")
        
        urlarr.forEach(v=>{
          urlobj[v.split("=")[0]] = v.split('=')[1]
        })
      }
       console.log(urlobj,"2222")
      const { id, type } = urlobj;
      this.title = type === 'START' ? '启动日志' : type === 'STOP' ? '停止日志' : '最后运行日志';
      console.log(this.title,'title=====')
      const log = await this.$request('getOperationJobLog', {
        lifeCycleId: id,
        eventType: type
      });
      this.log = log || '';
    } catch (e) {
      this.$handleException(e, '日志获取失败');
    }
  }
}
</script>

<style lang="scss">
.m-log-page {
  box-sizing: border-box;
  width: 100%;
  // height: 100%;
  min-height: 500px;
  display: flex;
  flex-direction: column;
  .log-header {
    padding-left: 24px;
    height: 48px;
    line-height: 48px;
    font-size: 16px;
    color: #262626;
    background: #e9ebf0;
  }
  .log-content {
    flex: 1;
    height: 0;
  }
}
</style>

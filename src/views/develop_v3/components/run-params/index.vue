<template>
  <div class="m-run-params">
    <ndc-form>
      <!-- <ndc-form-item label="提交集群">
        <ndc-select
          class="g-ml-16"
          style="background: #fff;"
          name="clusterId"
          value-key="id"
          label-key="clusterName"
          placeholder="集群版本"
          :options="clusterList"
          v-model="clusterId"
          @change="onClusterChange"
        ></ndc-select>
      </ndc-form-item> -->
      <ndc-form-item label="内核版本：">
        <ndc-select
          v-if="clusterType && clusterType.toLocaleUpperCase() === 'K8S'"
          class="g-ml-16"
          style="background: #fff;"
          name="kernelId"
          value-key="id"
          label-key="imageName"
          placeholder="内核版本"
          :options="kernelList"
          v-model="imageId"
          @change="onKernelChange"
          :disabled="!opCodesFlag"
        ></ndc-select>
        <ndc-select
          v-else
          class="g-ml-16"
          style="background: #fff;"
          name="kernelName"
          value-key="id"
          label-key="kernelName"
          placeholder="内核版本"
          :options="kernelList"
          v-model="kernelId"
          @change="onKernelChange"
          @before-show="onClickBeforeShow"
          :disabled="job.jobType === 'SQL' ? true : !opCodesFlag"
        ></ndc-select>
      </ndc-form-item>

      <!-- <ndc-form-item label="内核版本:">
        <ndc-select
          v-if="clusterType && clusterType.toLocaleUpperCase() === 'K8S'"
          class="g-ml-16"
          style="background: #fff;"
          name="kernelId"
          value-key="id"
          label-key="imageName"
          placeholder="内核版本"
          :options="kernelList"
          v-model="kernelName"
          @change="onKernelChange"
        ></ndc-select>
        <ndc-select
          v-else
          class="g-ml-16"
          style="background: #fff;"
          name="kernelId"
          value-key="id"
          label-key="kernelName"
          placeholder="内核版本"
          :options="kernelList"
          v-model="kernelName"
          @change="onKernelChange"
        ></ndc-select>
      </ndc-form-item> -->

      <!-- <ndc-form-item label="提交队列">
        <ndc-select
          class="g-ml-16"
          style="background: #fff;"
          name="queueId"
          value-key="id"
          label-key="queueName"
          placeholder="队列版本"
          :disabled="!clusterId"
          :options="queueList"
          v-model="queueId"
          @change="onQueueChange"
        ></ndc-select>
      </ndc-form-item> -->
      <div v-show="job.jobType === 'SQL'">
        <!-- <ndc-form-item label="checkpointInterval">
          <u-validator name="checkpointInterval" :validate="errors">
            <input
              class="ndc-input"
              name="checkpointInterval"
              placeholder="请输入checkpointInterval"
              v-validate="{
                required: 'checkpointInterval'
              }"
              v-number="{'min': 1}"
              v-model="checkpointInterval"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item> -->
        <!-- <ndc-form-item label="env.parallelism">
          <u-validator name="envParallelism" :validate="errors">
            <input
              class="ndc-input"
              name="envParallelism"
              placeholder="请输入env.parallelism"
              v-validate="{
                required: 'env.parallelism'
              }"
              v-number="{'min': 1}"
              v-model="envParallelism"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item> -->
        <!-- <ndc-form-item label="trigger.interval">
          <u-validator name="triggerInterval" :validate="errors">
            <input
              class="ndc-input"
              name="triggerInterval"
              placeholder="请输入trigger.interval"
              v-validate="{
                required: 'trigger.interval'
              }"
              v-number="{'min': 1}"
              v-model="triggerInterval"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item> -->
         <ndc-form-item label="state_ttl：">
          <u-validator name="stateTtl" :validate="errors">
            <input
              class="ndc-input"
              name="stateTtl"
              placeholder="请输入state_ttl"
              v-validate="{
                required: 'state_ttl'
              }"
              v-number="{'min': 0}"
              v-model="stateTtl"
              @change="emitChange"
              oninput="value=value.replace(/^-([0-9]|[1-9][0-9])*$/,'')"
              :disabled="!opCodesFlag"
            />
          </u-validator>
           <img src="@/assets/images/wenhao.svg" alt="状态的生存周期，单位秒" title="状态的生存周期，单位秒">
        </ndc-form-item>
<!--        v-show="kernelName === 'SLOTH_FLINK_SQL_1100'"-->
<!--        zone_offset.of_hour-->
        <ndc-form-item label="时区设置：">
          <u-validator name="zone" :validate="errors">
            <input
              class="ndc-input"
              name="zone"
              placeholder="请输入zone_offset.of_hour"
              v-validate="{
                required: 'zone_offset.of_hour'
              }"
              v-number="{ min: -18, max: 18 }"
              v-model="zone"
              @change="emitChange"
              :disabled="!opCodesFlag"
            />
          </u-validator>
          <img src="@/assets/images/wenhao.svg" alt="zone_offset.of_hour" title="默认东八区(中国)">
        </ndc-form-item>
      </div>
      <div v-show="job.jobType === 'JAR'">
        <!-- <ndc-form-item label="parallelism:">
          <u-validator name="parallelism" :validate="errors">
            <input
              class="ndc-input"
              name="parallelism"
              placeholder="请输入parallelism"
              v-validate="{
                required: 'parallelism'
              }"
              v-number="{ min: 1 }"
              v-model="parallelism"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item>
        <ndc-form-item label="jm.memory:">
          <u-validator name="jmMemory" :validate="errors">
            <input
              class="ndc-input"
              name="jmMemory"
              placeholder="请输入jm.memory"
              v-validate="{
                required: 'jm.memory'
              }"
              v-number="{ min: 1 }"
              v-model="jmMemory"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item>
        <ndc-form-item label="tm.cpu:" v-if="clusterType && clusterType.toLocaleUpperCase() === 'K8S'">
          <u-validator name="tmCpu" :validate="errors">
            <input
              class="ndc-input"
              name="tmCpu"
              placeholder="请输入tm.cpu"
              v-validate="{
                required: 'tm.cpu',
                twoDecimalValidator: true,
                moreThan0: true
              }"
              v-number="{ min: 0, max: 20, decimal: 2 }"
              v-model="tmCpu"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item>
        <ndc-form-item label="tm.number:" v-if="isTmNumberExist()">
          <u-validator name="tmNumber" :validate="errors">
            <input
              class="ndc-input"
              name="tmNumber"
              placeholder="请输入tm.number"
              v-validate="{
                required: 'tm.number'
              }"
              v-number="{ min: 1 }"
              v-model="tmNumber"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item>
        <ndc-form-item label="slot:">
          <u-validator name="slot" :validate="errors">
            <input
              class="ndc-input"
              name="slot"
              placeholder="请输入slot"
              v-validate="{
                required: 'slot'
              }"
              v-number="{ min: 1 }"
              v-model="slot"
              @change="emitChange"
            />
          </u-validator>
        </ndc-form-item> -->
      </div>
    </ndc-form>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IJob, ICluster, IKernel, IQueue } from '@utils/types';
import { isTmNumberExist } from '../../utils';

@Component
export default class MRunParams extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private job!: IJob
  // sidebar 传值权限
  @Prop({
    default: false
  })
  private opCodesFlag!: boolean;
  @Watch('job')
  private onJobChanged(val: IJob) {
    val = val || {};
    const type = val.jobType;
    this.clusterId = val.clusterId;
    this.clusterName = val.clusterName || '';
    this.clusterType = val.clusterType || 'YARN';
    this.kernelId = val.kernelId;
    this.kernelName = val.kernelName || '';
    if (this.clusterType.toLocaleUpperCase() === 'K8S') {
      this.imageId = val.imageId || null;
      this.imageName = val.imageName || '';
    }
    this.queueId = val.queueId;
    this.queueName = val.queueName || '';
    const runParameter: any = val.runParameter || {};
    if (type === 'SQL') {
      this.checkpointInterval = runParameter.checkpointInterval || 60000;
      this.envParallelism = runParameter['env.parallelism'] || 1;
      this.triggerInterval = runParameter['trigger.interval'] || 1000;
      this.stateTtl = runParameter['state_ttl'] || 0;
      if (this.kernelName === 'flink-1.10.0-ne' || this.kernelName === 'flink-1.12.2') {
        this.zone = runParameter['zone_offset.of_hour'] || 8;
      }
    } else {
      if (this.clusterType.toLocaleUpperCase() === 'K8S') {
        this.tmCpu = runParameter['tm.cpu'] || 1;
      }
      this.parallelism = runParameter.parallelism || 1;
      this.jmMemory = runParameter['jm.memory'] || 1024;
      if (this.isTmNumberExist()) {
        this.tmNumber = runParameter['tm.number'] || 1;
      }
      this.slot = runParameter.slot || 1;
    }
  }

  private isInit: boolean = false
  private clusterList: ICluster[] = []
  private clusterId: number | null = null
  private clusterName: string = ''
  private clusterType: string = 'YARN'
  private kernelList: IKernel[] = []
  private kernelId: number | null = null
  private kernelName: string | null = null
  private imageId: number | null = null
  private imageName: string | null = null
  private queueList: IQueue[] = []
  private queueId: number | null = null
  private queueName: string = ''
  private checkpointInterval: number = 60000
  private envParallelism: number = 1
  private triggerInterval: number = 1000
  private stateTtl: number = 0
  private zone: number | any = 8
  private parallelism: number = 1
  private jmMemory: number = 1024
  private tmCpu: number = 1
  private tmNumber: number = 1
  private slot: number = 1

  public getRunParameter(isCompare: boolean = false) {
    const parameter =
      this.job.jobType === 'SQL'
        ? {
          checkpointInterval: Number(this.checkpointInterval),
          'env.parallelism': Number(this.envParallelism),
          'trigger.interval': Number(this.triggerInterval),
          state_ttl: Number(this.stateTtl)
        }
        : {
          parallelism: Number(this.parallelism),
          'jm.memory': Number(this.jmMemory),
          slot: Number(this.slot)
        };
    if (this.job.jobType === 'JAR') {
      this.isTmNumberExist() && (parameter['tm.number'] = Number(this.tmNumber));
      this.clusterType.toLocaleUpperCase() === 'K8S' && (parameter['tm.cpu'] = Number(this.tmCpu));
    }
    const info = isCompare
      ? {
        clusterName: this.clusterName,
        kernelName: this.kernelName,
        imageName: this.imageName,
        queueName: this.queueName
      }
      : {};
    const params = Object.assign(
      {
        clusterType: this.clusterType,
        clusterId: this.clusterId,
        kernelId: this.kernelId,
        imageId: this.imageId,
        queueId: this.queueId
      },
      info,
      parameter
    );
    if (this.kernelName === 'flink-1.10.0-ne' || this.kernelName === 'flink-1.12.2') {
      params['zone_offset.of_hour'] = Number(this.zone);
    } else {
      delete params['zone_offset.of_hour'];
    }
    return params;
  }

  public isComplete(): boolean {
    if (this.job.jobType === 'SQL') {
      if ((this.job.kernelName === 'flink-1.10.0-ne' || this.job.kernelName === 'flink-1.12.2') && (this.zone === undefined || this.zone === null || this.zone === '')) {
        return false;
      }
      if (this.stateTtl === 0) {
        return true;
      }
      // return !!(this.clusterId && this.kernelId && this.queueId && this.checkpointInterval && this.envParallelism && this.triggerInterval && this.stateTtl)
      // return !!(this.kernelId && this.checkpointInterval && this.envParallelism && this.triggerInterval && this.stateTtl);
      return !!(this.kernelId && this.stateTtl);
    }
    if (this.clusterType.toLocaleUpperCase() === 'K8S') {
      const tmCpu = this.tmCpu;
      const arr = ('' + tmCpu).split('.');
      if (+tmCpu <= 0 || (arr.length > 1 && arr[1].length > 2)) {
        return false;
      }
    }
    // return !!(this.clusterId && this.kernelId && this.queueId && this.parallelism && this.jmMemory && this.tmNumber && this.slot)
    // return !!(this.kernelId && this.parallelism && this.jmMemory && this.tmNumber && this.slot);
    return !!(this.kernelId);
  }

  public async init() {
    this.isInit = true;
    this.getKernelList();
    await this.getClusterList();
    this.onClusterChange();
  }
  created() {
    this.getKernelList();
  }
  private async getKernelList(typeChanged: boolean = false) {
    try {
      const list = await this.$request('getKernelList');
      this.kernelList = (list || []).filter(l => {
        //  1.12.2 为新上线版本
        if (l.kernelName === 'flink-1.12.2') {
          l.kernelName = 'flink-1.12.2(Beta)';
        }

        if ((l.clusterType || '').toLocaleUpperCase() === 'K8S') {
          return false;
        }
        if (this.job.jobType === 'SQL') {
          return ['SQL', 'ALL'].includes(l.taskType);
        }
        return ['JAR', 'ALL'].includes(l.taskType);
      });
      if (typeChanged) {
        const kernel = this.kernelList[0];
        kernel && (this.kernelId = kernel.id);
      }
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getK8sKernelList(typeChanged: boolean = false) {
    try {
      const list = await this.$request('getK8sKernelList');
      this.kernelList = (list || []).filter(l => {
        if (this.job.jobType === 'SQL') {
          return ['SQL', 'ALL'].includes(l.taskType);
        }
        return ['JAR', 'ALL'].includes(l.taskType);
      });
      if (typeChanged) {
        const kernel = this.kernelList[0];
        if (kernel) {
          this.kernelId = kernel.kernelId || null;
          this.imageId = kernel.id;
        }
      }
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getClusterList() {
    try {
      const clusterList = await this.$request('getClusterList');
      this.clusterList = (clusterList || []).filter(c => {
        if (this.job.jobType === 'SQL') {
          return !c.clusterType || c.clusterType.toLocaleUpperCase() !== 'K8S';
        }
        return true;
      });
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getQueueList() {
    try {
      this.queueList = await this.$request('getQueueList', {
        clusterId: this.clusterId
      });
      const index = this.queueList.findIndex(q => q.id === this.queueId);
      if (index === -1) {
        this.queueId = this.queueList.length ? this.queueList[0].id : null;
      }
    } catch (e) {
      this.$handleException(e);
    }
  }

  private isTmNumberExist() {
    return isTmNumberExist(this);
  }

  private async onClusterChange() {
    const cluster = (this.clusterList || []).find(c => c.id === this.clusterId);
    if (cluster) {
      this.clusterName = cluster.clusterName;
      const type = cluster.clusterType || 'YARN';
      const promiseArr: any[] = [];
      let typeChanged = false;
      if (this.clusterType !== type) {
        this.clusterType = type;
        typeChanged = true;
      }
      if (type.toLocaleUpperCase() === 'YARN') {
        promiseArr.push(this.getKernelList(typeChanged));
      }
      if (type.toLocaleUpperCase() === 'K8S') {
        promiseArr.push(this.getK8sKernelList(typeChanged));
      }
      if (this.clusterId) {
        promiseArr.push(this.getQueueList());
      }
      await Promise.all(promiseArr);
    }
    this.emitChange();
  }

  private onKernelChange() {
    if (this.clusterType.toLocaleUpperCase() === 'K8S') {
      const kernel = (this.kernelList || []).find(k => k.id === this.imageId);
      kernel && (this.imageName = kernel.imageName || '');
    } else {
      // 切换版本1.12时加提示
      if (this.job.jobType === 'SQL') {
        this.$ndcmessage.warning('版本切换后可能导致历史checkpoint不可用，以及任务失败！');
      }

      const kernel = (this.kernelList || []).find(k => k.id === this.kernelId);
      kernel && (this.kernelName = kernel.kernelName || '');
    }
    this.emitChange();
  }

  private onClickBeforeShow() {
    window.event && window.event.stopPropagation()
    if (this.job.jobType === 'JAR' && !this.job.flinkJarPath && !this.job.flinkJarResId) {
      this.$ndcconfirm({
        content: '请先上传jar包',
        cancelButton: ''
      });
    }
  }

  private onQueueChange() {
    const queue = (this.queueList || []).find(q => q.id === this.queueId);
    queue && (this.queueName = queue.queueName);
    this.emitChange();
  }
  private emitChange() {
    this.$emit('change', this.getRunParameter());
  }
}
</script>

<style lang="scss" scoped>
@mixin input_small_style {
  width: 320px;
  height: 32px;
  line-height: 32px;
  box-sizing: border-box;
  border-radius: 2px;
  font-size: 14px;
  background-color: #fff;
}
.ndc-form .ndc-form-item .content {
  .u-validator{
    width: unset;
  }
  img{
    margin-left: 10px;
  }
}
.m-run-params {
  /deep/ .ndc-form .ndc-form-item {
    padding: 8px 0;
    .label {
      font-size: 14px;
      color: #555;
      width: 76px;
      height: 32px;
      line-height: 32px;
      text-align: right;
      margin: 0 2px 0 16px;
      padding-right: 0;
    }
    .label-2 {
      /*138px*/
      width: 105px;
    }
    .content {
      .ndc-input {
        @include input_small_style();
      }

      .ndc-select,
      .u-select {
        // @include input_small_style();
        width: 320px;
        height: 32px;
        line-height: 32px;
        box-sizing: border-box;
        // background: #fff;
        border-radius: 2px;
        font-size: 14px;
        padding-right: 40px;
        margin: 0;
        background: #f6f6f7 !important;
        border: 1px solid #d0d2d7;
        .ndc-select-panel,
        .ndc-select-empty,
        .ndc-select-option {
          font-size: 14px;
          line-height: 32px;
        }

        &-label {
          padding: 0;
          line-height: 32px;
          font-size: 14px;
        }
        .ndc-icon-pull-down {
          &::before {
            display: none;
          }
        }
      }
    }
    .u-validator .error {
      display: block;
      top: calc(100% - 4px);
    }
  }
  .zoneItem{
    display: flex;
  }
}
</style>

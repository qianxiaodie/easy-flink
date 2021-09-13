<template>
  <div class="m-resource-allocation">
    <ndc-radio v-model="configType" label="manual" @change="onChangeConfigType">手动配置</ndc-radio>
    <ndc-form>
      <ndc-form-item label="tm.memory">
        <u-validator name="tmMemory" :validate="errors">
          <input
            class="ndc-input"
            name="tmMemory"
            placeholder="请输入tm.memory"
            :disabled="configType === 'intelligent'"
            v-validate="{
              required: 'tm.memory'
            }"
            v-number="{'min': 1}"
            v-model="tmMemory"
            @change="emitChange"
          />
        </u-validator>
      </ndc-form-item>
    </ndc-form>
    <ndc-radio v-model="configType" label="intelligent" @change="onChangeConfigType" :disbled="!job.clusterType || job.clusterType.toLocaleUpperCase() === 'K8S'">智能配置</ndc-radio>
    <div class="intelligent" v-if="configType === 'intelligent'">
      <ndc-loading class="loading" v-if="loading" text="配置中..."></ndc-loading>
      <ndc-form v-else-if="resOverview">
        <ndc-form-item v-for="(item, index) in Object.keys(resOverview)" :key="index" :label="item">
          <span>{{resOverview[item]}}</span>
        </ndc-form-item>
      </ndc-form>
      <div style="line-height: 40px;" v-else>请使用拓扑图完成参数配置</div>
      <ndc-button class="g-mt-16" theme="primary" @click="showTopology" :disabled="loading">配置</ndc-button>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import { IJob, ITopologyNode, IResourceDesc } from '@/utils/types';
import ModalMixin from '../../../components/modal/mixin';
import { MODAL_TYPE } from '../../../components/modal/constant';

@Component
export default class MResourceAllocation extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private job!: IJob;

  private configType: string = 'manual';
  private tmMemory: number = 4096;
  private loading: boolean = false;
  private resOverview: any | null = null;
  private topologyData: ITopologyNode[] = [];
  private confType: string = '';
  private topologyModalInstance: ModalMixin | null = null;

  @Watch('job')
  private onJobChanged(val: IJob) {
    if (!val.resourceDesc || (val.clusterType && val.clusterType.toLocaleUpperCase() === 'K8S')) {
      this.configType = 'manual';
      this.tmMemory = (val.runParameter && val.runParameter['tm.memory']) || 4096;
    } else {
      this.configType = 'intelligent';
      this.resOverview = val.resourceDesc.resOverview;
      this.topologyData = val.resourceDesc.topologyJson.nodes || [];
      this.confType = val.resourceDesc.confType || '';
    }
  }

  public genParams() {
    if (this.configType === 'manual') {
      return {
        tmMemory: Number(this.tmMemory),
        resourceDesc: null
      };
    }
    return {
      resourceDesc: Object.assign({}, this.job.resourceDesc, {
        resOverview: this.resOverview,
        confType: this.confType,
        topologyJson: {
          nodes: this.topologyData
        }
      })
    };
  }

  public isComplete() {
    if (this.configType === 'manual') {
      return !!this.tmMemory;
    }
    return true;
  }

  private beforeDestroy() {
    this.topologyModalInstance && this.topologyModalInstance.hide();
    this.topologyModalInstance = null;
  }

  private async onChangeConfigType(val: string) {
    if (val === 'intelligent') {
      try {
        this.loading = true;
        const resourceDesc: IResourceDesc = await this.$request('getTopologyDetail', { jobId: this.job.jobId });
        this.resOverview = resourceDesc.resOverview;
        this.topologyData = resourceDesc.topologyJson.nodes;
        await this.showTopology(false);
      } catch (e) {
        this.configType = 'manual';
        this.$handleException(e, '配置失败，需手动配置');
      } finally {
        this.loading = false;
      }
    } else {
      this.emitChange();
    }
  }

  private async showTopology(needDetail: boolean = true) {
    try {
      if (needDetail) {
        const resourceDesc: IResourceDesc = await this.$request('getTopologyDetail', { jobId: this.job.jobId });
        this.topologyData = resourceDesc.topologyJson.nodes || [];
      }
      if (!this.topologyModalInstance) {
        this.topologyModalInstance = this.$createModalInstance(MODAL_TYPE.topology);
      }
      this.topologyModalInstance && this.topologyModalInstance.show({
        topologyData: this.topologyData,
        afterClose: () => {
          if (!this.resOverview) {
            this.configType = 'manual';
          }
          this.emitChange();
        }
      }, async (args) => {
        try {
          this.topologyModalInstance && this.topologyModalInstance.showLoading();
          const topologyData = args.topologyData;
          const resourceDesc: IResourceDesc = this.job.resourceDesc = await this.$request('calcTopologySummary', {
            jobId: this.job.jobId,
            resourceDesc: Object.assign({}, this.job.resourceDesc, { topologyJson: { nodes: topologyData } })
          });
          this.resOverview = resourceDesc.resOverview;
          this.topologyData = resourceDesc.topologyJson.nodes;
          this.confType = resourceDesc.confType;
          return true;
        } catch (e) {
          this.topologyModalInstance && this.topologyModalInstance.setError(e.message);
        } finally {
          this.topologyModalInstance && this.topologyModalInstance.hideLoading();
          if (!this.resOverview) {
            this.configType = 'manual';
          }
          this.emitChange();
        }
      });
    } catch (e) {
      this.$handleException(e, '配置失败，需手动配置');
    }
  }

  private emitChange() {
    let resourceDesc: any = null;
    if (this.configType === 'intelligent') {
      resourceDesc = Object.assign({}, this.job.resourceDesc, {
        resOverview: this.resOverview,
        confType: this.confType,
        topologyJson: {
          nodes: this.topologyData
        }
      });
    }
    this.$emit('change', {
      tmMemory: Number(this.tmMemory),
      resourceDesc
    });
  }
}
</script>

<style lang="scss">
@mixin input_small_style {
  width: 240px;
  height: 24px;
  line-height: 24px;
  box-sizing: border-box;
  background: #fff;
  border-radius: 2px;
  font-size: 12px;
}

.m-resource-allocation {
  font-size: 12px;
  .ndc-radio {
    line-height: 40px;
  }
  .ndc-form .ndc-form-item {
    padding: 8px 0 8px 24px;
    .label {
      font-size: 12px;
      color: #999;
      width: 90px;
      line-height: 24px;
    }
    .content {
      .ndc-input {
        @include input_small_style();
      }
    }
  }
  .intelligent {
    padding: 12px 24px;
    background-color: #f4f6fa;
    .ndc-form-item {
      padding: 0;
      .label,
      .content {
        line-height: 40px;
      }
    }
  }
}
</style>

<template>
  <div class="m-job-diagnosis">
    <div class="top g-flex-ac">
      <div v-if="jobDetail.health" class="top-item health" @click="onChangeDiagnosisType('health')">
        <div class="icon" :class="healthClass">
          <i class="img sloth-icon-health" />
        </div>
        <div class="label">健康检查</div>
      </div>
      <div v-if="jobDetail.waste" class="top-item waste" @click="onChangeDiagnosisType('waste')">
        <div class="icon" :class="wasteClass">
          <i class="img sloth-icon-waste" />
        </div>
        <div class="label">资源用量</div>
      </div>
    </div>
    <div class="middle" v-show="!!activeDiagnosisType">
      <div class="arrow" :style="panelArrowStyle">
        <div class="arrow-child"></div>
      </div>
      <div class="overview g-flex-ac">
        <div class="total">{{activeDiagnosisType === 'health' ? "健康检查" : '资源用量'}}： 共<span class="g-ml-4 g-mr-4" style="color: #262626;">{{status.total}}</span>项</div>
        <div class="detail g-flex-ac g-ml-24">
          <div class="g-ml-8">其中</div>
          <div class="g-flex-ac g-ml-4" style="color: #262626;">
            <div class="icon normal"></div>
            正常 {{status.normal}}
          </div>
          <div class="g-flex-ac g-ml-8" style="color: #262626;">
            <div class="icon medium"></div>
            异常 {{status.medium}}
          </div>
          <div class="g-flex-ac g-ml-8" style="color: #262626;" v-if="activeDiagnosisType === 'health'">
            <div class="icon serious"></div>
            严重 {{status.serious}}
          </div>
        </div>
      </div>
      <div class="wrapper g-flex-ac">
        <m-diagnosis-item v-for="(item, index) in disgnosisCategoryList" :key="index" :active="activeDiagnosisCategory === item.diagnoseCategory" :label="item.diagnoseCategory" :status="item.result" @click="onChangeSecondaryModule(item.diagnoseCategory)"></m-diagnosis-item>
      </div>
      <div class="footer" v-show="!!activeDiagnosisType && !!activeDiagnosisCategory">
        <u-line-chart ref="chart" v-for="(item, index) in charts" :key="index" :chart="item"></u-line-chart>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IJob, ILineChart } from '@utils/types';
import MDiagnosisItem from './diagnosis-item.vue';
import ULineChart from '@views/components/chart/line-chart.vue';

interface IDiagnosisCategory {
  jobId: number;
  diagnoseType: string;
  diagnoseCategory: string;
  result: string;
}

interface IDiagnosisStatus {
  total: number;
  normal: number;
  medium: number;
  serious: number;
}

@Component({
  components: {
    MDiagnosisItem,
    ULineChart
  }
})
export default class MJobDiagnosis extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private jobDetail!: IJob;

  private activeDiagnosisType: string = '';
  private activeDiagnosisCategory: string = '';
  private disgnosisCategoryList: IDiagnosisCategory[] = [];
  private status: IDiagnosisStatus = {
    total: 0,
    normal: 0,
    medium: 0,
    serious: 0
  };
  private charts: ILineChart[] = [];
  private left: number = 0;

  private get healthClass() {
    const status = (this.jobDetail.health && this.jobDetail.health.toLocaleLowerCase()) || '';
    return this.activeDiagnosisType === 'health' ? `active ${status}` : status;
  }

  private get wasteClass() {
    const status = (this.jobDetail.waste && this.jobDetail.waste.toLocaleLowerCase()) || '';
    return this.activeDiagnosisType === 'waste' ? `active ${status}` : status;
  }

  private get panelArrowStyle() {
    return {
      left: this.left + 'px'
    };
  }

  public refresh() {
    this.activeDiagnosisType = '';
    this.activeDiagnosisCategory = '';
  }

  public resize() {
    const charts = this.$refs.chart as any[];
    (charts || []).forEach(chart => chart.resize && chart.resize());
  }

  private async onChangeDiagnosisType(diagnosisType: string = '') {
    try {
      this.activeDiagnosisType = diagnosisType;
      this.activeDiagnosisCategory = '';
      this.status = {
        total: 0,
        normal: 0,
        medium: 0,
        serious: 0
      };
      this.disgnosisCategoryList = await this.$request('getDiagnosisModule', {
        jobId: this.jobDetail.jobId,
        diagnoseType: diagnosisType
      });
      const len = this.status.total = (this.disgnosisCategoryList || []).length;
      for (let i = 0; i < len; i++) {
        const disgnosisCategory = this.disgnosisCategoryList[i] || {};
        const status = (disgnosisCategory.result || '').toLocaleUpperCase();
        if (status === 'NORMAL') {
          this.status.normal += 1;
        } else if (status === 'MEDIUM') {
          this.status.medium += 1;
        } else if (status === 'SERIOUS') {
          this.status.serious += 1;
        }
      }
    } catch (e) {
      this.$handleException(e);
    } finally {
      if (this.activeDiagnosisType) {
        const dom = this.$el.getElementsByClassName(this.activeDiagnosisType)[0] as any;
        this.left = dom.offsetLeft + dom.clientWidth / 2 - 8;
      }
    }
  }

  private async onChangeSecondaryModule(diagnosisCategory: string = '') {
    try {
      this.activeDiagnosisCategory = diagnosisCategory;
      this.charts = await this.$request('getDiagnosisDetail', {
        jobId: this.jobDetail.jobId,
        diagnoseType: this.activeDiagnosisType,
        diagnoseCategory: diagnosisCategory
      });
    } catch (e) {
      this.$handleException(e);
    }
  }
}
</script>

<style lang="scss">
.m-job-diagnosis {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .top {
    padding: 20px 0 0 30px;
    &-item {
      padding-bottom: 12px;
      width: 120px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      cursor: pointer;
      .icon {
        width: 48px;
        height: 48px;
        border-radius: 2px;
        background-image: url('../../../../assets/images/background.svg');
        background-color: #d6f5ea;
        display: flex;
        align-items: center;
        justify-content: center;
        .img {
          font-size: 24px;
          color: #01d787;
        }
        &:hover,
        &.active {
          background-color: #01d787;
          .img {
            color: #fff !important;
          }
        }
        &.active {
          box-shadow: 0px 0px 4px #01d787;
        }
        &.medium {
          .img {
            color: #fc8c43;
          }
          &:hover,
          &.active {
            background-color: #fc8c43;
          }
          &.active {
            box-shadow: 0px 0px 4px #fc8c43;
          }
        }
        &.serious {
          .img {
            color: #f04346;
          }
          &:hover,
          &.active {
            background-color: #f04346;
          }
          &.active {
            box-shadow: 0px 0px 4px #f04346;
          }
        }
      }
      .label {
        font-size: 14px;
        color: #333;
        margin-top: 12px;
      }
    }
  }
  .middle {
    flex: 1;
    height: 0;
    display: flex;
    flex-direction: column;
    background-color: #f4f6fa;
    border-top: $border;
    padding: 0 24px 24px 24px;
    box-sizing: border-box;
    position: relative;
    .arrow {
      position: absolute;
      top: -24px;
      width: 0;
      height: 0;
      border: 12px solid transparent;
      border-bottom-color: #e2e7f0;
      &-child {
        position: absolute;
        top: -9px;
        left: -11px;
        width: 0;
        height: 0;
        border: 11px solid transparent;
        border-bottom-color: #f4f5fa;
      }
    }
    .overview {
      height: 52px;
      line-height: 52px;
      border-bottom: $border;
      box-sizing: border-box;
      color: #666;
    }
    .icon {
      width: 8px;
      height: 8px;
      border-radius: 100%;
      margin: 4px 8px 4px 16px;
      &.normal {
        background: #01d787;
      }
      &.medium {
        background: #fc8c43;
      }
      &.serious {
        background: #f04346;
      }
    }
    .wrapper {
      padding-top: 20px;
    }
    .footer {
      height: 0;
      flex: 1;
      overflow-y: auto;
      padding: 20px;
      box-sizing: border-box;
      border-top: $border;
      background-color: #fff;
      display: flex;
      justify-content: space-between;
      flex-wrap: wrap;
      .u-line-chart {
        width: 49%;
      }
    }
  }
}
</style>

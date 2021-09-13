<template>
  <div class="u-ring-chart">
    <!-- <div class="title">{{title}}</div> -->
    <div ref="chart" class="chart"></div>
    <!-- <div class="label-used g-flex-ac" :style="usedLabelStyle">
      <div class="icon" :style="usedLegendStyle"></div>
      {{used}}%
    </div> -->
    <!-- <div class="label-unused g-flex-ac" :style="unusedLabelStyle">
      <div class="icon" :style="unusedLegendStyle"></div>
      {{100 - used}}%
    </div> -->
    <div class="legend g-flex-ac">
      <div class="legend-used g-flex-ac">
        <div class="icon" :style="usedLegendStyle"></div>
        <div>{{usedLegend}}<span :style="usedNumStyle">{{usedNum}}</span>{{unit}}</div>
      </div>
      <div class="legend-unused g-flex-ac">
        <div class="icon" :style="unusedLegendStyle"></div>
        <div>{{unusedLegend}}<span :style="unusedNumStyle">{{unusedNum}}</span>{{unit}}</div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import echarts from 'echarts';
import { debounce, isArray } from 'lodash';
import { calcDecimalLength } from './utils';

@Component
export default class URingChart extends Vue {
  @Prop({
    default: ''
  })
  private title!: string;

  @Prop({
    default: 0
  })
  private used!: number;

  @Prop({
    default: ''
  })
  private usedLegend!: string;

  @Prop({
    default: ''
  })
  private unusedLegend!: string;

  @Prop()
  private usedColor!: any;

  @Prop()
  private unusedColor!: any;

  @Prop({
    default: 0
  })
  private usedNum!: number;

  @Prop({
    default: 0
  })
  private totalNum!: number;

  @Prop()
  private usedNumColor!: string;

  @Prop()
  private unusedNumColor!: string;

  @Prop()
  private unit!: string;

  private chart: any;
  private debounceResize: any;

  private get usedLabelStyle() {
    const colors = this.usedColor.legend;
    return {
      color: typeof colors === 'string' ? colors : '#3B68B7'
    };
  }

  private get unusedLabelStyle() {
    return {
      color: '#687381'
    };
  }

  private get usedLegendStyle() {
    const colors = this.usedColor.legend;
    return this.getStyleByColors(colors);
  }

  private get unusedLegendStyle() {
    const colors = this.unusedColor.legend;
    return this.getStyleByColors(colors);
  }

  private get usedNumStyle() {
    return {
      color: this.usedNumColor,
      margin: '0 2px',
      fontSize: '20px'
    };
  }

  private get unusedNumStyle() {
    return {
      color: this.usedColor.legend, // 原是#666 改成传入统一色调
      margin: '0 2px',
      fontSize: '20px'
    };
  }

  private get unusedNum() {
    const num = this.totalNum - this.usedNum;
    const dl = calcDecimalLength(num);
    return parseFloat('' + (dl > 1 ? num.toFixed(1) : num));
  }

  public resize() {
    this.chart && this.chart.resize();
  }

  public setOptions() {
    this.chart.setOption(this.getOptions());
  }

  private mounted() {
    this.init();
    this.debounceResize = debounce(this.resize.bind(this), 100);
    window.addEventListener('resize', this.debounceResize);
  }

  private destroyed() {
    window.removeEventListener('resize', this.debounceResize);
  }

  private init() {
    const dom = this.$refs.chart as any;
    this.chart = echarts.init(dom);
    this.chart.setOption(this.getOptions());
  }

  private getOptions() {
    let that = this;
    return {
      legend: {
        show: false
      },
      title: {
        text: that.used + '%',
        left: "center",
        top: "30%",
        textStyle: {
          color: "#222",
          fontSize: 22,
          fontWeight: 600,
          align: "center"
        }
      },
      graphic: {
        type: "text",
        left: "center",
        top: "60%",
        style: {
          text: that.usedLegend,
          textAlign: "center",
          fill: "#222",
          fontSize: 16

        }
      },
      series: [{
        type: 'pie',
        radius: ['70%', '92%'],
        avoidLabelOverlap: false,
        silent: true,
        label: {
          show: false
        },
        labelLine: {
          show: false
        },
        itemStyle: {
          borderWidth: 2,
          borderColor: '#fff'
        },
        data: [{
          value: 20,
          itemStyle: {
            color: '#CED3DB'
          }
        }, {
          value: 20,
          itemStyle: {
            color: '#CED3DB'
          }
        }, {
          value: 20,
          itemStyle: {
            color: '#CED3DB'
          }
        }, {
          value: 20,
          itemStyle: {
            color: '#CED3DB'
          }
        }, {
          value: 20,
          itemStyle: {
            color: '#CED3DB'
          }
        }]
      }, {
        type: 'pie',
        radius: ['70%', '100%'],
        avoidLabelOverlap: false,
        silent: true,
        label: {
          show: true
        },
        labelLine: {
          show: false
        },
        data: [{
          value: this.used,
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [{
              offset: 0,
              color: this.usedColor.chart[0]
            }, {
              offset: 1,
              color: this.usedColor.chart[1]
            }])
          }
        }, {
          value: 100 - this.used,
          itemStyle: {
            color: 'transparent'
          }
        }]
      }]
    };
  }

  private getStyleByColors(colors: any) {
    if (colors) {
      if (typeof colors === 'string') {
        return {
          background: colors
        };
      }
      if (isArray(colors) && colors.length) {
        if (colors.length === 1) {
          return {
            background: colors[0]
          };
        }
        return {
          background: `linear-gradient(${colors[0]}, ${colors[1]})`
        };
      }
    }
    return {};
  }
}
</script>

<style lang="scss">
.u-ring-chart {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  flex-direction: column;
  .title {
    font-size: 16px;
    color: #262626;
    padding-bottom: 24px;
    flex-shrink: 0;
  }
  .chart {
    flex: 1;
    height: 0;
  }
  .label-used {
    font-size: 16px;
    position: absolute;
    top: 68px;
    right: calc(50% - 118px);
  }
  .label-unused {
    font-size: 14px;
    color: #707580;
    position: absolute;
    bottom: 58px;
    left: calc(50% - 118px);
  }
  .legend {
    padding-top: 24px;
    flex-shrink: 0;
    justify-content: center;
    font-size: 12px;
    color: #262626;
    &-used {
      width: 50%;
      justify-content: flex-end;
      padding-right: 12px;
      box-sizing: border-box;
    }
    &-unused {
      width: 50%;
      padding-left: 12px;
      box-sizing: border-box;
    }
  }
  .icon {
    width: 6px;
    height: 6px;
    border-radius: 6px;
    margin-right: 6px;
    margin-top: 3px;
  }
}
</style>

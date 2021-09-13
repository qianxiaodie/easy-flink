<template>
  <div class="u-line-chart">
    <div class="title">评判标准：</div>
    <div class="desc">{{desc}}</div>
    <div class="title">监测数据：</div>
    <div ref="chart" class="chart"></div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import echarts from 'echarts';
import { ILineChart, ILineChartInfo } from '@/utils/types';
import { debounce } from 'lodash';
import { calcNumberArrayUnit, formatNumericalValue } from './utils';

const SERIES_COLORS = [
  "rgb(91, 161, 242)",
  "rgb(78, 201, 171)",
  "rgb(255, 174, 60)",
  "rgb(158, 156, 246)",
  "rgb(30, 192, 216)",
  "rgb(237, 139, 204)",
  "rgb(138, 209, 153)",
  "rgb(103, 197, 245)",
  "rgb(138, 205, 78)",
  "rgb(245, 131, 122)",
  "rgb(198, 156, 246)",
  "rgb(137, 170, 247)",
  "rgb(251, 155, 108)",
  "rgb(103, 170, 245)",
  "rgb(134, 187,231)",
  "rgb(245, 196, 80)",
  "rgb(135, 206, 232)",
  "rgb(239, 216, 22)",
  "rgb(92, 208, 133)",
  "rgb(241, 126, 248)"
];

@Component
export default class ULineChart extends Vue {
  @Prop({
    default() {
      return {};
    }
  })
  private chart!: ILineChart;

  private chartComp: any;
  private debounceResize: any;

  @Watch('chart')
  private onChartChanged() {
    this.init();
  }

  private get desc() {
    let desc = this.chart.describe || '';
    desc = desc.replace(/NORMAL/g, '正常');
    desc = desc.replace(/MEDIUM/g, '异常');
    desc = desc.replace(/SERIOUS/g, '严重');
    return desc;
  }

  public resize() {
    this.chartComp && this.chartComp.resize();
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
    if (!this.chartComp) {
      const dom = this.$refs.chart as any;
      this.chartComp = echarts.init(dom);
    }
    if (this.chartComp) {
      this.chartComp.clear();
      this.chartComp.setOption(this.getOptions());
    }
  }

  private getOptions() {
    const chartInfo: ILineChartInfo = (this.chart && this.chart.chartJson) || {};
    const legendData: string[] = [];
    const seriesMap: any = {};
    (chartInfo.ySeries || []).forEach((s, index) => {
      legendData.push(s.label);
      if (!seriesMap[s.name]) {
        seriesMap[s.name] = {
          name: s.label,
          type: 'line',
          smooth: true,
          symbol: 'none',
          itemStyle: {
            normal: {
              lineStyle: {
                color: SERIES_COLORS[index]
              }
            }
          },
          data: []
        };
      }
    });
    const xAxisData: string[] = [];
    (chartInfo.data || []).forEach(d => {
      const time = new Date(Number(d.time)).format('MM-DD HH:mm');
      xAxisData.push(time);
      const keys = Object.keys(d);
      keys.forEach(key => {
        if (key === 'time') {
          return;
        }
        if (seriesMap[key]) {
          const data = seriesMap[key].data || (seriesMap[key].data = []);
          data.push(d[key]);
        }
      });
    });
    const series = Object.values(seriesMap);
    const datas = series.map((s: any) => s.data);
    const unit = calcNumberArrayUnit(datas);
    return {
      title: {
        text: chartInfo.title || ''
      },
      tooltip: {
        trigger: 'axis',
        confine: true,
        enterable: true,
        extraCssText: 'max-height: 150px;overflow-y: auto;',
        formatter: (params) => {
          const result: string[] = [];
          params[0] && result.push(params[0].axisValueLabel);
          params.forEach(p => {
            const str = p.marker + p.seriesName + ': ' + formatNumericalValue(p.data, unit, 3);
            result.push(str);
          });
          return result.join('<br/>');
        }
      },
      legend: {
        data: legendData,
        type: 'scroll'
      },
      color: SERIES_COLORS,
      xAxis: {
        type: 'category',
        boundaryGap: false,
        data: xAxisData,
        axisLine: {
          lineStyle: {
            color: '#d2d7e0'
          }
        },
        axisLabel: {
          textStyle: {
            fontSize: 12,
            color: '#333'
          },
          showMaxLabel: true
        }
      },
      yAxis: {
        type: 'value',
        name: chartInfo.unit || '',
        scale: true,
        nameTextStyle: {
          fontSize: 12,
          color: '#333'
        },
        axisLine: {
          lineStyle: {
            color: '#d2d7e0'
          }
        },
        axisLabel: {
          color: '#333',
          formatter: (val) => {
            return formatNumericalValue(val, unit, 1);
          }
        },
        splitLine: {
          lineStyle: {
            color: '#d2d7e0'
          }
        }
      },
      series
    };
  }
}
</script>

<style lang="scss">
.u-line-chart {
  .title {
    font-size: 14px;
    color: #666;
    margin-bottom: 8px;
  }
  .desc {
    font-size: 12px;
    color: #333;
    margin-bottom: 24px;
    word-break: break-all;
  }
  .chart {
    height: 300px;
  }
}
</style>

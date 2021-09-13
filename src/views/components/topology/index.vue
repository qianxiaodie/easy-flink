<template>
  <div ref="topology" class="u-topology">
    <div class="topology-tooltip">
      <p class="name"></p>
    </div>
    <ndc-button class="icon" icon="ndc-icon-refresh" @click="reset"></ndc-button>
    <svg width="600px" height="100px" style="position: absolute;top: -9999px;left: -9999px;">
      <defs>
        <marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto" markerUnits="strokeWidth">
          <path d="M0,0 L0,6 L9,3 z" fill="#eee" />
        </marker>
      </defs>
    </svg>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Watch } from 'vue-property-decorator';
import * as d3 from 'd3';
import { debounce, cloneDeep } from 'lodash';
import { ITopologyNode, ITopologyPredecessor, IPosition } from '@/utils/types';

@Component
export default class UTopology extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private topologyData!: ITopologyNode[];

  private svgContainer: any | null = null;
  private gContainer: any | null = null;
  private parentContainer: any | null = null;
  private zoom: any | null = null;
  private nodes: ITopologyNode[][] = [];
  private nodePosition: any = {};
  private lines: any[] = [];
  private debounceResize: any;
  private nodeValues: any = {};

  @Watch('topologyData')
  private onTopologyDataChanged() {
    this.topologyData.forEach(d => {
      if (d.edit && !d.defaultValue) {
        d.heap = d['off-heap'] = '';
      }
    });
    this.refresh();
  }

  public validate() {
    const topologyData = this.genData();
    for (let i = 0, len = topologyData.length; i < len; i++) {
      const node = topologyData[i];
      if (!node.edit) {
        continue;
      }
      if (node.heap === '' || node.heap === undefined || node.heap === null) {
        return '可编辑节点的 heap 不能为空';
      }
      if (Number(node.heap) < 0 || Number(node.heap) > 8192) {
        return '可编辑节点的 heap 值为 0 - 8192 之间的整数';
      }
      if (node['off-heap'] === '' || node['off-heap'] === undefined || node['off-heap'] === null) {
        return '可编辑节点的 off-heap 不能为空';
      }
      if (Number(node['off-heap']) < 0 || Number(node['off-heap']) > 8192) {
        return '可编辑节点的 off-heap 值为 0 - 8192 之间的整数';
      }
    }
    return '';
  }

  public genData() {
    const cloneData = cloneDeep(this.topologyData);
    for (let i = 0, len = cloneData.length; i < len; i++) {
      const node = cloneData[i];
      if (!node.edit) {
        continue;
      }
      const value = this.nodeValues[`node_${node.id}`];
      if (!value) {
        continue;
      }
      node.heap = value.heap;
      node['off-heap'] = value['off-heap'];
      if (node.edit && node.heap && node['off-heap']) {
        node.defaultValue = true;
      }
    }
    return cloneData;
  }

  private mounted() {
    this.refresh();
    this.debounceResize = debounce(this.refresh.bind(this), 100);
    window.addEventListener('resize', this.debounceResize);
  }

  private beforeDestroyed() {
    window.removeEventListener('resize', this.debounceResize);
  }

  public refresh() {
    this.svgContainer && this.svgContainer.remove();
    const topology: any = this.$refs.topology;
    if (!topology) {
      return;
    }

    this.nodePosition = {};
    this.nodes = this.parseNodes();
    const xlevel = this.nodes.length;
    let ylevel = 0;
    this.nodes.forEach(n => {
      if (n.length > ylevel) {
        ylevel = n.length;
      }
    });
    const width = xlevel * 160 + (xlevel + 1) * 136;
    const height = ylevel * 230 + (ylevel + 1) * 50;

    const rect = topology.getBoundingClientRect();
    const svgContainer = this.svgContainer = d3.select(topology).append('svg').attr('width', `${Math.max(rect.width, width)}px`).attr('height', `${Math.max(rect.height, height)}px`).attr('style', 'overflow: visible');
    svgContainer.on('zoom', null);
    svgContainer.attr('transform', `translate(0, -${(Math.max(rect.height, height) - rect.height) / 2})`);
    this.gContainer && this.gContainer.remove();
    const gContainer = this.gContainer = svgContainer.append('g').attr('transform', 'translate(0, 0)');
    this.parentContainer = this.gContainer.append('foreignObject').attr('width', '100%').attr('height', '100%').append('xhtml:div').attr('class', 'u-topology-panel').attr('style', `height: ${Math.max(rect.height, height)}px`);

    const zoom = this.zoom = d3.zoom().scaleExtent([0.5, 5]).on('zoom', () => {
      gContainer.attr('transform', `translate(${d3.event.transform.x}, ${d3.event.transform.y}) scale(${d3.event.transform.k})`);
    });

    svgContainer.call(zoom).call(zoom.transform, d3.zoomIdentity);

    this.drawNodes();

    this.lines = this.parseLines();
    this.drawLines();
  }

  private parseNodes() {
    const nodes: ITopologyNode[][] = [];
    this.parseLevelNodes(nodes, 0, cloneDeep(this.topologyData));
    return nodes;
  }

  private parseLevelNodes(nodes: ITopologyNode[][], level: number = 0, data: ITopologyNode[]) {
    const levels: ITopologyNode[] = [];
    const nextNodes: ITopologyNode[] = [];
    for (let i = 0, len = data.length; i < len; i++) {
      const node = data[i];
      const predecessors = node.predecessors || [];
      if (level === 0 && !predecessors.length) {
        node.level = level;
        levels.push(node);
        continue;
      }
      const preNodeIds = this.getPreNodeIds(nodes, level);
      const ids = predecessors.filter(p => preNodeIds.includes(p.id));
      if (ids.length === predecessors.length) {
        node.level = level;
        levels.push(node);
        continue;
      }
      nextNodes.push(node);
    }
    nodes.push(levels);
    if (nextNodes.length) {
      this.parseLevelNodes(nodes, ++level, nextNodes);
    }
  }

  private getPreNodeIds(nodes: ITopologyNode[][], level: number) {
    let ids: number[] = [];
    for (let i = 0; i < level; i++) {
      const preIds = nodes[i].map(n => n.id);
      ids = ids.concat(preIds);
    }
    return ids;
  }

  private drawNodes() {
    if (!this.parentContainer) {
      return;
    }
    this.nodes.forEach((node, index) => {
      const pDom = this.parentContainer.append('div').attr('class', `u-topology-level level_${index}`).attr('width', 200);
      node.forEach(n => {
        const dom = pDom.append('div').attr('class', `u-topology-node node_${n.id}`);
        if (n.edit) {
          dom.classed('active', true);
        }
        const descDom = dom.append('div').attr('class', 'node-desc');
        descDom.append('div').attr('class', 'desc-pact').text(n.pact);
        descDom.append('div').attr('class', 'desc-id').text(`(ID=${n.id})`);
        descDom.append('div').attr('class', 'desc-content').text(n.contents);
        const operatorDom = dom.append('div').attr('class', 'node-operator');
        if (n.edit) {
          const key = `node_${n.id}`;
          !this.nodeValues[key] && (this.nodeValues[key] = {});
          this.nodeValues[key].heap = n.heap;
          this.nodeValues[key]['off-heap'] = n['off-heap'];
          let itemDom = operatorDom.append('div').attr('class', 'ope-item');
          itemDom.append('div').attr('class', 'label').text('heap');
          itemDom.append('input').attr('class', 'node-heap ndc-input').attr('value', n.heap).on('input', () => {
            this.onInput(key, 'heap');
          }).on('dblclick', () => {
            this.onDblClick();
          });
          itemDom.append('i').attr('class', 'icon-tooltip ndc-icon-question').on('mouseover', () => {
            this.onMouseOver('请根据单并发流量和udf任务逻辑分配内存');
          }).on('mouseout', () => {
            this.onMouseOut();
          });
          itemDom = operatorDom.append('div').attr('class', 'ope-item');
          itemDom.append('div').attr('class', 'label').text('off-heap');
          itemDom.append('input').attr('class', 'node-offheap ndc-input').attr('value', n['off-heap']).on('input', () => {
            this.onInput(key, 'off-heap');
          }).on('dblclick', () => {
            this.onDblClick();
          });
          itemDom.append('i').attr('class', 'icon-tooltip ndc-icon-question').on('mouseover', () => {
            this.onMouseOver('如果自定义函数会使用堆外内存，请根据使用的外部依赖开辟的堆外内存参数配置', 24);
          }).on('mouseout', () => {
            this.onMouseOut();
          });
        } else {
          let itemDom = operatorDom.append('div').attr('class', 'ope-item');
          itemDom.append('div').attr('class', 'desc').text(`heap: ${n.heap}`);
          itemDom = operatorDom.append('div').attr('class', 'ope-item');
          itemDom.append('div').attr('class', 'desc').text(`off-heap: ${n['off-heap']}`);
        }
      });
    });
  }

  private parseLines() {
    this.nodes.forEach(level => {
      level.forEach(node => {
        const key = `node_${node.id}`;
        !this.nodePosition[key] && (this.nodePosition[key] = this.getPosition(key));
      });
    });
    const lines: any[] = [];
    this.nodes.forEach(level => {
      level.forEach(node => {
        const predecessors = node.predecessors || [];
        const pos = this.nodePosition[`node_${node.id}`];
        if (!pos || !pos.pre) {
          return;
        }
        predecessors.forEach(p => {
          const pPos = this.nodePosition[`node_${p.id}`];
          if (!pPos || !pPos.next) {
            return;
          }
          lines.push({
            key: `line_${p.id}_${node.id}`,
            start: pPos.next,
            end: pos.pre,
            desc: p.ship_strategy
          });
        });
      });
    });
    return lines;
  }

  private drawLines() {
    if (!this.gContainer) {
      return;
    }
    this.lines.forEach(line => {
      const { key, start, end, desc } = line;
      this.gContainer.append('path').attr('id', key).attr('d', `M${start.x},${start.y} L${end.x},${end.y}`).attr('stroke', '#424d69').attr('stroke-width', 1);
      const textPos = this.calcTextPosition(start, end);
      this.gContainer.append('rect').attr('class', `rect_${key} line-rect`);
      this.gContainer.append('text').attr('class', `text_${key} line-text`).attr('style', 'text-anchor: middle').attr('x', textPos.x).attr('y', textPos.y).text(desc);
    });
    this.lines.forEach(line => {
      const { key = '' } = line || {};
      if (!key) {
        return;
      }
      const textDom = this.$el.getElementsByClassName(`text_${key}`)[0] as SVGGraphicsElement;
      const bbox = textDom.getBBox();
      const rect = this.gContainer.select(`.rect_${key}`);
      rect.attr('rx', 2).attr('ry', 2).attr('x', bbox.x - 8).attr('y', bbox.y - 8).attr('width', bbox.width + 16).attr('height', bbox.height + 16).attr('fill', 'white').attr('stroke', '#424d69');
    });
  }

  private getPosition(className: string) {
    const doms = this.$el.getElementsByClassName(className);
    if (!doms.length) {
      return null;
    }
    const dom: any = doms[0];
    if (dom) {
      const y = dom.offsetTop + dom.offsetHeight / 2;
      return {
        pre: {
          x: dom.offsetLeft,
          y
        },
        next: {
          x: dom.offsetLeft + dom.offsetWidth,
          y
        }
      };
    }
    return null;
  }

  private calcTextPosition(start: IPosition, end: IPosition) {
    const minX = Math.min(start.x, end.x);
    const minY = Math.min(start.y, end.y);
    return {
      x: minX + Math.abs(start.x - end.x) / 2,
      y: minY + Math.abs(start.y - end.y) / 2 + 4
    };
  }

  private reset() {
    this.svgContainer && this.svgContainer.transition().duration(500).call(this.zoom.transform, d3.zoomIdentity);
  }

  private onInput(key: string, type: string) {
    let value = d3.event.target.value || '';
    value = value.replace(/[^\d]/g, '');
    if (+value > 8192) {
      value = 8192;
    }
    if (+value < 0) {
      value = 0;
    }
    d3.event.target.value = value;
    this.nodeValues[key][type] = value === '' ? value : Number(d3.event.target.value);
  }

  private onDblClick() {
    d3.event.stopPropagation();
  }

  private onMouseOver(text: string, offsetY = 0) {
    const transform = d3.event;
    const rect = transform.target.getBoundingClientRect();
    const yPosition = rect.y - 20 - offsetY;
    const xPosition = rect.x - 150;
    const tooltip = d3.select('.topology-tooltip').style('left', xPosition + 'px').style('top', yPosition + 'px');
    tooltip.select('.name').text(text);
    tooltip.classed('hidden', false);
  }

  private onMouseOut() {
    d3.select('.topology-tooltip').classed('hidden', true);
  }
}
</script>

<style lang="scss">
.u-topology {
  width: 100%;
  height: 100%;
  .topology-tooltip {
    position: fixed;
    z-index: 10;
    width: 300px;
    height: auto;
    padding-left: 10px;
    box-sizing: border-box;
    background-color: white;
    border-radius: 5px;
    box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.4);
    pointer-events: none;
  }
  .topology-tooltip.hidden {
    display: none;
  }
  .topology-tooltip p {
    margin: 0;
    font-size: 14px;
    text-align: left;
  }
  .icon {
    position: absolute;
    z-index: 9;
    padding: 0;
    min-width: 0;
    width: 32px;
    .ndc-button-icon {
      margin: 0;
    }
  }
  &-level {
    margin-left: 136px;
    display: flex;
    flex-direction: column;
    justify-content: center;
    &:first-child {
      margin-left: 50px;
    }
  }
  &-node {
    margin-bottom: 50px;
    width: 160px;
    height: 230px;
    border: 1px solid #424d69;
    border-radius: 4px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    &.active {
      border-color: #3B68B7;
      .node-desc {
        border-color: #3B68B7;
      }
    }
    .node-desc {
      height: 0;
      flex: 1;
      font-size: 12px;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 12px;
      box-sizing: border-box;
      border-bottom: 1px solid #424d69;
      .desc-pact,
      .desc-id {
        line-height: 24px;
        word-break: break-all;
        color: #3B68B7;
      }
      .desc-content {
        margin-top: 24px;
        line-height: 24px;
        word-break: break-all;
        overflow: auto;
      }
    }
    .node-operator {
      font-size: 12px;
      background-color: #f4f6fa;
      border-radius: 4px;
      .ope-item {
        display: flex;
        align-items: center;
        line-height: 24px;
        padding: 2px 10px;
        .desc {
          width: 100%;
          text-align: center;
        }
        .label {
          width: 60px;
          flex-shrink: 0;
        }
        .icon-tooltip {
          margin-left: 4px;
          cursor: pointer;
          font-size: 16px;
          color: #ffaf0f;
        }
      }
    }
    &:last-child {
      margin-bottom: 0;
    }
  }
  &-panel {
    width: 100%;
    height: 100%;
    display: flex;
  }
  .ndc-input {
    height: 24px;
    line-height: 24px;
    border-radius: 2px;
    font-size: 12px;
    flex: 1;
    width: 0;
    background: #fff;
  }
  .line-text {
    font-size: 12px;
  }
}
</style>

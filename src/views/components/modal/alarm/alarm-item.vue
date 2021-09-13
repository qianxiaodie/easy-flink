<template>
  <div class="u-alarm-item g-flex-ac">
    <div v-if="field === 'metricType'">
      <!-- <ndc-select :class="field" v-if="optional" :options="metricTypes" label-key="value" value-key="id" v-model="alarm[field]" @change="onChange"></ndc-select>
      <span class="qqq" v-else>{{metricTypesMap[alarm[field]]}}</span> -->
      <span class="qqq" >{{metricTypesMap[alarm[field]]}}</span>
    </div>
    <div class="g-flex-ac" v-else-if="field === 'alarmInterval'">
      <div class="g-mr-16">报警间隔</div>
      <input class="ndc-input" :class="field" @input="inputchange" v-number="{'min': 1}" v-model="alarm[field]" />
      <span v-if="config.unit !== '-1'" class="unit">{{config.unit}}</span>
    </div>
    <ndc-select :class="field" v-else-if="config.type === '1'" :options="config.value" label-key="value" value-key="id" v-model="alarm[field]"></ndc-select>
    <div class="g-flex-ac" v-else-if="config.type === '2'">
      <input class="ndc-input" :class="[field, config.unit === 'QPS' ? 'qps' : '']" v-number="{'min': 1}" v-model="alarm[field]" />
      <span v-if="config.unit !== '-1'" class="unit">{{config.unit}}</span>
    </div>
    <div class="g-flex-ac" v-else-if="config.type === '3'">
      <input v-if="field === 'metricName'" class="ndc-input" style="width: 148px;" :class="[field, config.unit === 'QPS' ? 'qps' : '']" v-model="alarm[field]" placeholder="指标名" />
      <input v-else class="ndc-input" :class="[field, config.unit === 'QPS' ? 'qps' : '']" v-model="alarm[field]" />
      <span v-if="config.unit !== '-1'" class="unit">{{config.unit}}</span>
    </div>
    <span class="www" v-else>{{alarm[field]}}</span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IAlarmConfigMetaItem } from '@utils/types';

@Component
export default class UAlarmItem extends Vue {
  @Prop({
    default: ''
  })
  private field!: string;

  @Prop({
    default: {}
  })
  private config!: IAlarmConfigMetaItem;

  @Prop({
    default() {
      return [];
    }
  })
  private metricTypes!: any[];

  @Prop({
    default() {
      return {};
    }
  })
  private alarm!: any;

  @Prop({
    default() {
      return {};
    }
  })
  private metricTypesMap!: any;

  @Prop({
    default: false
  })
  private optional!: boolean;

  created() {
    console.log(this.metricTypesMap, 'metricTypesMap', this.alarm['alarmInterval']);
  }

  private onChange(val: string) {
    this.$emit('change', val);
  }

  private inputchange(e:any) {
    const target = e.target as any;
    const val = target.value;
    this.$emit('inputchange', this.alarm);

    // console.log(val,this.config,this.alarm,'params2')
  }
}
</script>

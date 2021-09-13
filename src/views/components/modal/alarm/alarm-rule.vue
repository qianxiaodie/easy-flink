<template>
<!-- <div> -->
  <!-- <div  class="col" v-for="col in columnSeq" :key="col" :class="[col, 'rule', rule[col] === -1 || rule[col] === '-1' || col === 'id' || col === 'optional' ? 'hidden' : '']">
    <div class="col-mar" v-if="col === 'metricType'">
     {{metricTypesMap[alarm[col]]}}
    </div>
  </div> -->
  <div class="u-alarm-rule g-flex-ac" :class="alarm['metricType']">
    <div class="col" v-for="col in columnSeq" :key="col" :class="[col, 'rule', rule[col] === -1 || rule[col] === '-1' || col === 'id' || col === 'optional' ? 'hidden' : '']">
      <u-alarm-item
        v-if="(rule[col] !== '-1' || rule[col] !== -1) && col !== 'id' && col !== 'optional'"
        :metric-types="metricTypes"
        :metric-types-map="metricTypesMap"
        :config="rule[col]"
        :optional="rule.optional"
        :alarm="alarm"
        :field="col"
        @inputchange="inputchange"
        @change="onChange"
      ></u-alarm-item>
    </div>
  <!-- </div> -->
</div>

</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import UAlarmItem from './alarm-item.vue';
import { IAlarmConfigMeta } from '../../../../utils/types';

@Component({
  components: {
    UAlarmItem
  }
})
export default class UAlarmRule extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private columnSeq!: string[];

  @Prop({
    default() {
      return {};
    }
  })
  private rule!: IAlarmConfigMeta;

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

  private onChange(val: string) {
    this.$emit('change', val);
  }

  private inputchange(val: string) {
    this.$emit('inputchange', val);
    // console.log(val,'params22')
  }
}
</script>

<style lang="scss" scoped>
.col-mar{
  margin-left: 8px;
}
</style>

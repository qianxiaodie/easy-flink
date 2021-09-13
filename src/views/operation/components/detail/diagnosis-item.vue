<template>
  <div class="m-diagnosis-item" :class="{'active': active}" @click="onClick">
    <div class="type" :class="this.status && this.status.toLocaleLowerCase() || ''">
      <i :class="imgClass" />
    </div>
    <div class="label">{{categoryDesc}}</div>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

const CLASS_MAP = {
  MEMORY: 'memory',
  GC: 'gc',
  SOCKET: 'link',
  OVERSTOCK: 'data'
};

const CATEGORY_MAP = {
  MEMORY: '内存',
  GC: 'GC',
  SOCKET: '连接数',
  OVERSTOCK: '数据积压'
};

@Component
export default class MDiagnosisItem extends Vue {
  @Prop({
    default: false
  })
  private active!: boolean;

  @Prop({
    default: ''
  })
  private label!: string;

  @Prop({
    default: 'NORMAL'
  })
  private status!: string;

  private get imgClass() {
    return `img sloth-icon-${CLASS_MAP[this.label]}`;
  }

  private get categoryDesc() {
    return CATEGORY_MAP[this.label];
  }

  private onClick() {
    this.$emit('click');
  }
}
</script>

<style lang="scss">
.m-diagnosis-item {
  width: 100px;
  cursor: pointer;
  box-sizing: border-box;
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  &:before {
    position: absolute;
    content: '';
    height: 3px;
    width: 0;
    border-radius: 100px 100px 0 0;
    background: #2b75f6;
    bottom: -1px;
    left: 50%;
    transform: translateX(-50%);
    transition: width .3s;
  }
  .type {
    font-size: 26px;
    height: 26px;
    text-align: center;
    color: #01d787;
    &.medium {
      color: #fc8c43;
    }
    &.serious {
      color: #f04346;
    }
  }
  .label {
    color: #262626;
    margin: 12px 0;
  }
  &:hover,
  &.active {
    &:before {
      width: calc(100% - 48px);
    }
  }
}
</style>

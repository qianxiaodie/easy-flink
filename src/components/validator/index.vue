<template>
  <div class="u-validator" :class="{'inline': inline, 'invalid': content, 'valid': !content}">
    <slot></slot>
    <span v-if="content" class="error" :class="{'border': isBorder}">
      <i class="ndc-icon-warn-solid" />
      {{content}}
    </span>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';

@Component
export default class UValidator extends Vue {
  @Prop({
    default: false
  })
  private inline!: boolean

  @Prop({
    required: true
  })
  private name!: string

  @Prop({
    default: false
  })
  private isBorder!: boolean

  @Prop({
    default() {
      return {};
    }
  })
  private validate: any

  private mounted(){
    console.log('validate',this.content,this.validate)
  }

  private get content() {
    const { validate, name } = this;
    // console.log({ validate, name })
    // debugger
    // console.log(validate.first(name))

    return (validate.first && validate.first(name)) || '';
  }
}
</script>

<style lang="scss" scoped>
@mixin border {
  top: initial;
  bottom: calc(100% - 16px);
  left: auto;
  right: -16px;
  padding: 4px;
  background-color: #fa8675;
  color: #fff;
  white-space: nowrap;
  border-radius: 4px;
  .icon-warn-solid {
    display: inline-block;
    margin-right: 4px;
    margin-left: 2px;
    margin-top: -2px;
  }
}

.u-validator {
  position: relative;
  .error {
    /*position: absolute;*/
    left: 0;
    top: calc(100% + 2px);
    z-index: 9;
    /*margin-bottom: 6px;*/
    color: #f04346;
    font-size: 12px;
    line-height: 20px;
    &.border {
      @include border;
      &:after {
        content: '';
        position: absolute;
        bottom: 0;
        left: 40px;
        margin: -4px;
        border-top: 4px solid #fa8675;
        border-right: 4px solid transparent;
        border-left: 4px solid transparent;
      }
    }
  }
  &.inline {
    display: flex;
    align-items: center;
    .error {
      position: static;
      background: none;
      color: #f04346;
      font-size: 12px;
      margin-left: 10px;
      margin-bottom: 0;
      line-height: 32px;
      &.border {
        @include border;
        left: 0;
        line-height: 28px;
        padding: 0 4px;
        position: relative;
        &:after {
          display: none;
        }
        &:before {
          content: '';
          position: absolute;
          bottom: 50%;
          left: 0;
          margin: -4px;
          border-right: 4px solid #fa8675;
          border-top: 4px solid transparent;
          border-bottom: 4px solid transparent;
        }
      }
    }
  }
}
</style>

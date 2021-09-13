<template>
  <ndc-form-item class="u-config-item" label="配置">
    <div class="config">
      <div class="config-header g-flex-ac">
        <div class="td">键</div>
        <div class="td">值</div>
      </div>
      <div class="config-row g-flex-ac" v-for="(item, index) in value" :key="item.uuid">
        <u-validator :name="item.uuid + '_key'" :validate="errors">
          <input type="text" :name="item.uuid + '_key'" class="ndc-input" autocomplete="off" :disabled="disabled || item.default" @input="validateConfig(item)" v-model="item.key" />
        </u-validator>
        <u-validator class="g-ml-16" :name="item.uuid + '_value'" :validate="errors">
          <input type="text" :name="item.uuid + '_value'" class="ndc-input" autocomplete="off" :disabled="disabled" @input="validateConfig(item)" v-model="item.value" />
        </u-validator>
        <i v-if="!disabled" class="ndc-icon-close g-ml-8" :class="{'disabled': item.default}" @click="removeRule(item, index)" />
      </div>
      <div v-if="!disabled" class="config-btn" @click="addRule">+</div>
    </div>
  </ndc-form-item>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { v1 } from 'uuid';

@Component
export default class UConfigItem extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private value!: any[];

  @Prop({
    default: false
  })
  private disabled!: boolean;

  private addRule() {
    this.value.push({
      key: '',
      value: '',
      default: false,
      uuid: v1()
    });
  }

  private removeRule(item, index) {
    if (item.default) {
      return;
    }
    const uuid = item.uuid;
    if (uuid) {
      this.removeValidatorError(`${uuid}_key`);
      this.removeValidatorError(`${uuid}_value`);
    }
    this.value.splice(index, 1);
  }

  public validate() {
    let valid = true;
    for (let i = 0, len = (this.value || []).length; i < len; i++) {
      const v = this.validateConfig(this.value[i]);
      if (valid && !v) {
        valid = false;
      }
    }
    return valid;
  }

  private validateConfig(config, key?: string): boolean {
    let valid = true;
    const keys = (this.value || []).filter(i => i.uuid !== config.uuid).map(i => i.key || '').filter(Boolean);
    if (config.key) {
      if (config.value) {
        this.removeValidatorError(`${config.uuid}_value`);
      } else {
        this.addValidatorError(`${config.uuid}_value`, '值不能为空');
        valid = false;
      }
      if (keys.includes(config.key)) {
        this.addValidatorError(`${config.uuid}_key`, '键重复');
        valid = false;
      } else {
        keys.push(config.key);
        this.removeValidatorError(`${config.uuid}_key`);
      }
    } else {
      if (config.value) {
        this.addValidatorError(`${config.uuid}_key`, '键不能为空');
        valid = false;
      } else {
        this.removeValidatorError(`${config.uuid}_key`);
      }
    }
    return valid;
  }

  private removeValidatorError(field: string) {
    this.errors.remove(field);
  }

  private addValidatorError(field: string, msg: string) {
    this.removeValidatorError(field);
    this.errors.add({
      field,
      msg
    });
  }
}
</script>

<style lang="scss">
.u-config-item {
  .config {
    width: 100%;
    display: flex;
    flex-direction: column;
    line-height: 32px;
    &-header {
      width: 100%;
      border-bottom: $border;
      .td {
        width: 49%;
      }
    }
    &-row {
      height: 40px;
      margin-bottom: 8px;
      .ndc-input {
        height: 32px !important;
        line-height: 32px !important;
      }
      .ndc-icon-close {
        cursor: pointer;
        &.disabled {
          cursor: not-allowed;
        }
      }
    }
    &-btn {
      border-radius: 4px;
      width: 100%;
      border: $border;
      text-align: center;
      user-select: none;
      margin-top: 8px;
      cursor: pointer;
      &:hover {
        border-color: $active_color;
      }
    }
    .u-validator .error {
      top: calc(100% - 2px);
    }
  }
}
</style>

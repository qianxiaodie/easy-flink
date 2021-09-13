<template>
  <ndc-form-item class="u-field-item" label="普通字段" required>
    <u-validator name="fields" :validate="errors">
      <div class="fields">
        <div class="fields-header g-flex-ac">
          <div class="td">列名</div>
          <div class="td">类型</div>
          <div class="td">描述</div>
        </div>
        <div class="fields-row g-flex-ac" v-for="(item, index) in value" :key="item.uuid">
          <u-validator :name="item.uuid + '_name'" :validate="errors">
            <input type="text" :name="item.uuid + '_name'" class="ndc-input" autocomplete="off" @input="validateField(item)" v-model="item.name" />
          </u-validator>
          <u-validator class="g-ml-16" :name="item.uuid + '_type'" :validate="errors">
            <ndc-select
              :name="item.uuid + '_type'"
              placeholder="请选择类型"
              :options="typeOptions"
              @change="validateField(item)"
              v-model="item.type"
            >
              <template v-slot:option="scope">
                <span>{{scope.option.currentLabel}}</span>
              </template>
            </ndc-select>
          </u-validator>
          <u-validator class="g-ml-16" :name="item.uuid + '_desc'" :validate="errors">
            <input type="text" :name="item.uuid + '_desc'" class="ndc-input" autocomplete="off" v-model="item.comments" />
          </u-validator>
          <i class="ndc-icon-close g-ml-8" @click="removeField(item, index)" />
        </div>
        <div class="fields-btn" @click="addField">+</div>
      </div>
    </u-validator>
  </ndc-form-item>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { v1 } from 'uuid';

@Component
export default class UFieldItem extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private value!: any[];

  @Prop({
    default() {
      return [];
    }
  })
  private typeOptions!: any[];

  private addField() {
    this.value.push({
      name: '',
      type: '',
      comments: '',
      uuid: v1()
    });
    this.removeValidatorError('fields');
  }

  private removeField(item, index) {
    const uuid = item.uuid;
    if (uuid) {
      this.removeValidatorError(`${uuid}_name`);
      this.removeValidatorError(`${uuid}_desc`);
    }
    this.value.splice(index, 1);
    if (!this.value.length) {
      this.addValidatorError('fields', '字段不能为空');
    }
  }

  public validate() {
    let valid = true;
    if (this.value.length) {
      this.removeValidatorError('fields');
      for (let i = 0, len = this.value.length; i < len; i++) {
        const v = this.validateField(this.value[i]);
        if (valid && !v) {
          valid = false;
        }
      }
    } else {
      this.addValidatorError('fields', '字段不能为空');
      valid = false;
    }
    return valid;
  }

  private validateField(field): boolean {
    let valid = true;
    const uuid = field.uuid || '';
    if (field.name) {
      this.removeValidatorError(`${uuid}_name`);
    } else {
      this.addValidatorError(`${uuid}_name`, '列名不能为空');
      valid = false;
    }
    if (field.type) {
      this.removeValidatorError(`${uuid}_type`);
    } else {
      this.addValidatorError(`${uuid}_type`, '类型不能为空');
      valid = false;
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
.u-field-item {
  .fields {
    width: 100%;
    display: flex;
    flex-direction: column;
    line-height: 32px;
    &-header {
      width: 100%;
      border-bottom: $border;
      .td {
        width: 33%;
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

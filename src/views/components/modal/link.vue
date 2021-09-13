<template>
  <ndc-modal title="关联标签" closable class="m-link-modal" :visible="visible" @hide="onHide" :on-confirm="onModalConfirm" :width="480">
    <ndc-form>
      <ndc-form-item label="标签">
        <ndc-select :options="tags">
          <template v-slot:option="scope">
            <ndc-checkbox :value="selectedTagIds.includes(scope.option.id)" @change="onChange(arguments[0], scope.option)">
              <span :title="scope.option.name">{{scope.option.name}}</span>
            </ndc-checkbox>
          </template>
          <template v-slot:label>
            <div class="tags" v-if="selectedTagIds.length">
              <div class="tag g-flex-ac" v-for="(id, index) in selectedTagIds" :key="id">
                <span class="g-text-nowrap" :title="tagMap[id]">{{tagMap[id]}}</span>
                <div class="tag-close" @click.stop="remove(index)">
                  <i class="ndc-icon-close" />
                </div>
              </div>
            </div>
            <span v-else>请选择标签</span>
          </template>
        </ndc-select>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { ITag } from '@utils/types';
import { cloneDeep } from 'lodash';

@Component
export default class MLinkModal extends Mixins(ModalMixin) {
  private tags: ITag[] = [];
  private selectedTagIds: number[] = [];
  private tagMap: any = {};

  public show(data: any, callback?: any) {
    this.tags = data.tags || [];
    this.tagMap = {};
    this.tags.forEach(tag => {
      if (tag.id) {
        this.tagMap[tag.id] = tag.name;
      }
    });
    this.selectedTagIds = cloneDeep(data.selectedTagIds || []);
    this.showModal(data, callback);
  }

  private remove(index: number) {
    this.selectedTagIds.splice(index, 1);
  }

  private onModalConfirm() {
    return this.onConfirm(this.selectedTagIds);
  }

  private onChange(val: boolean, tag: ITag) {
    const index = this.selectedTagIds.findIndex(s => s === tag.id);
    if (val && index === -1) {
      this.selectedTagIds.push(tag.id);
    }
    if (!val && index !== -1) {
      this.selectedTagIds.splice(index, 1);
    }
  }
}
</script>

<style lang="scss">
.m-link-modal {
  .ndc-select {
    padding-right: 24px !important;
  }
  .ndc-select-panel {
    .ndc-select-option {
      padding: 0 16px;
      .ndc-checkbox {
        height: 32px;
        display: flex;
        align-items: center;
      }
    }
  }
  .tags {
    display: flex;
    flex-wrap: wrap;
    height: 100%;
    overflow: auto;
    .tag {
      position: relative;
      color: #333;
      font-size: 12px;
      line-height: 24px;
      border: $border;
      border-radius: 4px;
      box-sizing: border-box;
      padding: 0 24px 0 10px;
      margin: 4px;
      max-width: calc(100% - 8px);
      &-close {
        position: absolute;
        right: 4px;
        width: 16px;
        height: 16px;
        border-radius: 8px;
        flex-shrink: 0;
        &:hover {
          background: #e2e7f0;
        }
        .ndc-icon-close {
          font-size: 16px;
          display: block;
          transform: scale(0.5);
          color: #868f9e;
        }
      }
    }
  }
}
</style>

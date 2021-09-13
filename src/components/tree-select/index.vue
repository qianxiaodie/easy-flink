<template>
  <div class="u-tree-select">
    <u-select :options="options" :is-tree="true" @before-show="onBeforeShow" :value="value" :placeholder="placeholder" :track-key="trackKey" :label-key="labelKey" :expandedKeys="expandedKeys" :addResourceFlag="addResource" @change="onChange" @isSelectedFlag="isSelectedFlag">
      <template v-slot:label="scope">
        {{scope.option && ( scope.option.parentId === -1  ? scope.option.name : `/ root ${scope.option.name}` || scope.option[labelKey] || scope.option[trackKey]) || placeholder}}
      </template>
      <template v-slot:option="scope">
        <span class="g-flex-ac" @click="onClickNode(arguments[0], scope.option)">
          <span class="u-tree-select-space" v-for="(item, index) in scope.option.level - 1" :key="index"></span>
          <div v-if="scope.option.isFolder" class="u-tree-select-icon g-cursor-pointer" :class="{'expand': scope.option.expanded}" @click.stop="onClick(scope.option)">
            <i class="ndc-icon-drop-down"/>
          </div>
          <span class="u-tree-select-space" v-else></span>
          <slot name="option" :option="scope.option">
            <span class="g-text-nowrap" :title="scope.option[labelKey] || scope.option[trackKey]">{{scope.option[labelKey] || scope.option[trackKey]}}</span>
          </slot>
        </span>
      </template>
    </u-select>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop, Model, Watch } from 'vue-property-decorator';
import USelect from './select.vue';

import { ITreeOption } from '@utils/types';
import { treeToArray } from '@utils/index';
import childrenIndent from "ndc-antd/vc-table/demo/childrenIndent";

@Component({
  components: {
    USelect
  }
})
export default class UTreeSelect extends Vue {
  @Model('change', {
    type: [String, Number]
  })
  private value!: string | number;

  @Prop({
    default() {
      return [];
    }
  })
  private data!: ITreeOption[];

  @Prop({
    default: '请选择'
  })
  private placeholder!: string;

  @Prop({
    default: 'key'
  })
  private trackKey!: string;

  @Prop({
    default: 'label'
  })
  private labelKey!: string;

  @Prop({
    default: false
  })
  private folderDisabled!: boolean;

  @Prop({
    default: false
  })
  private showModalFlag!: boolean;

  @Prop({
    default: false
  })
  private addResource!: boolean;

  @Watch('showModalFlag')
  private onShowModalChange(val) {
    if (this.value) {
      this.expandedKeys.splice(0, this.expandedKeys.length);
      if (this.value === -1) {
        this.expandedKeys.push(-1 as unknown as string);
      } else {
        let done = false;
        let folderIds: any[] = [];
        this.data[0].children && this.data[0].children.forEach(children => {
          this.getFolderList(children, done, folderIds);
        });
        folderIds.push(-1);
        this.expandedKeys = folderIds.reverse();
      }
    } else {
      this.expandedKeys.splice(0, this.expandedKeys.length);
      this.expandedKeys.push(-1 as unknown as string);
    }
  }

  private getFolderList(folder: ITreeOption, done: boolean, folderIds) {
    if (folder.key && folder.key.toString() === this.value.toString()) {
      done = true;
      return this.value;
    }
    if (folder.children) {
      let childrenId;
      folder.children.forEach(children => {
        if (!childrenId) {
          childrenId = this.getFolderList(children, done, folderIds);
        }
      });
      if (childrenId && folder.key) {
        folderIds.push(parseInt(folder.key));
        return folder.key;
      }
    }
  }

  private expandedKeys: string[] = [];

  public get options(): ITreeOption[] {
    return treeToArray(this.data, false, this.expandedKeys, this.trackKey);
  };

  private onChange(val: string) {
    this.$emit('update:value', val);
    this.$emit('change', val);
  }
  private selectFlag:boolean = false

  private isSelectedFlag(val) {
    this.selectFlag = val;
  }
  private onBeforeShow() {
    this.$emit('before-show');
  }

  private onClick(item: ITreeOption) {
    this.toggleFolder(item);
  }

  private onClickNode(e: MouseEvent, item: ITreeOption) {
    if (this.folderDisabled && item.isFolder) {
      e.stopImmediatePropagation();
      this.toggleFolder(item);
    }
  }

  private toggleFolder(item: ITreeOption) {
    const key = item[this.trackKey];
    const index = this.expandedKeys.indexOf(key);
    if (index === -1) {
      this.expandedKeys.push(key);
    } else {
      this.expandedKeys.splice(index, 1);
    }
  }
}
</script>

<style lang="scss">
.u-tree-select {
  &-space {
    width: 16px;
    margin-right: 8px;
  }
  &-icon {
    cursor: pointer;
    width: 16px;
    height: 16px;
    margin-right: 8px;
    transform: rotate(-90deg);
    transition: transform .2s linear;

    &.expand {
      transform: rotate(0deg);
    }

    .ndc-icon-drop-down {
      display: block;
      font-size: 16px;
    }
  }
}

@keyframes transform {
  from {
    transform: rotate(-90deg);
  }

  to {
    transform: rotate(0deg);
  }
}
</style>

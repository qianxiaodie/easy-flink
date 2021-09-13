<template>
  <div class="m-tag-nav">
    <m-nav-header placeholder="标签名称" :tag-visible="false" @refresh="getTagList" @keywords-change="keywords = arguments[0]">
      <template v-slot:left>
        <ndc-tooltip position="top" content="新建标签">
          <i class="ndc-icon-new-tag" @click="createTag" />
        </ndc-tooltip>
      </template>
    </m-nav-header>

    <div class="m-nav-tree" @click.right="onRightClickTree">
      <ndc-tree
        ref="tree"
        :data="tags"
        :selected-nodes="selectedNode ? [selectedNode.key] : []"
        :filter-node-method="filterNodes"
        :is-filter="isFilter"
        @node-click="onJobTreeClick"
        @node-dblclick="onJobTreeDblClick"
        @node-right-click="onJobTreeRightClick"
      >
        <template v-slot:node="scope">
          <span class="g-flex-ac" style="width: 0;flex: 1;">
            <i class="ndc-icon-tag g-mr-8" />
            <span class="g-text-nowrap" :title="scope.node.label">{{scope.node.label}}</span>
          </span>
        </template>
      </ndc-tree>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import { Action } from 'vuex-class';
import UContextMenu from '@components/context-menu/context-menu.vue';
import MNavHeader from '../nav-header/index.vue';
import navMixin from '../../navMixin';
import ModalMixin from '../../../components/modal/mixin';

import { ITreeOption, IMenuItem, ITag } from '@utils/types';
import { MODAL_TYPE } from '../../../components/modal/constant';
import { MODULE_NAMESPACE } from '@utils/constant';

const tagMenuItems: IMenuItem[] = [{
  key: 'delete',
  label: '删除'
}, {
  key: 'update',
  label: '修改'
}];

const emptyMenuItems: IMenuItem[] = [{
  key: 'create',
  label: '新建标签'
}];

@Component({
  components: {
    MNavHeader
  }
})
export default class MTagNav extends Mixins(navMixin) {
  private selectedNode: ITag | null = null;
  private tagModalInstance: ModalMixin | null = null;
  private tagContextMenuInstance: UContextMenu | null = null;
  private emptyContextMenuInstance: UContextMenu | null = null;

  private get tags(): ITreeOption[] {
    return this.tagList.map(tag => (Object.assign({}, tag, {
      key: tag.id.toString(),
      label: tag.name,
      isFolder: false
    })));
  }

  @Action('getTagList', MODULE_NAMESPACE.develop)
  private getTagList!: any;

  public beforeDestroy() {
    this.tagModalInstance && this.tagModalInstance.hide();
    this.tagModalInstance = null;
  }

  private createTag() {
    this.create();
  }

  private create(tag: any = {}, isEdit: boolean = false) {
    if (!this.tagModalInstance) {
      this.tagModalInstance = this.$createModalInstance(MODAL_TYPE.createTag);
    }
    this.tagModalInstance && this.tagModalInstance.show(Object.assign({}, tag, {
      isEdit
    }), async (args: any) => {
      try {
        if (isEdit) {
          await this.$request('updateTag', Object.assign({}, args, {
            tagId: tag.id
          }));
        } else {
          await this.$request('createTag', args);
        }
        await this.getTagList();
        this.$ndcmessage.success(isEdit ? '修改标签成功' : '新建标签成功');
        return true;
      } catch (e) {
        this.tagModalInstance && this.tagModalInstance.setError(e.message);
      }
    });
  }

  private update() {
    this.create(this.selectedNode, true);
  }

  private async remove() {
    const tagId = this.selectedNode && this.selectedNode.id;
    try {
      const result = await this.$request('isTagLinked', { tagId });
      if (result) {
        this.$ndcconfirm({
          content: '标签被引用，无法删除',
          cancelButton: ''
        });
        return;
      }
      this.confirmRemove(tagId);
    } catch (e) {
      this.$handleException(e, '删除标签失败');
    }
  }

  private confirmRemove(tagId: number | null) {
    this.$ndcconfirm({
      content: '删除标签',
      onConfirm: async () => {
        try {
          await this.$request('deleteTag', { tagId });
          await this.getTagList();
          this.$ndcmessage.success('删除标签成功');
        } catch (e) {
          this.$handleException(e, '删除标签失败');
        }
      }
    });
  }

  private onJobTreeClick(node: ITag) {
    this.selectedNode = node;
  }

  private onJobTreeDblClick(e: any) {
    const node: ITag = e.node;
    this.selectedNode = node;
    this.open(node, 'tag');
  }

  private onRightClickTree(e: MouseEvent) {
    e.preventDefault();
    if (!this.emptyContextMenuInstance) {
      this.emptyContextMenuInstance = this.$contextmenu(emptyMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'create') {
          return this.createTag();
        }
      });
    }
    this.emptyContextMenuInstance && this.emptyContextMenuInstance.open(e);
  }

  private onJobTreeRightClick(e: any) {
    e.event.preventDefault();
    e.event.stopImmediatePropagation();
    if (e.node.isFolder) {
      return;
    }
    this.selectedNode = e.node;
    this.showMetaContextMenu(e);
  }

  private showMetaContextMenu(e: any) {
    if (!this.tagContextMenuInstance) {
      this.tagContextMenuInstance = this.$contextmenu(tagMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'delete') {
          return this.remove();
        }
        if (item.key === 'update') {
          return this.update();
        }
      });
    }
    this.tagContextMenuInstance && this.tagContextMenuInstance.open(e.event);
  }
}
</script>

<style lang="scss">
.m-tag-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  .ndc-tree-space {
    width: 0;
  }
}
</style>

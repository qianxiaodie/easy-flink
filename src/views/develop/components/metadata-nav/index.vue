<template>
  <div class="m-metadata-nav">
    <m-nav-header placeholder="元数据名称" @refresh="getMetadataList" @tags-change="selectedTags = arguments[0]" @keywords-change="keywords = arguments[0]">
      <template v-slot:left>
        <ndc-tooltip position="top" content="新增元数据">
          <i class="ndc-icon-new-metadata" @click="createMetadata" />
        </ndc-tooltip>
        <div class="icon-line"></div>
      </template>
    </m-nav-header>

    <div class="m-nav-tree" @click.right="onRightClickTree">
      <ndc-tree
        ref="tree"
        :data="metadatas"
        :selected-nodes="selectedNode ? [selectedNode.key] : []"
        :filter-node-method="filterNodes"
        :is-filter="isFilter"
        @node-click="onJobTreeClick"
        @node-dblclick="onJobTreeDblClick"
        @node-right-click="onJobTreeRightClick"
      >
        <template v-slot:node="scope">
          <span class="g-flex-ac" style="width: 0;flex: 1;">
            <i v-if="scope.node.isFolder && scope.node.expand" class="ndc-icon-folder-open g-mr-8" />
            <i v-else-if="scope.node.isFolder" class="ndc-icon-folder-closed g-mr-8" />
            <i v-else class="ndc-icon-metadata g-mr-8" />
            <span class="g-text-nowrap" :title="scope.node.label">{{ scope.node.label }}</span>
            <ndc-tooltip v-if="scope.node.tagIds && scope.node.tagIds.length" :content="getNodeTags(scope.node.tagIds)">
              <i class="ndc-icon-tag g-ml-8" />
            </ndc-tooltip>
          </span>
        </template>
      </ndc-tree>
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator'
import { State, Action } from 'vuex-class'
import UContextMenu from '@components/context-menu/context-menu.vue'
import MNavHeader from '../nav-header/index.vue'
import navMixin from '../../navMixin'
import ModalMixin from '../../../components/modal/mixin'

import { IMetadata, ITreeOption, IMenuItem, ITag } from '@utils/types'
import { MODAL_TYPE } from '../../../components/modal/constant'
import { MODULE_NAMESPACE } from '@utils/constant'

const metaMenuItems: IMenuItem[] = [
  {
    key: 'delete',
    label: '删除'
  },
  {
    key: 'update',
    label: '修改'
  },
  {
    key: 'link',
    label: '关联标签'
  }
]

const emptyMenuItems: IMenuItem[] = [
  {
    key: 'create',
    label: '新增元数据'
  }
]

@Component({
  components: {
    MNavHeader
  }
})
export default class MMetadataNav extends Mixins(navMixin) {
  @State('metadataList', MODULE_NAMESPACE.develop)
  private metadataList!: any

  private selectedNode: IMetadata | null = null
  private metaContextMenuInstance: UContextMenu | null = null
  private emptyContextMenuInstance: UContextMenu | null = null
  private metadataInstance: ModalMixin | null = null

  private get metadatas(): ITreeOption[] {
    const func = (m: IMetadata) => {
      return Object.assign({}, m, {
        key: m.id.toString(),
        label: m.name,
        isFolder: false
      })
    }

    const result: ITreeOption[] = []

    const types: string[] = Object.keys(this.metadataList || {}).sort((a, b) => a.localeCompare(b))
    types.forEach(type => {
      const node: ITreeOption = {
        key: type,
        label: type,
        isFolder: true,
        children: (this.metadataList[type] || []).map(func)
      }
      result.push(node)
    })

    return result
  }

  @Action('getMetadataList', MODULE_NAMESPACE.develop)
  private getMetadataList!: any

  public beforeDestroy() {
    this.metadataInstance && this.metadataInstance.hide()
    this.metadataInstance = null
  }

  private createMetadata() {
    this.create()
  }

  private create(metadata: any = {}, isEdit: boolean = false) {
    if (!this.metadataInstance) {
      this.metadataInstance = this.$createModalInstance(MODAL_TYPE.createMetadata)
    }
    this.metadataInstance &&
      this.metadataInstance.show(
        Object.assign({}, metadata, {
          isEdit,
          types: Object.keys(this.metadataList)
        }),
        async (args: any) => {
          try {
            const data = isEdit
              ? Object.assign({}, args, {
                  metaId: metadata.id
                })
              : args
            await this.$request(isEdit ? 'updateMetadata' : 'createMetadata', data)
            await this.getMetadataList()
            this.$ndcmessage.success(isEdit ? '修改元数据成功' : '新增元数据成功')
            return true
          } catch (e) {
            this.metadataInstance && this.metadataInstance.setError(e.message)
          }
        }
      )
  }

  private async update() {
    try {
      const metadata = await this.$request('getMetadataDetail', {
        metaId: this.selectedNode && this.selectedNode.id
      })
      this.updateMetadata(metadata)
    } catch (e) {
      this.$handleException(e, '修改元数据失败')
    }
  }

  private updateMetadata(metadata: IMetadata) {
    this.create(metadata, true)
  }

  private remove() {
    this.$ndcconfirm({
      content: '删除元数据',
      desc: '元数据删除后将无法恢复，确认删除吗？',
      onConfirm: async () => {
        try {
          await this.$request('deleteMetadata', {
            metaId: this.selectedNode && this.selectedNode.id
          })
          await this.getMetadataList()
          this.$ndcmessage.success('删除元数据成功')
        } catch (e) {
          this.$handleException(e, '删除元数据失败')
        }
      }
    })
  }

  private link() {
    if (this.selectedNode) {
      const tagIds = this.selectedNode.tagIds || []
      this.linkLabel(tagIds, this.selectedNode.id, 'META', async () => {
        await this.getMetadataList()
      })
    }
  }

  private onJobTreeClick(node: IMetadata) {
    this.selectedNode = node
  }

  private onJobTreeDblClick(e: any) {
    const node: IMetadata = e.node
    this.selectedNode = node
    this.open(node, 'metadata')
  }

  private onRightClickTree(e: MouseEvent) {
    e.preventDefault()
    if (!this.emptyContextMenuInstance) {
      this.emptyContextMenuInstance = this.$contextmenu(emptyMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'create') {
          return this.createMetadata()
        }
      })
    }
    this.emptyContextMenuInstance && this.emptyContextMenuInstance.open(e)
  }

  private onJobTreeRightClick(e: any) {
    e.event.preventDefault()
    e.event.stopImmediatePropagation()
    if (e.node.isFolder) {
      return
    }
    this.selectedNode = e.node
    this.showMetaContextMenu(e)
  }

  private showMetaContextMenu(e: any) {
    if (!this.metaContextMenuInstance) {
      this.metaContextMenuInstance = this.$contextmenu(metaMenuItems, (item: IMenuItem, event: Event) => {
        if (item.key === 'delete') {
          return this.remove()
        }
        if (item.key === 'update') {
          return this.update()
        }
        if (item.key === 'link') {
          return this.link()
        }
      })
    }
    this.metaContextMenuInstance && this.metaContextMenuInstance.open(e.event)
  }
}
</script>

<style lang="scss">
.m-metadata-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
}
</style>

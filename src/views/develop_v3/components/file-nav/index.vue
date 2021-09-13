<template>
  <div class="m-file-nav">
    <m-nav-header placeholder="文件名称" @refresh="getResourceList" @tags-change="selectedTags = arguments[0]" @keywords-change="keywords = arguments[0]">
      <template v-slot:left>
        <ndc-tooltip position="top" content="新建文件夹">
          <img src="@/assets/images/新建文件夹.png" alt @click="createFolder(true)" :class=[{changeCursor:!opCodesFlag},{newfloder:opCodesFlag}] />
        </ndc-tooltip>
        <div class="icon-line"></div>
        <ndc-tooltip position="top" content="上传资源文件">
          <img :class=[{changeCursor:!opCodesFlag},{upload:opCodesFlag}] src="@/assets/images/上传.png" alt @click="upload(null)" />
        </ndc-tooltip>
        <div class="icon-line"></div>
      </template>
    </m-nav-header>

    <div class="m-nav-tree" @click.right="onRightClickTree">
      <ndc-tree
        ref="tree"
        :data="resources"
        :selected-nodes="selectedNode ? [selectedNode.key] : []"
        :filter-node-method="filterNodes"
        :is-filter="isFilter"
        @node-click="onJobTreeClick"
        @node-dblclick="onJobTreeDblClick"
        @node-right-click="onJobTreeRightClick"
      >
        <template v-slot:node="scope">
          <div class="g-flex-ac" style="width: 0;flex: 1;">
            <img v-if="scope.node.isFolder && scope.node.expand" src="@/assets/images/icon_floder.png" />
            <img v-else-if="scope.node.isFolder" src="@/assets/images/icon_floder.png" />
            <i v-else class="ndc-icon-file g-mr-8" />
            <span class="g-text-nowrap" :title="scope.node.name">{{ scope.node.name }}</span>
            <ndc-tooltip v-if="scope.node.tagIds && scope.node.tagIds.length" :content="getNodeTags(scope.node.tagIds)">
              <i class="ndc-icon-tag g-ml-8" />
            </ndc-tooltip>
            <ndc-loading class="folder-loading" v-if="scope.node.isFolder && scope.node.id === selectedFolderId && loading" text></ndc-loading>
          </div>
        </template>
      </ndc-tree>
<!--      <m-file-modal v-on:emitreferFileFlag="referFileFlag"></m-file-modal>-->
    </div>
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Inject, Prop, Watch } from 'vue-property-decorator';
import { State, Action } from 'vuex-class';
import UContextMenu from '@components/context-menu/context-menu.vue';
import MNavHeader from '../nav-header/index.vue';

import navMixin from '../../navMixin';
import ModalMixin from '../../../components/modal/mixin';
import { IResource, IMenuItem } from '@utils/types';
import { MODAL_TYPE } from '../../../components/modal/constant';
import { MODULE_NAMESPACE } from '@utils/constant';
import { getBlockMeta, genFileMd5, uploadBlock, notifyBlock } from '../../utils';
// import MFileModal from '@views/components/modal/file.vue';
// 引入获取权限请求
import { getOpCodes } from '@/utils/getOpcodes';
import { trackEvent } from "@/utils/trackEvent";
import Bus from "@/bus";
const folderMenuItems: IMenuItem[] = [
  {
    key: 'delete',
    label: '删除'
  },
  {
    key: 'create',
    label: '新建文件夹'
  }
];

const fileMenuItems: IMenuItem[] = [
  {
    key: 'delete',
    label: '删除'
  },
  {
    key: 'download',
    label: '下载'
  },
  // {
  //   key: 'label',
  //   label: '关联标签'
  // },
  {
    key: 'create',
    label: '新建文件夹'
  }
];

const emptyMenuItems: IMenuItem[] = [
  {
    key: 'create',
    label: '新建文件夹'
  }
];

@Component({
  components: {
    MNavHeader
    // MFileModal
  }
})
export default class MFileNav extends Mixins(navMixin) {
  // 从父组件resource-file获取jobtype，然后传给file.vue
  @Prop({
    default: 'SQL'
  })
  private jobType!:string;

  @Prop({
    default: false
  })
  private uploadResourceFileFlag!: boolean

  @Watch('uploadResourceFileFlag')
  private uploadResourceFileFlagChanged() {
    this.upload(null);
  }

  @State('resourceList', MODULE_NAMESPACE.develop_v3)
  private resourceList!: IResource[]

  private selectedNode: IResource | null = null
  private fileContextMenuInstance: UContextMenu | null = null
  private folderContextMenuInstance: UContextMenu | null = null
  private emptyContextMenuInstance: UContextMenu | null = null
  private folderModalInstance: ModalMixin | null = null
  private fileModalInstance: ModalMixin | null = null
  private loading: boolean = false
  private selectedFolderId: number = -1
  // 新增获取权限操作码
  private opCodesFlag: Boolean = true

  private created() {
    this.showRightClick();
    Bus.$on('emitreferFileFlag', val => {
      // debugger
      this.overwriteFlag = val;
    });
  }

  // 新增获取权限操作码
  private async showRightClick() {
    let result = await getOpCodes({});
    if (result.opCodes.includes('rtdev_proj.devtest') === true) {
      this.opCodesFlag = true;
    } else {
      this.opCodesFlag = false;
    }

    folderMenuItems.map(element => {
      element['disabled'] = !this.opCodesFlag;
    });
    fileMenuItems.map(element => {
      element['disabled'] = !this.opCodesFlag;
    });
  }

  private get resources(): IResource[] {
    const func = (nodes: IResource[] = []): IResource[] => {
      let result: IResource[] = [];
      for (let i = 0, len = nodes.length; i < len; i++) {
        const node = nodes[i];
        if (!node.folderName) {
          if (node.fileName) {
            const n: IResource = Object.assign({}, node, {
              key: 'resourcefile_' + node.id,
              isFolder: false,
              name: node.fileName
            }) as IResource;
            result.push(n);
          }
          continue;
        }
        const treeNode: IResource = Object.assign({}, node, {
          key: 'resourcefolder_' + node.id.toString(),
          name: node.folderName,
          isFolder: true,
          children: []
        });
        if (node.folders) {
          const child = func(node.folders as IResource[]);
          treeNode.children = (treeNode.children || []).concat(child);
        }
        if (node.files && node.files.length) {
          node.files.forEach(file => {
            const n: IResource = Object.assign({}, file, {
              key: 'resourcefile_' + file.id,
              isFolder: false,
              name: file.fileName
            }) as IResource;
            treeNode.children && treeNode.children.push(n);
          });
        }
        result.push(treeNode);
      }
      return result;
    };

    return func(this.resourceList);
  }

  @Action('getResourceList', MODULE_NAMESPACE.develop_v3)
  private getResourceList!: any

  public beforeDestroy() {
    this.folderModalInstance && this.folderModalInstance.hide();
    this.folderModalInstance = null;
    this.fileModalInstance && this.fileModalInstance.hide();
    this.fileModalInstance = null;
  }

  private locate(id: number) {
    const refTree = this.$refs.tree as any;
    if (refTree) {
      const expandKeys: string[] = this.selectLocateNode(this.resourceList, id);
      refTree.expand(expandKeys);
    }
  }

  private selectLocateNode(nodes: IResource[], id: number) {
    const expandKeys: string[] = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      if (!node.leaf && node.id === id) {
        if (node.parentId && node.parentId !== -1) {
          expandKeys.push('resourcefolder_' + node.parentId);
        }
        node.key = 'resourcefolder_' + node.id.toString();
        this.selectedNode = node;
        return expandKeys;
      }
      if (node.folders && node.folders.length) {
        const result = this.selectLocateNode(node.folders as IResource[], id);
        if (result && result.length) {
          if (node.parentId && node.parentId !== -1) {
            expandKeys.push('resourcefolder_' + node.parentId);
          }
          return expandKeys.concat(result);
        }
      }
    }
    return expandKeys;
  }

  private createFolder(isRoot: boolean = true) {
    if (!this.opCodesFlag) {

    } else {
      if (!this.folderModalInstance) {
        this.folderModalInstance = this.$createModalInstance(MODAL_TYPE.createFolder_v3);
      }
      const position = isRoot ? -1 : this.selectedNode ? (this.selectedNode.isFolder ? this.selectedNode.id : this.selectedNode.parentId) : -1;
      this.folderModalInstance &&
      this.folderModalInstance.show(
        {
          type: 'FILE',
          position
        },
        async (args: any) => {
          try {
            const result = await this.$request('createDirectory', {
              name: args.folderName,
              parentId: args.position,
              dirType: args.type
            });
            await this.getResourceList();
            this.locate(result);
            this.$ndcmessage.success('新建文件夹成功');
            return true;
          } catch (e) {
            this.folderModalInstance && this.folderModalInstance.setError(e.message);
          }
        }
      );
    }
  }
private errorMsg=''
private overwriteFlag:boolean = false
private upload(fileList) {
  if (!this.opCodesFlag) {

  } else {
    this.errorMsg = '';
    if (!this.fileModalInstance) {
      this.fileModalInstance = this.$createModalInstance(MODAL_TYPE.uploadFile);
    }
    this.fileModalInstance &&
   this.fileModalInstance.show(
     {
       quoteFileList: fileList,
       jobType: this.jobType,
       afterClose: (id: number) => {
         if (this.loading) {
           this.selectedFolderId = id;
           this.locate(id);
         }
       }
     },
     async (args: any) => {
       try {
         this.loading = true;
         this.fileModalInstance && this.fileModalInstance.showLoading();
         const params = {
           parentId: args.position,
           description: args.description
         };
         const promiseArr = (args.files || []).map(file => this.uploadFile(file, params));
         console.log(promiseArr, 'promiseArr');
         await Promise.all(promiseArr).then(result => {
           // debugger
           this.$emit('fileInfo', result);
           this.$ndcmessage.success('资源文件上传成功');
           // 上报上传资源文件埋点
           trackEvent({ btn_title: '上传资源文件按钮', btn_id: 'btn_003' }, 'btn_click');
         }).catch(error => {
           this.errorMsg = error.toString();
           this.$ndcmessage.error(this.errorMsg);
           console.log(this.errorMsg, 'this.errorMsg');
         });
         await this.getResourceList();
         this.loading = false;
         this.selectedFolderId = -1;
         return true;
       } catch (e) {
         if (this.loading) {
           this.loading = false;
           this.selectedFolderId = -1;
           this.$handleException(e);
         } else {
           this.fileModalInstance && this.fileModalInstance.setError(e.message);
         }
       } finally {
         this.fileModalInstance && this.fileModalInstance.hideLoading();
       }
     }
   );
  }
}
// private referFileFlag(data) {
//   debugger
//   console.log(data, 'referFileFlagdata!')
// }
private async uploadFile(file: File, args: any) {
  const md5: string = await genFileMd5(file, true);
  // 步骤一：判断当前文件分块上传情况
  const blocksDone: number[] = await getBlockMeta(md5, file);
  // 步骤二：文件分块上传
  const obj = await uploadBlock(md5, blocksDone, file);
  // 步骤三：通知服务端合并文件
  const result = await notifyBlock(Object.assign({ md5, fileName: file.name }, obj));
  // 步骤四：添加文件上传记录
  // 父组件监听这个事件，关闭弹窗是调用
  return this.$request('addRecord', {
    fileSize: file.size,
    ...result,
    ...args,
    overwrite: this.overwriteFlag
  });
}

private link() {
  if (this.selectedNode) {
    const tagIds = this.selectedNode.tagIds || [];
    this.linkLabel(tagIds, this.selectedNode.id, 'FILE', async () => {
      await this.getResourceList();
    });
  }
}

private async download() {
  const node = this.selectedNode;
  if (!node || !node.id) {
    return;
  }
  try {
    await this.$request('downloadFile', {
      fileId: node.id
    });
  } catch (e) {
    this.$handleException(e, '文件下载失败');
  }
}

private remove() {
  const node = this.selectedNode;
  if (!node) {
    return;
  }
  if (node.isFolder) {
    // 文件夹需要先判断是否为空文件夹，是则弹窗提示删除，否则弹窗提示不能删除
    if ((node.folders && node.folders.length) || (node.files && node.files.length)) {
      this.$ndcconfirm({
        content: '请先删除文件夹中的文件',
        desc: '需清空文件夹中的文件方可进行删除操作。',
        cancelButton: ''
      });
    } else {
      this.removeFolder(node);
    }
    return;
  }
  this.removeFile(node);
}

private removeFolder(node: IResource) {
  // console.log(node, 'node.idddd')

  this.$ndcconfirm({
    content: '删除文件夹',
    desc: '文件夹删除后将无法恢复，确认删除吗？',
    onConfirm: async () => {
      try {
        await this.$request('deleteDirectory', {
          dirId: node.id,
          userId: 'fe_2@163.org'
        });
        await this.getResourceList();
        this.$ndcmessage.success('删除文件夹成功');
      } catch (e) {
        this.$handleException(e, '删除文件夹失败');
      }
    }
  });
}

private removeFile(node: IResource) {
  this.$ndcconfirm({
    content: '删除文件',
    desc: '文件删除后将无法恢复，确认删除吗？',
    onConfirm: async () => {
      try {
        await this.$request('deleteFile', {
          fileId: node.id
        });
        await this.getResourceList();
        this.$ndcmessage.success('删除文件成功');
      } catch (e) {
        this.$handleException(e, '删除文件失败');
      }
    }
  });
}

private onJobTreeClick(node: IResource) {
  this.selectedNode = node;
}

private onJobTreeDblClick(e: any) {
  const node: IResource = e.node;
  this.selectedNode = node;
  node.tags = this.getNodeTags(node.tagIds);
  this.open(node, 'file');
}

private onRightClickTree(e: MouseEvent) {
  e.preventDefault();
  if (!this.emptyContextMenuInstance) {
    this.emptyContextMenuInstance = this.$contextmenu(emptyMenuItems, (item: IMenuItem, event: Event) => {
      if (item.key === 'create') {
        return this.createFolder();
      }
    });
  }
  this.emptyContextMenuInstance && this.emptyContextMenuInstance.open(e);
}

private onJobTreeRightClick(e: any) {
  e.event.preventDefault();
  e.event.stopImmediatePropagation();
  this.selectedNode = e.node;
  if (e.node.isFolder) {
    return this.showFolderContextMenu(e);
  }
  this.showJobContextMenu(e);
}

private showFolderContextMenu(e: any) {
  if (!this.folderContextMenuInstance) {
    this.folderContextMenuInstance = this.$contextmenu(folderMenuItems, (item: IMenuItem, event: Event) => {
      if (item.key === 'delete') {
        return this.remove();
      }
      if (item.key === 'create') {
        return this.createFolder(false);
      }
    });
  }
  this.fileContextMenuInstance && (this.fileContextMenuInstance as any).close();
  this.folderContextMenuInstance && (this.folderContextMenuInstance as any).open(e.event);
}

private showJobContextMenu(e: any) {
  if (!this.fileContextMenuInstance) {
    this.fileContextMenuInstance = this.$contextmenu(fileMenuItems, (item: IMenuItem, event: Event) => {
      if (item.key === 'delete') {
        return this.remove();
      }
      if (item.key === 'download') {
        return this.download();
      }
      if (item.key === 'create') {
        return this.createFolder(false);
      }
      if (item.key === 'label') {
        return this.link();
      }
    });
  }
  this.folderContextMenuInstance && (this.folderContextMenuInstance as any).close();
  this.fileContextMenuInstance && (this.fileContextMenuInstance as any).open(e.event);
}
}
</script>

<style lang="scss">
.m-file-nav {
  height: 100%;
  display: flex;
  flex-direction: column;
  .folder-loading {
    width: 16px;
    height: 16px;
    position: absolute;
    right: 16px;
  }
  .m-nav-header {
    .header-icons {
      .ndc-tooltip {
        .ndc-tooltip-main {
          margin-bottom: 10px;
        }
        .newfloder {
          &:hover {
            content: url('../../../../assets/images/icon_newfloder.png');
          }
        }
        .upload{
          &:hover{
            content: url('../../../../assets/images/icon_upload_hover.svg');
          }
        }
        .changeCursor{
          &:hover{
            cursor: not-allowed;
          }
        }
      }
    }
  }
}
</style>

<template>
  <ndc-modal title="选择资源文件" class="m-file-modal" :visible="visible" :width="480" @hide="onHide" :on-confirm="onConfirm">
    <ndc-form>
      <ndc-form-item label="资源文件" required>
        <u-validator name="sourcefile" :validate="errors">
          <u-tree-select
            name="sourcefile"
            ref="select"
            placeholder="请选择资源文件"
            track-key="id"
            label-key="name"
            :data="fileData"
            :folder-disabled="true"
            @change="onChangeSourceFile"
            v-model="modalData.sourcefile"
            v-validate="{
              required: '资源文件'
            }"
          ></u-tree-select>
        </u-validator>
      </ndc-form-item>
    </ndc-form>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import { ITreeOption, IResource } from '@utils/types';

const DEFAULT_DATA: any = {
  sourcefile: ''
};

@Component
export default class MJarModal extends Mixins(ModalMixin) {
  private fileData: ITreeOption[] = [];

  public show(data: any, callback?: any) {
    this.showModal(Object.assign({}, DEFAULT_DATA, data), callback);
    this.getResourceList();
    setTimeout(() => {
      this.errors.clear();
    }, 100);
  }

  private async getResourceList() {
    try {
      const list: IResource[] = await this.$request('getResourceList');

      const func = (nodes: IResource[] = []): IResource[] => {
        let result: IResource[] = [];
        for (let i = 0, len = nodes.length; i < len; i++) {
          const node = nodes[i];
          if (!node.id) {
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

      this.fileData = func(list);

      this.$nextTick(() => {
        this.modalData.sourcefile && this.onChangeSourceFile(this.modalData.sourcefile);
      });
    } catch (e) {
      this.setError(e.message);
    }
  }

  private onChangeSourceFile(val) {
    const selectComp: any = this.$refs.select;
    if (selectComp) {
      const options: ITreeOption[] = selectComp.options;
      const file = options.find(f => f.id === val);
      file && (this.modalData.file = file);
    }
  }
}
</script>

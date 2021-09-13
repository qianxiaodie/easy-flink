import { Component, Vue, Inject } from 'vue-property-decorator';
import { State } from 'vuex-class';

import { ITag, IMetadata, IFile } from '@utils/types';
import { MODAL_TYPE } from '../components/modal/constant';
import ModalMixin from '../components/modal/mixin';
import { MODULE_NAMESPACE } from '@utils/constant';

@Component
export default class NavMixin extends Vue {
  @Inject('develop')
  public develop!: any;

  @State('tagList', MODULE_NAMESPACE.develop_v3)
  public tagList!: ITag[];

  public selectedTags: ITag[] = [];
  public keywords: string = '';
  private linkModalInstance: ModalMixin | null = null;

  private get tagsMap(): any {
    const map: any = {};
    this.tagList.forEach(tag => {
      map[tag.id] = tag.name;
    });
    return map;
  }

  public get isFilter(): boolean {
    if (this.keywords || this.selectedTags.length) {
      return true;
    }
    return false;
  }

  public filterNodes(node: any) {
    let valid = false;
    if (this.keywords) {
      valid = (node.name && node.name.includes(this.keywords)) || false;
    }
    if (this.selectedTags.length) {
      valid = this.filterTags(node);
    }
    return valid;
  }

  public filterTags(node: any): boolean {
    for (let i = 0, len = this.selectedTags.length; i < len; i++) {
      const tag = this.selectedTags[i];
      const tagIds = node.tagIds || [];
      if (tagIds.includes(tag.id)) {
        return true;
      }
    }
    return false;
  }

  public getNodeTags(ids: number[] = []): string {
    if (!ids || !ids.length) {
      return '';
    }
    const tags: string[] = [];
    ids.forEach(id => {
      const tag = this.tagsMap[id];
      tag && tags.push(tag);
    });
    return tags.join(',');
  }

  public linkLabel(selectedTagIds: number[], objId: any, objType: string, callback: () => {}) {
    if (!this.tagList || !this.tagList.length) {
      return this.$ndcconfirm({
        content: '标签未创建，请创建后关联',
        cancelButton: ''
      });
    }
    if (!this.linkModalInstance) {
      this.linkModalInstance = this.$createModalInstance(MODAL_TYPE.linkLabel);
    }
    this.linkModalInstance && this.linkModalInstance.show({
      tags: this.tagList,
      selectedTagIds
    }, async (tagIds: number[]) => {
      try {
        await this.$request('linkTag', {
          objId,
          objType,
          tagIds
        });
        await callback();
        return true;
      } catch (e) {
        this.linkModalInstance && this.linkModalInstance.setError(e.message);
      }
    });
  }

  public open(node: ITag | IMetadata | IFile, type: string) {
    if (node.isFolder) {
      const tree = this.$refs.tree as any;
      tree && tree.toggleExpandNodes([node.key]);
      return;
    }
    this.develop && this.develop.openDetail({
      type,
      info: node
    });
  }

  public beforeDestroy() {
    this.linkModalInstance && this.linkModalInstance.hide();
    this.linkModalInstance = null;
  }
};

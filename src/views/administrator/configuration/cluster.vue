<template>
  <config-list type="cluster"></config-list>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator';
import ConfigList from './list.vue';
import ModalMixin from '../../components/modal/mixin';
import { MODAL_TYPE } from '../../components/modal/constant';

@Component({
  components: {
    ConfigList
  }
})
export default class MConfigCluster extends Vue {
  private submitterModalInstance: ModalMixin | null = null;

  public submit(args: any) {
    if (!this.submitterModalInstance) {
      this.submitterModalInstance = this.$createModalInstance(MODAL_TYPE.submitter);
    }
    this.submitterModalInstance && this.submitterModalInstance.show(args);
  }

  private beforeDestroy() {
    this.submitterModalInstance && this.submitterModalInstance.hide();
    this.submitterModalInstance = null;
  }
}
</script>

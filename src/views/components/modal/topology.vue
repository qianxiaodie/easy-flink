<template>
  <ndc-modal class="m-topology-modal" title="配置拓扑图" :width="900" :height="600" :visible="visible" @hide="onHide" :on-confirm="onModalConfirm">
    <u-topology ref="topology" :topology-data="modalData.topologyData"></u-topology>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Mixins } from 'vue-property-decorator';
import ModalMixin from './mixin';
import UTopology from '../topology/index.vue';

@Component({
  components: {
    UTopology
  }
})
export default class MTopologyModal extends Mixins(ModalMixin) {
  private topology: UTopology | null = null;

  public mounted() {
    this.topology = this.$refs.topology as UTopology;
  }

  private validate() {
    return this.topology ? this.topology.validate() : '';
  }

  private onModalConfirm() {
    const errMsg = this.validate();
    if (errMsg) {
      this.setError(errMsg);
      return false;
    }
    const topologyData = this.topology ? this.topology.genData() : [];
    return this.onConfirm({ topologyData }, false);
  }
}
</script>

<style lang="scss">
.m-topology-modal {
  .ndc-modal-content {
    overflow: hidden;
  }
}
</style>

<template>
  <div
    class="u-context-menu"
    v-show="visible"
    :style="{ top: position.y + 'px', left: position.x + 'px' }"
  >
    <slot>
      <div v-for="(item, index) in menuItems" :key="index">
        <hr class="u-context-menu-line" v-if="item.split" />
        <div
          v-else
          class="u-context-menu-item"
          :class="{ disabled:item.disabled }"
          @click="onClick(item, $event)"
          id="rightClickName"
        >
          <slot name="item" :data="item">{{ item.label }}</slot>
        </div>
      </div>
    </slot>
  </div>
</template>

<script lang="ts">
import { Component, Vue, Prop } from 'vue-property-decorator';
import { IMenuItem } from '@utils/types';

import { MODULE_NAMESPACE } from '@utils/constant';
@Component
export default class UContextMenu extends Vue {
  @Prop({
    default() {
      return [];
    }
  })
  private menuItems!: IMenuItem[]

  private position = {
    x: -9999,
    y: -9999
  }

  private visible: boolean = false

  private created() {}

  private async mounted() {}
  public open(event: MouseEvent) {
    if (!event) {
      return;
    }
    this.visible = true;
    this.$nextTick(() => {
      const height = this.$el.clientHeight;
      const width = this.$el.clientWidth;
      const bodyHeight = document.body.clientHeight;
      const bodyWidth = document.body.clientWidth;
      this.position.x = width + event.clientX < bodyWidth ? event.clientX : bodyWidth - width - 10;
      this.position.y = height + event.clientY < bodyHeight ? event.clientY : bodyHeight - height - 10;
      setTimeout(() => {
        document.body.addEventListener(
          'click',
          () => {
            this.visible = false;
          },
          { once: true }
        );
      }, 0);
    });
  }

  public close() {
    this.visible = false;
  }

  private onClick(item: IMenuItem, event: Event) {
    if (item.disabled) {
      return;
    }
    this.$emit('select', { item, event });
  }
}
</script>

<style lang="scss">
.u-context-menu {
  position: fixed;
  z-index: 30;
  padding: 8px 0;
  background-color: #fff;
  box-shadow: 0 4px 6px rgba(114, 151, 193, 0.4);
  &-item {
    min-width: 128px;
    padding: 6px 12px;
    background-color: #fff;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: pointer;
    border: unset !important;
    &:hover {
      background-color: #f5f7fa;
      /*color: #0075ff;*/
    }
    &.disabled {
      opacity: 0.3;
      pointer-events: none;
    }
  }
  &-line {
    height: 1px;
    margin: 6px 0;
    border: 0;
    background-color: #eee;
  }
}
</style>

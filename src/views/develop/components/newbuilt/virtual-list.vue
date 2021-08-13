<template>
  <div class="ndc-virtual-list">
    <div class="ndc-virtual-list-phantom" :style="{ height: listHeight }">
    <div class="ndc-virtual-list-content" ref="list">
      <div class="ndc-virtual-list-item"
        :class="{'active': selectedNodes.includes(item.key || item)}"
        v-for="(item, index) in visibleData"
        :key="index"
        @click="onClick(item)"
        @dblclick="onDblClick(item)"
      >
        <slot name="item" :item="item" :index="index">
          <span v-html="itemRender(item)"></span>
        </slot>
      </div>
    </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NdcVirtualList',
  props: {
    data: {
      type: Array,
      default() {
        return [];
      }
    },
    selectedNodes: {
      type: Array,
      default() {
        return [];
      }
    },
    itemHeight: {
      type: Number,
      default: 32
    },
    itemRender: {
      type: Function,
      default(item) {
        if (item.render && typeof item.render === 'function') {
          return item.render(item);
        }
        return item;
      }
    }
  },
  data() {
    return {
      visibleCount: 0,
      height: 0,
      start: 0,
      end: 0,
      scrollTop: 0
    };
  },
  computed: {
    totalCount() {
      return this.data.length;
    },
    listHeight() {
      return this.totalCount * this.itemHeight + 'px';
    },
    visibleData() {
      return this.data.slice(this.start, this.end);
    }
  },
  created() {
    window.addEventListener('resize', this._initListInfo);
  },
  beforeDestroy() {
    window.removeEventListener('resize', this._initListInfo);
    this.$el.removeEventListener('scroll', this._scroll);
  },
  mounted() {
    this.$el.addEventListener('scroll', this._scroll);
    this._initListInfo(true);
  },
  methods: {
    resize() {
      this._initListInfo();
    },
    _initListInfo(isCreated = false) {
      const bound = this.$el.getBoundingClientRect();
      const height = bound.height;
      if (height !== this.height) {
        this.visibleCount = Math.ceil(height / this.itemHeight) * 2;
        if (isCreated) {
          this.start = 0;
        }
        this.end = Math.min(this.start + this.visibleCount, this.totalCount);
      }
    },
    _scroll(event) {
      const scrollTop = this.$el.scrollTop;
      this.start = Math.floor(scrollTop / this.itemHeight);
      this.end = Math.min(this.start + this.visibleCount, this.totalCount);

      this.$refs.list.style.webkitTransform = `translate3d(0, ${this.start * this.itemHeight}px, 0)`;

      this.$emit('scroll', { event });
    },
    onClick(item) {
      // this.$emit('click', item);
      console.log(item,'click')

    },
    onDblClick(event, item) {
      console.log(event,item,'dbcilck')
      // this.$emit('dblclick', {
      //   event,
      //   node: item
      // });
    },
  }
};
</script>

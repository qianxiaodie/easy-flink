<template>
<div class="ndc-pagination-layout">

  <div style="display:flex">
    <span class="ndc-pagination-desc" v-if="totalVisible">共 {{total}} 条记录，</span>
      <div class="ndc-pagination-size g-flex-ac" v-if="sizeVisible">
        <span>当前显示</span>
        <a-select class="ndc-select" :value="internalPageSize" :options="sizeOptions" @change="onSizeChange"></a-select>
        <span>条</span>
      </div>
  </div>
	<ul class="ndc-pagination g-flex-ac" :class="{'small': small}" v-show="total">

		<li @click="goPrePage" :disabled="internalPage <= 1">
			<a href="javascript:void(0)">
				<span> < </span>
			</a>
		</li>
		<li :class="{'active': n === internalPage, 'eps': (n === hideFrontIndex || n === hideBackIndex) && n !== pageCount,'disadled':loading}"
			v-for="(n, index) in pageCount" :key="index"
			v-show="[1, 2, pageCount].indexOf(n) > -1 || (n >= hideFrontIndex && n <= hideBackIndex)"
			@click="changePage(n)"
    >
			<a href="javascript:void(0)">
				{{(n === hideFrontIndex || n === hideBackIndex) && n !== pageCount ? '' : n}}
			</a>
		</li>
		<li @click="goNextPage" :disabled="internalPage >= pageCount">
			<a href="javascript:void(0)">
				<span>></span>
			</a>
		</li>
    <div class="ndc-pagination-jump g-flex-ac" v-if="jumpVisible">
      <span class="pageactive">{{internalPage}}</span>/ <span>{{pageCount}}</span> ，
      <span>到第</span>
      <input class="ndc-input" type="number" :max="pageCount" :min="1" :value="jumpPage" @input="onJumpInput" />
      <span>页</span>
      <button @click="onJumpPage(jumpPage)" class="ndc-pagination-btn">
       确定
      </button>
    </div>

	</ul>
  </div>
</template>

<script>
// import NdcSelect from '../../select';
import './pagination.scss'

export default {
  name: 'Pagination',
  components: {
    // NdcSelect
  },
  props: {
    loading: {
      type: Boolean,
      default: false
    },
    total: {
      type: Number,
      default: 0
    },
    totalVisible: {
      type: Boolean,
      default: false
    },
    sizeVisible: {
      type: Boolean,
      default: false
    },
    jumpVisible: {
      type: Boolean,
      default: false
    },
    pageSize: {
      type: Number,
      default: 10
    },
    page: {
      type: Number,
      default: 1
    },
    small: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      internalPage: 1,
      jumpPage: 1,
      internalPageSize: 10,
      sizeOptions: [
        {
          label: '10',
          value: 10
        }, {
          label: '25',
          value: 25
        }, {
          label: '50',
          value: 50
        }, {
          label: '100',
          value: 100
        }]
    };
  },
  watch: {
    page: {
      immediate: true,
      handler(val) {
        this.internalPage = val;
      }
    },
    loading: {
      immediate: true,
      handler(val) {
        // console.log(val,'uldisadled')
      }
    },
    pageSize: {
      immediate: true,
      handler(val) {
        this.internalPageSize = val;
      }
    }
  },
  computed: {
    pageCount() {
      const { total, internalPageSize } = this;
      return Math.ceil(total / internalPageSize);
    },
    hideFrontIndex() {
      const { internalPage, pageCount } = this;
      if (pageCount <= 7 || internalPage < 6) {
        return -1;
      }
      if (internalPage > pageCount - 3) {
        return pageCount - 6;
      }
      return internalPage - 3;
    },
    hideBackIndex() {
      const { internalPage, pageCount } = this;
      if (internalPage > pageCount - 3) {
        return pageCount;
      }
      if (internalPage < 6) {
        return 8;
      }
      return internalPage + 3;
    }
  },
  methods: {
    onSizeChange(val) {
      this.changePage(1);
      this.internalPageSize = val;
      this.$emit('update:pageSize', this.internalPageSize);
      this.$emit('pagesize-change', this.internalPageSize);
    },
    onJumpInput(e) {
      let val = e.target.value;
      val = val.replace(/[^\d]/g, '');
      e.target.value = val;
      this.jumpPage = val;
    },
    onJumpPage(e) {
      const val = e;
      let page = isNaN(Number(val)) ? 1 : Number(val);
      page = page < 1 ? 1 : (page > this.pageCount ? this.pageCount : page);
      // e.target.value = page;
      this.jumpPage = page;
      this.changePage(page);
    },
    changePage(page) {
      if (!this.loading) {
        this.internalPage = page;
        this.emitChange();
      }
    },
    goPrePage() {
      if (this.internalPage === 1) {
        return;
      }
      this.internalPage -= 1;
      this.emitChange();
    },
    goNextPage() {
      const { internalPage, pageCount } = this;
      if (internalPage === pageCount) {
        return;
      }
      this.internalPage += 1;
      this.emitChange();
    },
    emitChange() {
      this.$emit('update:page', this.internalPage);
      this.$emit('page-change', this.internalPage);
    }
  }
};
</script>

<style lang="scss" scoped>
a{
  font-style: normal;
  color: none;
}
input{
  border: none;
  padding: 0;
  margin: 0;
}
.ndc-pagination-layout{
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  .ndc-pagination-desc,.ndc-pagination-size,.ndc-pagination-jump{
    color: #555;
    line-height: 28px;
  }
}

.ndc-pagination{
  li{
    width: 28px;
    height: 28px;
    background: white;
    color: #222;
    display: flex;
    justify-content: center;
    align-items: center;
    border: 1px solid #888;
    border-radius: 1px;
  }
  .active{
    color: #3b68b7;
    background: none;
    border-color: #3b68b7;
  }
  .disadled{
    cursor: not-allowed;
  }
  .pageactive{
    color: #3b68b7;
  }
  .ndc-input{
    width: 48px;
    height: 32px;
    border-color:#bbb ;
    box-sizing: border-box;
    width: 48px;
    height: 32px;
    padding: 4px 16px;
    border: 1px solid #d2d7e0;
    border-radius: 2px;
    font-size: 14px;
    line-height: 32px;
    color: #333;
  }
}
  .ndc-pagination-btn{

    background: none;
    color: #222;
    width: 56px;
    text-align: center;
    font-size: 12px;
    display: flex;
    justify-content: center;
    margin-left: 10px;
    border-radius: 3px;
    line-height: 32px;
    border: 1px solid #bbb;
}

.ndc-pagination li[disabled] {
    color: #d5e1f0;
    pointer-events: none;
}
.ndc-pagination-size .ndc-select {
    width: 68px;
    margin: 0 8px;
}
</style>

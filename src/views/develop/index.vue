<template>
  <!-- <div class="m-develop g-flex" @dragover.prevent> -->
  <div class="m-develop g-flex">
    <div id="m-develop-tree" class="m-develop-tree" :class="{ noborder: treeWidth === 0 }" :style="treeStyle">
      <div class="m-develop-tit">
        <div>表管理</div>
      </div>
        <nav-tree></nav-tree>
    </div>
   <div class="m-develop-content">
     <!-- <div v-if="isdatabase" class="m-develop-content-tit">
       <div>
       </div>
       <div>
         库名
       </div>
       <a-button type="primary">
        新建表
      </a-button>  
     </div>
     <div v-else class="m-develop-content-tit">
       表名
     </div> -->
     <router-view></router-view>
     <!-- <Content></Content> -->
   </div>
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Provide } from 'vue-property-decorator';
  import { Action, State, Mutation } from 'vuex-class';
  import { EDITOR_CMD } from './constant';
  import { MODULE_NAMESPACE } from '@/utils/constant';
  import NavTree from './components/nav-tree/index.vue';
  // import Content from './components/content/index.vue';
  @Component({
    components: {
     NavTree,
    //  Content
    }
  })
  export default class Develop extends Vue {
    @Provide()
    develop: Develop = this

    // @State('tabs', MODULE_NAMESPACE.state)
    // private tabs!: ITab[]



    @State('treeWidth', MODULE_NAMESPACE.state)
    private treeWidth!: number

    private lineVisible: boolean = false
    private isdatabase:boolean = true

    private activeNav: string = 'sql'
    // 新增 流式表头部标题
    private title: string = '展开基本信息'

    // 控制树右侧小箭头的展示
    private showTree: boolean = false

    // 控制流式表的展示
    private tableShowFlag: boolean = false

    private isshang: boolean = true

    private isxia: boolean = false

    private showTble() {

    }

 
    private get treeStyle() {
      const width = this.treeWidth + 'px';
      return {
        width,
        flexShrink: 0
      };
    }
    private created() {
      if(this.$router.name=='listinfo'){
        this.isdatabase=false
      }
      console.log(this.$route,'333')
      
    }


    private mounted() {
    
     
    }

  }
</script>

<style lang="scss" scoped>
  .m-develop {
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: 0;
    &-tit{
      width: 200px;
      font-size: 16px;
      // margin-top: 15px;
      // margin-left: 15px;
    }
    &-nav {
      flex: 0 0 32px;
      border-right: $border;
      box-sizing: border-box;
      background-color: #fff;
      box-shadow: 2px 0 4px 0 rgba(0,0,0,.08);
        &:after {
          position: absolute;
          content: '';
          width: 4px;
          border-radius: 2px;
          height: 0;
          background: $active_color;
          right: 0;
          top: 50%;
          transform: translateY(-50%);
          transition: height 0.3s;
        }
        &:hover {
          color: $active_color;
        }
        &.active {
          background-color: #ebeff7;
          color: #555555;
          width: 100%;
          &:after {
            // height: calc(100% - 48px);
            height: 100%;
          }
        }
       
      }
    
    &-tree {
      width: 232px;
      padding: 16px;
      transition: width 0.2s ease-in-out 50ms;
      position: relative;
      z-index: 10;
      height: 100%;
      border-right: $border;
      box-sizing: border-box;
      .changeTreeWidth {
        width: 5px;
        height: 100%;
        position: absolute;
        right: -5px;
        top: 0;
        cursor: col-resize;
      }
   
     
      .tree-trick:active{
        animation: 0.6s rotatefresh 1;
      }
      @keyframes treeRotate {
        from {
          transform: rotate(0deg);
        }

        to {
          transform: rotate(360deg);
          transition-duration: 0.6s;
          transition: 0.6s;
        }
      }
     
    }
    &-lineh{
      height: 2px;
      width: 100%;
      background-color: #e7e7e7;
      cursor: row-resize;
    }
    &-line{
      height: 2px;
      width: 100%;
      background-color: #e7e7e7;
      cursor: col-resize;
    }
    &-ide {
      flex: 1;
      width: 0;
      z-index: 9;
      overflow: hidden;
    }
    &-content{
      width: 100%;
      height: 100%;
    }
    
  }
</style>

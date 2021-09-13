<template>
  <div class="m-develop g-flex" @dragover.prevent>
    <div class="m-develop-nav">
      <!-- <div class="item" :class="{'active': activeNav === 'topic'}" @click="switchNav('topic')">
        <div class="item-topic"></div>
        <span class="nav-title">TOPIC任务</span>
      </div>-->
      <div class="item" :class="{ active: activeNav === 'sql' }" @click="switchNav('sql')">
        <div class="item-sql"></div>

        <span class="nav-title">SQL任务</span>
      </div>
      <!--<div class="item" :class="{ active: activeNav === 'jar' }" @click="switchNav('jar')">
        <div class="item-jar"></div>
        <span class="nav-title">JAR任务</span>
      </div>-->
      <!-- <div class="item" :class="{'active': activeNav === 'job'}" @click="switchNav('job')">
        <div class="item-job"></div>
        <span class="nav-title">任务</span>
      </div>-->
      <!-- <div class="item" :class="{'active': activeNav === 'metadata'}" @click="switchNav('metadata')">
        <div class="item-metadata"></div>
        <span class="nav-title">元数据</span>
      </div>-->
      <!-- <div class="item" :class="{'active': activeNav === 'tag'}" @click="switchNav('tag')">
        <div class="item-tag"></div>
        <span class="nav-title">标签</span>
      </div>-->
      <!--<div class="item" :class="{ active: activeNav === 'file' }" @click="switchNav('file')">
        <div class="item-file"></div>
        <span class="nav-title">资源</span>
      </div>-->
      <!-- <div class="item" :class="{'active': activeNav === 'database'}" @click="switchNav('database')">
      <div class="item-metadata"></div>-->
      <!-- <span class="nav-title">数仓表</span> -->
      <!-- </div> -->
    </div>

    <div id="m-develop-tree" class="m-develop-tree" :class="{ noborder: treeWidth === 0 }" :style="treeStyle">
      <!--      宽度拉伸-->
      <div class="changeTreeWidth" id="changeTreeWidth" @mousedown="onMouseDown"></div>
      <div style="overflow: hidden;height: 100%">
        <m-nav :nav="activeNav"></m-nav>
        <!-- 拉伸-->
        <div class="lsbTransition" id="lsb-el-collapse">
          <div class="liushibiao-open" id="liushibiao-open" :hidden="showTree">
            <div class="m-develop-lineh" v-show="tableShowFlag" :style="lineStyle" @mousedown="onMouseDownH" id="controlHeightLine">
              <!--            <img src="../../assets/images/slide.svg" />-->
            </div>
            <div :class="[{ shang: isshang }, { xia: isxia }]" id="tableHeader" @click="showTble"></div>
            <!-- <el-collapse :hidden="showTree" @change="changetitle">
            <el-collapse-item :title="this.title">-->
            <div v-show="tableShowFlag">
              <!-- 新增 文件基本信息-->
              <m-baseinfo></m-baseinfo>
              <!--            <m-database-nav v-if="this.permission === true" style="overflow: hidden"></m-database-nav>
                          <div class="permissionBox" v-else>
                            <div class="permissionImg">
                              <img src="../../assets/images/limits.png" alt />
                            </div>
                            <p>您暂无流式表权限</p>
                            <p>快去申请吧</p>
                            <div class="applyPermissionBtn">
                              <ndc-button theme="primary" @click="applyPermission">申请数据权限</ndc-button>
                            </div>
                          </div>-->
            </div>
          </div>
          <!-- </el-collapse-item>
          </el-collapse>-->
        </div>
      </div>
      <!--收起任务栏-->
      <div class="tree-close" id="treeclose" :class="[showTree ? 'arrow-left':'arrow-right']"  @click="closeBar">
        <li class="li-right"></li>
      </div>
    </div>
    <!--    <div class="m-develop-line" :class="{'active': lineVisible}" :style="lineStyle" @mousedown="onMouseDown">-->
    <!--      <img src="../../assets/images/slide.svg" />-->
    <!--    </div>-->
    <div class="m-develop-ide">
      <m-ide ref="ide"></m-ide>
      <!--      <m-ide ref="ide" v-show="this.activeNav === 'file'"></m-ide>-->
      <!--      <m-ide-jar ref="ide_jar" v-show="this.activeNav === 'jar'"></m-ide-jar>-->
      <!-- <m-ide-jar ref="ide_jar" v-show="this.activeNav === 'file'"></m-ide-jar> -->
      <!-- <m-ide ref="ide" v-show="this.activeNav === 'file'"></m-ide> -->
      <!-- <m-ide ref="this.activeNav ==='sql' ? 'ide_sql' : 'ide_jar'" v-show="this.activeNav === 'file'"></m-ide> -->
    </div>
    <!-- <u-context-menu :rightClickCodes="rightClickCodes" style="display:none"></u-context-menu> -->
  </div>
</template>

<script lang="ts">
  import { Component, Vue, Provide } from 'vue-property-decorator';
  import MIde from './ide_sql.vue';
  import MNav from './nav.vue';

  import { Action, State, Mutation } from 'vuex-class';
  import { EDITOR_CMD } from './constant';
  import { IJobFolder, ITab, IDetail, IJobTreeNode } from '@/utils/types';
  import { MODULE_NAMESPACE } from '@/utils/constant';
  // 引入获取权限请求  引入setItem方法
  import { getOpCodes } from '@/utils/getOpcodes';
  import { setItem } from '@/utils/setItem';
  // 导入数仓表
  import MDatabaseNav from './components/database-nav/index.vue';
  // 右键菜单
  import UContextMenu from '@components/context-menu/context-menu.vue';
  // 导入基本信息
  import MBaseinfo from './components/baseinfo/index.vue';
  import Bus from '@/bus';
  import { trackEvent } from "@/utils/trackEvent";
  import Axios from "axios";

  // 解决同时打开两个项目时，localstorage不同步的问题
  document.addEventListener('visibilitychange', function () {
    let visibilityState = document.visibilityState;
    setItem(visibilityState);
  });
  @Component({
    components: {
      MIde,
      MNav,
      MDatabaseNav,
      UContextMenu,
      MBaseinfo
    }
  })
  export default class Develop extends Vue {
    @Provide()
    develop: Develop = this

    @State('tabs', MODULE_NAMESPACE.develop_v3)
    private tabs!: ITab[]

    @State('activeTab', MODULE_NAMESPACE.develop_v3)
    private activeTab!: string

    @State('treeWidth', MODULE_NAMESPACE.develop_v3)
    private treeWidth!: number

    @State('leftWidth', MODULE_NAMESPACE.develop_v3)
    private leftWidth!: number

    @State('userId', MODULE_NAMESPACE.develop)
    private userId!: string

    private lineVisible: boolean = false
    private ide?: MIde
    // private ide_sql?: MIdeSql;
    private ide_jar?: MIde
    private activeNav: string = 'sql'
    // 新增 流式表头部标题
    private title: string = '展开基本信息'
    private isshang: boolean = true
    private isxia: boolean = false
    // 控制树右侧小箭头的展示
    private showTree: boolean = false
    // 控制流式表的展示
    private tableShowFlag: boolean = false

    private showTble() {
      let tableObj = document.getElementById('liushibiao-open') || ({} as any);
      let headerTitle = document.getElementById('tableHeader') || ({} as any);
      this.isshang = !this.isshang;
      this.isxia = !this.isxia;
      this.changetitle();
      headerTitle.innerHTML = this.title;
      if (tableObj.style.height === '320px' ) {
        tableObj.style.height = 28 + 'px';
      } else if (tableObj.style.height === '28px' ) {
        tableObj.style.height = 320 + 'px';
      } else if (tableObj.style.height === '') {
        tableObj.style.height = 320 + 'px';
      } else {
        tableObj.style.height = 28 + 'px';
      }
      this.tableShowFlag = !this.tableShowFlag;
    }
    private changetitle() {
      if (this.title) {
        return (this.title = '');
      }
      return (this.title = '展开基本信息');
    }

    // 树形区域宽度拉伸
    private d= ''
    private onMouseDown(e: MouseEvent) {
      e.preventDefault();
      const el = document.getElementById('m-develop-tree') as any;
      let x = e.clientX;
      let elW = el.offsetWidth;
      let elL = el.offsetLeft;
      if (x > elL) {
        this.d = 'right';
      }
      document.onmousemove = (e) => {
        e.preventDefault();
        let xx = e.clientX;
        if (this.d === 'right') {
          el.style.width = elW - x + xx + 'px';
          el.style.maxWidth = 500 + 'px';
          el.style.minWidth = 200 + 'px';
        }
        // return false;
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }

    // 关闭树bar
    private closeBar() {
      const obj = document.getElementById('m-develop-tree') || ({} as any);
      obj.style.minWidth = 0;
      console.log(obj.style);
      const changeWidth = document.getElementById('changeTreeWidth') || ({} as any);
      if (obj.style.width !== '0px') {
        obj.style.width = 0;
        changeWidth.style.width = 0;
      } else {
        obj.style.width = this.treeWidth + 'px';
        changeWidth.style.width = 5 + 'px';
      }
      this.showTree = !this.showTree;

      setTimeout(() => {
        (this.$refs.ide as any).executeCommand(EDITOR_CMD.resize);
      }, 250);

      //   (this.$refs.ide as any).executeCommand(EDITOR_CMD.resize)
    }
    // 新增 权限申请方法
    // private permission: boolean = false
    // private async getPermissionCodes() {
    //   let result = await this.getOpcodes({});
    //   // let result = this.opCodes
    //   if (result.includes('rtdev_proj.devdeploy') === true) {
    //     this.permission = true;
    //   } else {
    //     this.permission = false;
    //   }
    // }

    @Action('getMetadataTableList', MODULE_NAMESPACE.develop_v3)
    private getMetadataTableList!: any

    private get treeStyle() {
      const width = this.treeWidth + 'px';
      return {
        width,
        flexShrink: 0
      };
    }

    private get lineStyle() {
      return {
        left: this.leftWidth + 'px'
      };
    }

    private created() {
      this.setUserId(JSON.parse(<string>localStorage.getItem('userInfo')).ivUser);
      // 提前设置sloth_teram， 不然会导致product不正确
      localStorage.setItem('sloth_team', this.$route.query.projectId as string);
      // 新增 进入开发页面钱判断用户是否是该项目的成员
      const hosturl = '/HTAI/v2/api/portal';
      const baseUserProjectUrl = '/api/infra/userProject/all';
      let userId = JSON.parse(<string>localStorage.getItem('userInfo')).id || {};
      let projectId = this.$route.query.projectId as string;
      // 请求中泰接口， 不需要根据环境拼接ip
      Axios.get(`${hosturl}${baseUserProjectUrl}`, {
        params: {
          userId,
          projectId
        },
        headers: {
          API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
        }
      })
        .then(response => {
          let result = response.data.result
          if ( result.length === 0 ) {
            this.$ndcmessage.error('获取项目信息失败，没有权限！');
            const origin = window.location.origin
            const pathname = window.location.pathname
            window.open(`${origin}${pathname}#/login`,'_self')
            return false;
          } else {
            result.forEach(i => {
              if ( i.projectId === this.$route.query.projectId ) {
                // ProRoleId：项目角色ID  roleId： 空间角色ID
                localStorage.setItem('sloth_roleID', this.$route.query.ProRoleId as string);
                localStorage.setItem('sloth_projectId', this.$route.query.projectId as string);
                localStorage.setItem('sloth_developer', this.$route.query.developer as string);
                // localStorage.setItem('sloth_team', this.$route.query.projectId as string);
                localStorage.setItem('sloth_space', this.$route.query.spaceId as string);
                localStorage.setItem('sloth_projectName', this.$route.query.name as string);
                localStorage.setItem('sloth_roleId', this.$route.query.roleId as string);

                this.getJob()
              }
            })
            return true;
          }
        })
        .catch(err => {
          this.$ndcmessage.error(err)
        });
    }

    private async getJob() {
      // 同时打开多个任务，上传jar包和上传资源文件会报错。 原因：product不正确
      this.setProduct(localStorage.getItem('sloth_team') || '');
      try {
        this.getTagList();
        // 判断已打开的tab 刷新之后是不是被删掉了
        // 如果tab为空只获取sql列表
        const sqlList = await this.getJobList({ jobType: 'SQL' }) as IJobTreeNode[];
        const jarList = await this.getJobList({ jobType: 'JAR' }) as IJobTreeNode[];
        this.handleJobList([...jarList, ...sqlList]);

        /*if (this.tabs.length > 0) {
          // 新增 获取jar和sql的列表
          const jarList = await this.getJobList({ jobType: 'JAR' }) as IJobTreeNode[];
          this.handleJobList([...jarList, ...sqlList]);
        }*/

        this.getResourceList()
      } catch (e) {
        this.$handleException(e);
      }
      Bus.$emit('base_job_id', this.activeTab);
    }

    public executeCommand(cmd: number, args?: any) {
      this.ide && (this.ide as any).executeCommand(cmd, args);
    }

    public openDetail(data: IDetail) {
      this.ide && (this.ide as any).openDetail(data);
    }

    private mounted() {
      this.ide = this.$refs.ide as MIde;
      // this.ide_sql = this.$refs.ide as MIdeSql;
      this.ide_jar = this.$refs.ide as MIde;
      this.setKeepAliveList(['Develop']);
      // 默认流式表头部标题
      let headerTitle = document.getElementById('tableHeader') || ({} as any);
      headerTitle.innerHTML = this.title;
      // this.debounceResize = debounce(this.resize, 300);
      trackEvent({}, 'page_view');
    }

    @Mutation('SET_LEFTWIDTH', MODULE_NAMESPACE.develop_v3)
    private setLeftWidth!: any

    @Mutation('SET_TREEWIDTH', MODULE_NAMESPACE.develop_v3)
    private setTreeWidth!: any

    @Mutation('SET_TABS', MODULE_NAMESPACE.develop_v3)
    private setTabs!: any

    @Mutation('SET_ACTIVETAB', MODULE_NAMESPACE.develop_v3)
    private setActiveTab!: any

    @Mutation('SET_KEEPALIVELIST', MODULE_NAMESPACE.global)
    private setKeepAliveList!: any

    @Mutation('SET_USERID', MODULE_NAMESPACE.global)
    private setUserId: any;

    @Mutation('SET_PRODUCT', MODULE_NAMESPACE.global)
    private setProduct: any;

    @Action('getJobList', MODULE_NAMESPACE.develop_v3)
    private getJobList!: any

    @Action('getResourceList', MODULE_NAMESPACE.develop_v3)
    private getResourceList!: any

    @Action('getTagList', MODULE_NAMESPACE.develop_v3)
    private getTagList!: any

    private handleJobList(list: IJobTreeNode[] = []) {
      const func = (nodes: IJobTreeNode[]): string[] => {
        let tmp: string[] = [];
        nodes.forEach(node => {
          if (node.jobId) {
            tmp = tmp.concat(node.jobId.toString());
          }
          node.jobs &&
          node.jobs.forEach(n => {
            n.jobId && tmp.push(n.jobId.toString());
          });
          if (node.folders) {
            const child = func(node.folders as IJobTreeNode[]);
            tmp = tmp.concat(child);
          }
        });
        return tmp;
      };
      const nodes = func(list);
      const arr: ITab[] = [];
      this.tabs.forEach(tab => {
        if (nodes.includes(tab.name)) {
          arr.push(tab);
        }
      });
      this.setTabs(arr);
      const index = arr.findIndex(a => a.name === this.activeTab);
      if ((!this.activeTab || index === -1) && arr.length) {
        this.setActiveTab(arr[0].name);
      }
    }

    private switchNav(nav: string) {
      this.activeNav = nav;
    }
    private height: number = 0
    private dd = ''
    private onMouseDownH(e: MouseEvent) {
      e.preventDefault();
      const ell = document.getElementById('liushibiao-open') as any;
      let y = e.clientY;
      let ellH = ell.offsetHeight;
      let ellT = ell.offsetTop;
      if (y > ellT) {
        this.dd = 'top';
      }
      document.onmousemove = (e) => {
        e.preventDefault();
        let yy = e.clientY;
        if (this.dd === 'top') {
          ell.style.height = ellH + y - yy + 'px';
          ell.style.maxHeight = 570 + 'px';
          ell.style.minHeight = 28 + 'px';
        }
        return false;
      };
      document.onmouseup = () => {
        document.onmousemove = null;
        document.onmouseup = null;
      };
    }
  }
</script>

<style lang="scss" scoped>
  .m-develop {
    width: 100%;
    height: 100%;
    position: absolute;
    bottom: 0;
    // top: 52px;
    // overflow: hidden;
    &-nav {
      display: none;
      flex: 0 0 32px;
      border-right: $border;
      box-sizing: border-box;
      background-color: #fff;
      box-shadow: 2px 0 4px 0 rgba(0,0,0,.08);
      .item {
        width: 64px;
        height: 64px;
        position: relative;
        text-align: center;
        cursor: pointer;
        line-height: 11px;
        color: #262626;
        padding: 11px 0;
        // border-bottom: $border;
        box-sizing: border-box;
        display: flex;
        align-items: center;
        flex-direction: column;
        .nav-title {
          display: block;
          height: 18px;
          margin-top: 4px;
          font-size: 12px;
        }
        &-topic {
          width: 32px;
          height: 32px;
          background-image: url('../../assets/images/icon_Topic.png');
          background-size: 100% 100%;
          margin: 0 auto;
        }
        &-sql {
          width: 32px;
          height: 32px;
          background-image: url('../../assets/images/icon_sqlTask.svg');
          background-size: 100% 100%;
          margin: 0 auto;
        }
        &-jar {
          width: 32px;
          height: 32px;
          background-image: url('../../assets/images/icon_jarTask.svg');
          background-size: 100% 100%;
          margin: 0 auto;
        }
        &-job {
          width: 24px;
          height: 24px;
          background-image: url('../../assets/images/icon_setting.svg');
          background-size: 100% 100%;
          margin: 0 auto;
        }
        &-metadata {
          width: 20px;
          height: 20px;
          background-image: url('../../assets/images/icon_ziyuan.png');
          background-size: 100% 100%;
          margin: 0 auto;
        }
        &-tag {
          width: 24px;
          height: 24px;
          background-image: url('../../assets/images/icon_tag.svg');
        }
        &-file {
          width: 32px;
          height: 32px;
          background-image: url('../../assets/images/icon_source.svg');
          background-size: 100% 100%;
          margin: 0 auto;
        }
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
        &:hover,
        &.active {
          .item-topic {
            background-image: url('../../assets/images/icon_Topic.png');
            width: 32px;
            height: 32px;
          }
          .item-sql {
            background-image: url('../../assets/images/icon_sqlTask.svg');
            width: 32px;
            height: 32px;
          }
          .item-jar {
            background-image: url('../../assets/images/icon_jarTask.svg');
            width: 32px;
            height: 32px;
          }
          .item-job {
            background-image: url('../../assets/images/icon_setting.svg');
            width: 24px;
            height: 24px;
          }
          .item-metadata {
            background-image: url('../../assets/images/icon_ziyuan.png');
            width: 32px;
            height: 32px;
          }
          .item-tag {
            background-image: url('../../assets/images/icon_tag_hover.svg');
          }
          .item-file {
            background-image: url('../../assets/images/icon_source.svg');
            width: 32px;
            height: 32px;
          }
        }
      }
    }
    &-tree {
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
      &.noborder {
        border: none;
      }
      // 新增 流式表样式
      .liushibiao-open {
        transition: height 0.3s;
        height: 28px;
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        text-align: center;
        background-color: #f3f3f3;
        .shang {
          height: 28px;
          line-height: 28px;
          background: url('../../assets/images/icon_jiantouUp.png') no-repeat #e7e7e7;
          background-position: 78% 50%;
          // background-color: #e7e7e7;
        }
        .xia {
          height: 28px;

          background: url('../../assets/images/icon_jiantou.png') no-repeat #e7e7e7;
          background-position: 50% 50%;
        }
        .permissionBox {
          // display: none;
          padding-top: 20px;
          background-color: #f3f3f3;
          .permissionImg {
            // margin-top: 20px;
            width: 80px;
            height: 80px;
            margin: 0 auto;
          }
          p {
            font-size: 14px;
            color: #555555;
            text-align: center;
          }
          .applyPermissionBtn {
            text-align: center;
            margin-top: 24px;
          }
        }
      }
      .el-collapse {
        width: 100%;
        position: absolute;
        bottom: 0;
        left: 0;
        // transform: translateX(-50%);
        // margin-top: 8px;
        .el-collapse-item__arrow {
          margin: unset;
        }
        .el-icon-arrow-right {
          background: url('../../assets/images/icon_jiantouUp.png') center no-repeat;
        }

        .el-icon-arrow-right:before {
          font-size: 16px;
          visibility: hidden;
        }
        .el-collapse-item__header {
          font-size: 12px;
          font-family: PingFangSC-Regular, PingFang SC;
          color: #555555;
          height: 28px;
          background-color: #e7e7e7;
          padding-left: 80px;
          &.is-active {
            padding-left: 104px;
          }
        }
        .el-collapse-item__arrow.is-active {
          transform: rotate(180deg);
        }
        .el-collapse-item__content {
          background-color: #fafafa;
          .permissionBox {
            // display: none;
            padding-top: 20px;
            .permissionImg {
              // margin-top: 20px;
              width: 80px;
              height: 80px;
              margin: 0 auto;
            }
            p {
              font-size: 14px;
              color: #555555;
              text-align: center;
            }
            .applyPermissionBtn {
              text-align: center;
              margin-top: 24px;
            }
          }
        }
      }
      // }

      .tree-close {
        width: 12px;
        height: 60px;
        border-right: 12px solid #e0e0e0;
        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        position: absolute;
        right: 0;
        top: 50%;
        transform: translateY(-50%);
        align-items: center;
        .li-right {
          position: relative;
          top: 35%;
          right: -7px;
        }
        .li-right:after {
          content: '';
          width: 7px;
          height: 7px;
          position: absolute;
          border-left: 1px solid #999999;
          border-bottom: 1px solid #999999;
          -webkit-transform: rotate(45deg);
          transform: rotate(45deg);
        }
      }
      .arrow-left{
        transform-origin: right;
        transform: rotateY(180deg);
        transition: 0.2s;
      }
      .arrow-right{
        right: 0;
        transform: rotateY(0deg);
        transition: 0.2s;
      }
      .tree-trick{

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
      .tree-open {
        width: 12px;
        height: 60px;
        border-left: 12px solid #e0e0e0;
        border-top: 12px solid transparent;
        border-bottom: 12px solid transparent;
        position: absolute;
        right: -12px;
        top: 50%;
        transform: translateY(-50%);
        align-items: center;
        .li-left {
          position: relative;
          top: 35%;
          right: 12px;
        }
        .li-left:after {
          content: '';
          width: 7px;
          height: 7px;
          position: absolute;
          border-left: 1px solid #999999;
          border-bottom: 1px solid #999999;
          -webkit-transform: rotate(-135deg);
          transform: rotate(-135deg);
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
    /*&-line {
      position: absolute;
      z-index: 10;
      box-sizing: border-box;
      width: 6px;
      height: 100%;
      cursor: ew-resize;
      &.active {
        border-left: $border_dot;
      }
      img {
        display: block;
        position: absolute;
        left: -5px;
        top: 50%;
        transform: translateY(-50%);
      }
    }*/
    &-ide {
      flex: 1;
      width: 0;
      z-index: 9;
      overflow: hidden;
    }
  }
</style>

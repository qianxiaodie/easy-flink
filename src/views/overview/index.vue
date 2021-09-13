<template>
  <div class="m-overview">
    <div v-if="topVisible" class="overview-tit">
      <el-form ref="form" :model="searchform" label-width="115px">
        <el-row>
           <el-col  :span="5">
             <el-form-item label="所属空间:" label-width="80px">
              <el-select @change="onChangeSpace" v-model="searchform.space" placeholder="请选择">
                <el-option
                  v-for="item in searchkjoptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col >
          <el-col  :span="5">
             <el-form-item label="所属项目: ">
              <el-select @change="onChangeCluster" v-model="filterproject" placeholder="请选择">
                <el-option
                  v-for="item in searchxmoptions"
                  :key="item.value"
                  :label="item.label"
                  :value="item.value">
                </el-option>
              </el-select>
            </el-form-item>
          </el-col >

          <el-col  :span="5">
            <el-form-item label-width="85px" label="集群:" >
              <!-- <ndc-select
              name="clusterId"
              value-key="id"
              label-key="clusterName"
              placeholder="集群版本"
              :options="clusterList"
              v-model="clusterId"
              @change="onChangeCluster"
            ></ndc-select> -->
              <el-select
              @change="onChangeCluster"
              v-model="searchform.cluster"
              placeholder="请选择">
                <el-option
                  v-for="item in clusterList"
                  :key="item.value"
                  :label="item.clusterName"
                  :value="item.id">
                </el-option>
              </el-select>
            </el-form-item>

          </el-col >

          <el-col :span="5">
            <el-form-item label="任务名称:">
              <el-input @change="onChangeKeyword"  v-model="keyword" placeholder="请输入任务名称"></el-input>
            </el-form-item>
          </el-col>
          <el-col :span="2" style="margin-left:30px">
            <div class="btnbox" @click="search()">
              <div class="btn">
                提交
              </div>
            </div>
          </el-col>
            </el-row>
      </el-form>
    </div>
    <div v-if="topVisible" class="m-overview-top">
      <div class="left">
        <div class="title">
          <img src="../../assets/lanhuicons/logo／任务运行备份.png" />
          任务运行
        </div>
        <div>
          <ul class="l-center-flex">
            <li class="l-c-lbox pointer" @click="setFilterStatus('', false)">
              <div style="line-height:50px">
                <img src="../../assets/lanhuicons/icon／任务运行／共有任务.png" />
                  {{jobCounter.total}}
              </div>
              <div class="tig">共有任务</div>
            </li>
            <li class="l-c-rbox">
              <div class="l-c-rbox-lay">
                <div>
                  <img src="../../assets/lanhuicons/icon／任务运行／CPU.png" />
                  <span style="font-weight:600"> {{overviewInfo.productCoreUsed}} </span>核
                </div>
              </div>

              <div class="tig qxddemo">CPU用量</div>
            </li>
             <li class="l-c-rbox" >
               <div class="l-c-rbox-lay">
                 <div >
                  <img src="../../assets/lanhuicons/icon／任务运行／产品内存.png" />
                    <span style="font-weight:600"> {{overviewInfo.productMemUsed}} </span> G
                 </div>
               </div>

              <div class="tig">内存用量</div>
            </li>
          </ul>
        </div>
        <div class="l-btm-pos">
          <ul class="l-btm-flex">
            <li class="bgbox normal pointer" @click="setFilterStatus('NORMAL', true)">
              <div class="num">
                {{jobCounter.normal}}
              </div>
              <div class="tig">
                正常
              </div>
            </li>
            <li class="bgbox delay pointer" @click="setFilterStatus('ABNORMAL', true)">
              <div class="num">
              {{jobCounter.abnormal}}
                 <!-- <a class="count g-text-link" :class="{'active': runtimeStatus === 'NORMAL'}" @click="setFilterStatus('NORMAL', true)">{{jobCounter.normal}}</a> -->
              </div>
              <div class="tig">
                异常
              </div>
            </li>
            <li class="bgbox abnormal pointer" @click="setFilterStatus('FAILED', true)">
              <div class="num">
                {{jobCounter.failed}}
              </div>
              <div class="tig">
                失败
              </div>
            </li>
            <li class="bgbox stop pointer" @click="setFilterStatus('STOPPED', false)">
              <div class="num">
                {{jobCounter.stopped}}
              </div>
              <div class="tig">
                停止
              </div>
            </li>
            <li class="bgbox other pointer" @click="setFilterStatus('NONE', false)">
              <div class="num">
                {{jobCounter.other}}
              </div>
              <div class="tig">
                其他
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="right">
        <div class="title">
          <img src="../../assets/lanhuicons/logo／任务运行备份.png" />
            集群用量
        </div>
        <div class="cbox">
          <div style="width:50%;height:100%">
            <div class="chartit">
               <img src="../../assets/lanhuicons/icon／任务运行／CPU.png" />
               CPU
            </div>
            <u-ring-chart
              ref="cpuChart"
              :used="cpuUsed" used-legend="使用"
              unused-legend="闲置"
              :used-color="cpuUsedColor"
              :unused-color="cpuUnusedColor"
              :used-num="overviewInfo.clusterCoreUsed"
              :total-num="overviewInfo.clusterCoreTotal"
              unit="核"
              used-num-color="#417EE8"
              unused-num-color="#417EE8"
            ></u-ring-chart>
          </div>
          <div style="width:50%;height:100%">
            <div class="chartit">
               <img src="../../assets/lanhuicons/icon／任务运行／产品内存.png" />
               内存
            </div>
            <u-ring-chart
              ref="memoryChart"
              :used="memoryUsed"
              used-legend="使用"
              unused-legend="闲置"
              :used-color="memoryUsedColor"
              :unused-color="memoryUnusedColor"
              :used-num="overviewInfo.clusterMemUsed"
              :total-num="overviewInfo.clusterMemTotal"
              unit="G"
              used-num-color="#F89534"
              unused-num-color="#F89534"
            ></u-ring-chart>
          </div>

        </div>
      </div>
    </div>
    <div class="m-overview-list" >
      <m-operation :opuserRule='opuserRule' :filterspace="this.searchform.space" :filterproject="this.filterproject" :filtercluster='filtercluster' :keyword="keyword" :job-status="jobStatus" :runtime-status="runtimeStatus" :is-overview="true" v-on:Visible="topvisible"></m-operation>
    </div>
      <!-- <m-operation-detail ref="detail" :job-detail="jobDetail" :starting="starting" :stoping="stoping"></m-operation-detail> -->

  </div>
</template>

<script lang="ts">
import { Component, Vue, Provide, Watch } from 'vue-property-decorator';
import { ICluster, IQueue, IJobCounter } from '@utils/types';
// import MOperationList from '../operation/components/list/index.vue';
import MOperation from '../operation/index.vue';
import URingChart from '../components/chart/ring-chart.vue';
import { Action, State } from 'vuex-class';
import { DatePicker, Switch, LocaleProvider, Popover } from 'ndc-antd';
import 'ndc-antd/style.js';
import createContextMenu from '@components/context-menu';
import '../../global.less';

import '../../../sloth-ndc-ui/packages/theme-chalk/src/index.scss';
import { Button, Radio, Checkbox, Form, FormItem, Modal, Select, Dropdown, Message, MessageBox, Tabs, TabPanel, Tree, Tooltip, VirtualList, File, Table, TableFilter, TableOrder, TableEmpty, TableLink, Pagination, Loading, Clipboard } from '../../../sloth-ndc-ui/packages/index.js';

import ElementUI from 'element-ui';
import 'element-ui/lib/theme-chalk/index.css';
import mixin from '@/mixin';
import Axios from 'axios';

import { MODULE_NAMESPACE } from '@utils/constant';
import Bus from '@/bus';
Vue.use(ElementUI);

Vue.use(Button);
Vue.use(Radio);
Vue.use(Checkbox);
Vue.use(Form);
Vue.use(FormItem);
Vue.use(Modal);
Vue.use(Select);
Vue.use(Dropdown);
Vue.use(Tabs);
Vue.use(TabPanel);
Vue.use(Tree);
Vue.use(Tooltip);
Vue.use(VirtualList);
Vue.use(File);
Vue.use(Table);
Vue.use(TableFilter);
Vue.use(TableOrder);
Vue.use(TableEmpty);
Vue.use(TableLink);
Vue.use(Pagination);
Vue.use(Loading);
Vue.use(Clipboard);

Vue.use(DatePicker);
Vue.use(Switch);
Vue.use(LocaleProvider);
Vue.use(Popover);
Vue.prototype.$ndcmessage = Message;
Vue.prototype.$ndcconfirm = MessageBox.confirm;
Vue.prototype.$contextmenu = createContextMenu;
Vue.mixin(mixin);

@Component({
  components: {
    MOperation,
    URingChart
  }
})

export default class Overview extends Vue {
 @Provide()
  private operation = null; // 只用于hack

  @State('userName', MODULE_NAMESPACE.global)

  private userName!: string;
  private clusterList: ICluster[] = [{
    id: 0,
    clusterName: '全部'
  }];
  private clusterId: number = 0;
  private queueList: IQueue[] = [];
  private queueId: number = 0;
  private overviewInfo: any = {};
  private topVisible: boolean = true;
  private filterproject :any = ''

  @State('jobCounter', MODULE_NAMESPACE.operation)
  private jobCounter!: IJobCounter;

  @Watch('jobCounter')
  private onjobCounterChanged(val: any) {
  }

  @Watch('jobCounter')
  private async onFilterprojectChanged(val: any) {

  }

  @Watch('opuserRule')
  private onopuserRuleChanged(val: any) { // 权限码
  }

  private cpuUsed: number = 0;
  private cpuUsedColor: any = {
    chart: ['#417EE8', "#417EE8"],
    legend: "#417EE8"
  };
  private cpuUnusedColor: any = {
    legend: "#CED3DB"
  };
  private memoryUsed: number= 0;
  private memoryUsedColor: any = {
    chart: ['#F89534', '#F89534'],
    legend: '#F89534'
  };
  private memoryUnusedColor: any = {
    legend: "#CED3DB"
  };

  private jobStatus: string = '';
  private runtimeStatus: string = '';
  private keyword: any = localStorage.getItem('sloth_searchkeyword') || "";
  private filtercluster: string = '';
  // private httpurl :any = "http://eip.htsc.com.cn/HTAI/v2/api/"
  // private httpurl :any =process.env.VUE_APP_OPERATION

  private setFilterStatus(status: string, isRuntime: boolean) {
    if (status === '') {
      this.jobStatus = '';
      this.runtimeStatus = '';
      return;
    }
    if (isRuntime) {
      this.jobStatus = '';
      this.runtimeStatus = status;
      return;
    }
    this.jobStatus = status;
    // console.log(status, "jobstatus");
    this.runtimeStatus = '';
  }

   private roleIds: any = []
   private havetesk: boolean = false

   private searchkjoptions: any = []

   private opuserRule: any = ['rtdev_proj']

   private searchxmoptions: any = []

   private userManagement: any = []

   private searchform: any = {
     space: '',
     project: '',
     cluster: ''// 集群
   }

  private WorkSpaceName:any = ""

  private UrlParams:any={} // 路由参数对象

  private topvisible(v) {
    this.topVisible = !v;
    // console.log('topvisible', this.topVisible);
  }

  private async getuserMange() {
    await Axios.get('/HTAI/v2/api/portal/api/infra/user-management/v1/userinfo', {
      params: {
        userId: JSON.parse(localStorage.getItem('userInfo') as string).ivUser || ''
      },
      headers: {
        API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
      }
    })
      .then((response) => {
        // console.log('获取用户组织', response.data.result);
        this.userManagement = response.data.result;
        window.localStorage.setItem('userManagement', JSON.stringify(this.userManagement));
        let getI = window.localStorage.getItem('userManagement');
        return this.userManagement;
      })
      .catch((err) => {
        console.log(err);
        alert('获取用户组织信息失败！');
      });
  }

  private async getRoleIds() {
    // 获取项目 设置option
    this.roleIds = [];
    await Axios.get(
      '/HTAI/v2/api/portal/api/infra/userProject/all?userId=' + JSON.parse(localStorage.getItem('userInfo') as any).id || '',
      {
        headers: {
          API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
        }
      })
      .then((response) => {
        // console.log(response.data.result, 'get所有项目查询', this.filterproject);
        response.data.result.forEach(e => {
          if (e.projectId === this.filterproject && this.roleIds.indexOf(e.roleId) === -1) {
            if (e.roleId.length > 1) {
              let arr = e.roleId.split(",");
              // console.log('get数组的roleid', arr);
              arr.forEach(val => {
                if (this.roleIds.indexOf(val) === -1) { this.roleIds.push(val); }
              });
            } else {
              this.roleIds.push(e.roleId);
            }
            //  console.log(this.roleIds,'get=====roleids1')
          }
        });
        //  response.data.result.foreach(e=>{
        //    console.log(e.projectId)
        //      if (e.projectId===this.filterproject&&this.roleIds.indexOf(e.roleId) === -1) {
        //        this.roleIds.push(e.roleId);
        //      }
        //  })
      }).catch(res => {
        console.log(res);
      });
  }
  private async getRole() {
    //  console.log(this.roleIds, '=======roleids');

    //  const userInfo = JSON.parse(window.localStorage.getItem('userInfo')as any);
    const params:any = [];

    this.roleIds.forEach(v => {
      params.push({
        roleCode: v,
        opCodes: [
          'rtdev_proj.devtest', 'rtdev_proj.devdeploy', 'rtdev_proj.jobmaintain', 'rtdev_proj.jobdecommission'
        ]
      });
    });
    // 根据角色列表和操作码列表获取有权限的操作码列表
    await Axios.post('/HTAI/v2/api/portal/api/infra/privs-management/v1/roles/opcodes', params,
      {
        headers: {
          API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
        }
      }
    )
      .then((response) => {
        // console.log('获取opcodes', response);
        const result = response.data;
        // console.log('获取data', result );

        //  localStorage.setItem('opuserRule', JSON.stringify(result.result));
        // console.log(result.data.result[0].opCodes, '获取13131313');
        // debugger
        if (result.result[0].opCodes) {
          this.opuserRule = result.result[0].opCodes;
          // console.log('获取 rule', result.result[0], this.opuserRule);
          // console.log('opCodes==0,390', result.result[0].opCodes);
          localStorage.setItem('sloth_roleRtdev', JSON.stringify(result.result[0].opCodes));
        }
        return response.data.result;
      })
      .catch((e) => {
        console.log(e);
      });
  }

  private async getWorkSpaceName(urlobj) {
    //
    await Axios.get('/HTAI/v2/api/portal/api/infra/workspace/getWorkSpaceName', {
      params: {
        eNames: urlobj.proName
      },
      headers: {
        API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
      }
    })
      .then((response) => {
        // console.log('空间简称res', response.data.result[0].name);
        this.WorkSpaceName = response.data.result[0].name;
        this.searchform.space = response.data.result[0].name;
        // console.log(this.WorkSpaceName, 'workspacename');
      })
      .catch((err) => {
        console.log(err);
        // alert('获取空间名称信息失败！');
      });
  }
  private async getWorkspace(urlobj, changeName) {
    let onlineParams:any = this.WorkSpaceName;
    await Axios.get(
      '/HTAI/v2/api/portal/api/infra/userProject/all?userId=' + JSON.parse(localStorage.getItem('userInfo') as any).id || '',
      {
        headers: {
          API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
        }
      }
    )
      .then((response) => {
        // console.log(response.data.result, '所有项目查询');
        let shiarr :any = []; // 所有空间的实时项目数组
        let omsshiarr :any = []; // 选定空间的实时项目数组
        // 从运维携带的空间名
        // let onlineParams :any = JSON.parse(localStorage.getItem('onlineParams') as any);

        response.data.result.forEach(e => {
          if (e.type === 4) { // 确定是实时项目
            shiarr.push(e);
            if (onlineParams && e.workspaceName === onlineParams) { // 筛选和指定空间名相同的空间下的所有实时项目
              omsshiarr.push(e);
            }
          }
          if (e.type === 33) { // 确定是v3项目
            shiarr.push(e);
            if (onlineParams && e.workspaceName === onlineParams) { // 筛选和指定空间名相同的空间下的所有实时项目
              omsshiarr.push(e);
            }
          }
        });

        console.log(shiarr,'查询的项目')


        if (!shiarr.length && !omsshiarr.length) {
          this.havetesk = true;
          this.$message.error('您暂无项目和任务');
          //  return false
        } else {
          // console.log(shiarr, '获取所有空间的实时项目数组');
          // console.log(omsshiarr, '88', omsshiarr.length, '==获取选定空间的实时项目数组',);
          // console.log(urlobj, '路由参数', urlobj.proName);

          if (urlobj.proName) {
            console.log('指定空间', omsshiarr, omsshiarr.length); // 选定空间后从运维进来的时候
            if (omsshiarr.length != 0) {
              this.searchkjoptions = [{
                value: omsshiarr[0].workspaceId,
                label: omsshiarr[0].workspaceName
              }];

              let arr :any = [];
              omsshiarr.forEach(e => {
                arr.push({
                  value: e.projectId,
                  label: e.projectName
                });

                //  this.roleIds=[]
                //  console.log('获取指定空间roleid==',e.workspaceName,urlobj.proName,this.searchxmoptions[0].value,this.searchxmoptions[0].label)
                //  if (this.roleIds.indexOf(e.roleId) === -1) {
                //    this.roleIds.push(e.roleId);
                //  }
              });
              this.searchxmoptions = arr;
            } else {
              this.$message.error('此空间下您暂无实时项目和任务');
              return false;
            }
          } else { // 未选定空间时
            console.log('未定空间');
            let opitons:any =  [];
            for (let k in shiarr) {
              let obj = {
                value: shiarr[k].workspaceId,
                label: shiarr[k].workspaceName
              };
              opitons.push(obj);
            }

            let  result :any = [];
            let obj = {};
            for (let i in opitons) {
              if (!obj[opitons[i].label]) {
                result.push(opitons[i]);
                obj[opitons[i].label] = true;
              }
            }
            this.searchkjoptions = result;

            //  this.WorkSpaceName = this.searchkjoptions[0].label
            let arr :any = [];
            console.log(changeName, 'changeName');
            if (changeName) {
              console.log('changeNametrue', this.searchform.space);
              let name = '';
              this.searchkjoptions.forEach(e => {
                if (e.value === this.searchform.space) {
                  name = e.label;
                }
              });
              // console.log(name);
              shiarr.forEach(e => {
                if ( e.workspaceName === name) {
                  arr.push({
                    value: e.projectId,
                    label: e.projectName
                  });
                  //  this.roleIds=[]
                  //  if (this.roleIds.indexOf(e.roleId) === -1) {
                  //     this.roleIds.push(e.roleId);
                  //   }
                }
              });
            } else {
              console.log('changeNamefalse');

              this.searchform.space = urlobj.jobSpace || this.searchkjoptions[0].value;
              shiarr.forEach(e => {
                // console.log(e, 'eeeee', this.searchkjoptions[0], this.searchkjoptions[0].value, this.searchform.space);
                if ( e.workspaceId === this.searchform.space) {
                  arr.push({
                    value: e.projectId,
                    label: e.projectName
                  });
                // this.roleIds=[]
                // if (this.roleIds.indexOf(e.roleId) === -1) {
                //   this.roleIds.push(e.roleId);
                // }
                }
              });
            }

            this.searchxmoptions = arr;
            let project = localStorage.getItem('sloth_searchproject') || "";
            console.log(project, 'sloth_searchproject1', this.searchxmoptions);
            if (project) {
              for (let i = 0; i < arr.length; i++) {
                this.filterproject = this.UrlParams.jobProject || this.searchxmoptions[0].value;
                console.log(this.filterproject,urlobj,this.UrlParams.jobProject,'filterproject1 urlobj')
                if (arr[i].value == localStorage.getItem('sloth_searchproject')) {
                  this.filterproject = this.UrlParams.jobProject || localStorage.getItem('sloth_searchproject');
                  console.log(this.filterproject, 'filterproject2 urlobj');

                  return false;
                }
              }
            } else {
              this.filterproject = this.UrlParams.jobProject || this.searchxmoptions[0].value;
              console.log(this.filterproject, 'filterproject3 urlobj');
            }
          }

          localStorage.setItem('sloth_team', this.searchxmoptions[0].value || 'null');
          localStorage.setItem('sloth_space', this.searchkjoptions[0].value || 'null');
        }

        // console.log(this.searchform.cluster, '77777777');
      })
      .catch((e) => {
        console.log(e);
      });
  }

  private async mounted() {
    //  let params = {userId:JSON.parse(localStorage.getItem('userInfo') as any).ivUser || '' }
    // 查询所有空间和项目
    // if(window.location.hostname=='168.63.118.52'){
    //   this.httpurl = 'http://168.61.10.47:8080/HTAI/'
    // }else if(window.location.hostname=='168.7.76.117' || window.location.hostname=='eip.htsc.com.cn'){
    //   this.httpurl= 'http://eip.htsc.com.cn/HTAI/v2/api/'
    // }else if(window.location.hostname=='168.61.114.48'){
    //   this.httpurl= 'http://168.61.114.48:8080/HTAI/'
    // }
    // this.opuserRule = result.result[0]
    localStorage.setItem('sloth_developer', ''); // 数据中台接口 第11个 根据项目id查询开发者账号和人员信息（通用接口）
    try {
      if (localStorage.getItem('sloth_searchcluster') as any) {
        this.searchform.cluster = Number(localStorage.getItem('sloth_searchcluster'));
      } else {
        this.searchform.cluster = 0;
      }
      this.queueId = 0;
      let onlineParams: any = "";

      let urlobj: any = {};
      if (window.location.href.indexOf('?') !== -1) {
        const url: any = window.location.href.split("?")[1];
        const urlarr = url.split("&");
        urlarr.forEach(v => {
          urlobj[v.split("=")[0]] = v.split('=')[1];
        });
        this.UrlParams = urlobj;
        if (window.location.href.indexOf('jobId') !== -1) {
          localStorage.setItem('sloth_searchkeyword', "");
          this.keyword = "";
        }
      }

      if (window.location.href.indexOf('proName') !== -1) {
        // 选定空间
        await this.getWorkSpaceName(urlobj);
        onlineParams = this.WorkSpaceName;
        await this.getWorkspace(urlobj, '');

        console.log(this.WorkSpaceName, '空间名', onlineParams);
      } else {
        // 未定空间
        if (localStorage.getItem('sloth_searchspace')) {
          // console.log(urlobj,'urlobj')

          this.searchform.space = urlobj.jobSpace || localStorage.getItem('sloth_searchspace');
          console.log(this.searchform.space, 'urlobj,space');
          await this.getWorkspace({}, this.searchform.space);
        } else {
          await this.getWorkspace(urlobj, "");
        }
      }
      if (this.havetesk) {
        return false;
      } else {
        if (localStorage.getItem('sloth_searchkeyword')) {
          // this.keyword = localStorage.getItem('sloth_searchkeyword')
          this.search();
          this.getClusterList();
          // console.log('urlobj===有搜索值', this.keyword);
          // const result = await this.getOperationJobList();
          // Bus.$emit('job_list_refresh', result);
        } else {
          this.getClusterList();

          //  this.getQueueList();
          // await this.getRoleIds();
          // await this.getRole();
          // console.log(this.roleIds, '最终获得的roleids');
          this.getOverviewDetail();
          this.getTagList();
          this.search();
          // console.log('urlobj=====无搜索指')
          // const result = await this.getOperationJobList();
          // Bus.$emit('job_list_refresh', result);
        }
      }

      // debugger
    } catch (e) {
      this.$handleException(e);
    }
    let appdom: any = document.getElementById('app');
    if (appdom) {
      appdom.style.height = 0;
      appdom.style.display = 'none';
    }

    // this.getuserMange().then((res) => {
      // console.log(this.userManagement,res,'挂载')
    // });
  }
  private async created() {
    let head = document.getElementsByTagName('head')[0];
    let script = document.createElement('script');
    script.async = false;
    script.src = "/HTAI/v2/sloth/static/config.js";
    head.appendChild(script);
  }

  private destoryed() {
    localStorage.removeItem('sloth_searchspace');
    localStorage.removeItem('sloth_searchproject');
    // localStorage.removeItem('sloth_searchkeyword');
    localStorage.removeItem('sloth_searchcluster');
    console.log("destory");
  }

  @Action('getOperationJobList', MODULE_NAMESPACE.operation)
  private getOperationJobList!: any;

  @Action('getTagList', MODULE_NAMESPACE.develop)
  private getTagList!: any;

  private async getClusterList() {
    try {
      const list: ICluster[] = await this.$request('getClusterList');
      this.clusterList = this.clusterList.concat(list);
      // this.clusterList.forEach(v=>{
      //   console.log(v,'getClusterList')
      //   if(v.id==localStorage.getItem('sloth_searchcluster')as any){
      //     this.searchform.cluster = localStorage.getItem('sloth_searchcluster')
      //   }
      // })
      // console.log(this.clusterList, "this.clusterList");
      return;
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async getQueueList() {
    if (this.clusterId === 0) {
      // this.queueList = [{
      //   id: 0,
      //   queueName: '全部队列'
      // }];
      // this.queueId = 0;
      return this.getOverviewDetail();
    }
    try {
      const list: IQueue[] = await this.$request('getQueueList', {
        clusterId: this.clusterId
      });
      this.queueList = [{
        id: 0,
        queueName: '全部队列'
      }].concat(list);
      this.queueId = 0;
      return this.getOverviewDetail();
    } catch (e) {
      this.$handleException(e);
    }
  }

  private async onChangeCluster() {
    if (this.havetesk) {
      this.$message.error('您暂无项目和任务');
      return false;
    }
    localStorage.setItem('sloth_space', this.searchform.space || 'null' );
    localStorage.setItem('sloth_team', this.filterproject || 'null' );
    console.log(this.filterproject, 'urlobj===onChangeCluster');
    localStorage.setItem('sloth_searchproject', this.filterproject);
    localStorage.setItem('sloth_searchcluster', this.searchform.cluster);

    this.filtercluster = this.searchform.cluster;
    this.clusterId = this.searchform.cluster;
    await this.getRoleIds();
    await this.getRole();
    // console.log(this.roleIds, '最终获得的roleids');
    return this.getQueueList();
  }

  private async onChangeSpace() {
    if (this.havetesk) {
      this.$message.error('您暂无项目和任务');
      return false;
    }
    localStorage.setItem('sloth_space', this.searchform.space || 'null' );
    localStorage.setItem('sloth_team', this.filterproject || 'null' );
    this.filtercluster = this.searchform.cluster;
    this.clusterId = this.searchform.cluster;
    localStorage.setItem('sloth_searchspace', this.searchform.space);
    await this.getRoleIds();
    await this.getRole();
    // console.log(this.roleIds, '最终获得的roleids');
    await this.getWorkspace({}, this.searchform.space);
    return this.getQueueList();
  }

  private onChangeKeyword(result) {
    if (this.havetesk) {
      this.$message.error('您暂无项目和任务');
      return false;
    }
    localStorage.setItem('sloth_searchkeyword', result);
    this.keyword = result;
    this.onChangeQueue();
    return this.getQueueList();
  }

  private async search() {
    if (this.havetesk) {
      this.$message.error('您暂无项目和任务');
      return false;
    }
    localStorage.setItem('sloth_space', this.searchform.space || 'null' );
    localStorage.setItem('sloth_team', this.filterproject || 'null' );

    this.filtercluster = this.searchform.cluster;
    this.clusterId = this.searchform.cluster;
    // console.log('调用===', this.keyword);
    await this.getRoleIds();
    await this.getRole();
    // console.log(this.roleIds, '最终获得的roleids');
    return this.getQueueList();
  }

  private async onChangeQueue() {
    return this.getOverviewDetail();
  }

  private async getOverviewDetail() {
    try {
      const info = this.overviewInfo = await this.$request('getResourceDetail', {
        clusterId: this.clusterId,
        queueId: this.queueId
      });
      const cpuUsed = Math.ceil(info.clusterCoreUsed / info.clusterCoreTotal * 100);
      this.cpuUsed = isNaN(cpuUsed) ? 0 : cpuUsed;
      const memoryUsed = Math.ceil(info.clusterMemUsed / info.clusterMemTotal * 100);
      this.memoryUsed = isNaN(memoryUsed) ? 0 : memoryUsed;
      this.$nextTick(() => {
        this.resize();
      });
    } catch (e) {
      this.$handleException(e);
    }
  }

  private resize() {
    const cpuChart = this.$refs.cpuChart as URingChart;
    cpuChart && cpuChart.setOptions();
    const memoryChart = this.$refs.memoryChart as URingChart;
    memoryChart && memoryChart.setOptions();
  }
}
</script>

<style lang="scss">
.pointer{
  cursor: pointer;
}
.m-overview {
  width: 100%;
  height: 1180px;
  // padding: 24px;
  box-sizing: border-box;
  background: #FAFAFA;
  overflow: hidden;
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
  .overview-tit{
    box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
    background: #fff;
    width: 100%;
    height: 70px;
    box-sizing: border-box;
    // border: $border;
    border-radius: 3px;
    margin-bottom: 15px;
    font-size: 14px;
    padding-left:20px;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .el-col{
      height: 55px;
      // margin-right: 40px;
    }
    .el-form{
      // margin-top:15px;
      height: 40px;
      // display:flex;
      // width: 100%;
      // justify-content: space-between;
    }
    .el-form-item{
      // width: 350px;
      width:100%;
      margin-bottom: 0;
    }
    .el-select{
      width: 95%;
    }
    .el-input__inner{
      height: 32px;
      // min-width: 210px;
      line-height: 32px;
    }
    .btnbox{
      text-align: center;
      cursor: pointer;
      margin-left: 20px;
      margin-top:3px ;
      .btn{
            width: 68px;
            line-height: 32px;
            font-size: 14px;
            color: #fff;
            background: #3B68B7;
            border-radius: 3px;
          }
    }

  }
  &-top {
    display: flex;
    justify-content: space-between;
    box-sizing: border-box;
    height: 280px;
    clear: both;
    margin-bottom: 16px;
    .left {
      background: #fff;
      width: 50%;
      height: 100%;
      padding: 16px 20px;
      box-sizing: border-box;
      // border: $border;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
      border-radius: 3px;
      .title {
        font-size: 20px;
        // margin-top: 8px;
        font-weight: 600;
        color: #222222;
      }
      .l-center-flex{
        display: flex;
        margin: 20px 5px;
        justify-content: space-between;
        .l-c-lbox{
          width: 50%;
          font-size: 40px;
          img{
            width: 16px;
            height: 16px;
          }
        }
        .l-c-rbox{
          span{
            font-size: 24px;
          }
          &-lay{
            height:50px;
            display:flex;
            align-items: flex-end;
          }

          font-size:14px;
          line-height: 32px;
          // width: 25%;
        }
        .tig{
            font-size: 14px;
            line-height: 20px;
            color: #888;
          }
      }
      .l-btm-pos{
        margin-top: 50px;
      }
      .l-btm-flex{
        display: flex;
        box-sizing: border-box;
        justify-content: space-between;
        margin-top: 35px;
        .bgbox {
          width: 20%;
          height: 88px;
          border-radius:3px ;
          margin-right: 16px;
          box-sizing: border-box;
          padding: 18px 16px;
          text-align: center;
          color: #fff;
          .num{
            font-size: 24px;
            line-height: 32px;
            margin-bottom: 5px;
          }
          .tig{
            font-size: 14px;
            // margin-bottom: 18px;
          }
          &.normal {
            background: #4CD79F;
          }
          &.delay {
            background: #F89534;
          }
          &.abnormal {
            background: #F5827E;
          }
          &.stop{
            background: #7585A2;
          }
          &.other{
            background: #417EE8;
            margin-right: 0;
          }
        }
      }
    }
    .right {
      background: #fff;
      width: 50%;
      margin-left: 16px;
      height: 100%;
      padding: 16px 20px;
      box-sizing: border-box;
      // border: $border;
      box-shadow: 0px 2px 4px 0px rgba(0, 0, 0, 0.12);
      border-radius: 3px;
     .cbox{
        display: flex;
        align-items: center;
        flex: 1;
        height: 70%;
        .chartit{
          margin-top: 15px;
          font-size: 16px;
          color: #222222;
        }
     }
      .title {
        font-size: 20px;
        // margin-top: 8px;
        font-weight: 600;
        color: #222222;
      }
      .u-ring-chart {
        width: 100%;
        height: 100%;
      }
    }
  }
  &-list {
    // margin-top: 16px;
    height:94%;
    // max-height: 800px;
    // overflow-y: auto;
    // border: $border;
    border-radius: 3px;
    box-sizing: border-box;
    background: #fff;
  }
}
</style>

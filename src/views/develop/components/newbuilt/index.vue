<template>
  <div class="m-newbuilt">
    <div class="m-newbuilt-title" @click="back">
      <a-icon type="left" />
      <span v-if="isedit">配置信息</span>
      <span v-else>新建表</span>
    </div>
    <div class="m-newbuilt-tit" @click="changeout">
      <a-icon v-if="outbool" type="down" />
      <a-icon v-else type="up" />离线数据存储配置
    </div>
    <div v-show="outbool" class="m-newbuilt-info">
      <!-- <a-form
        layout="horizontal"
        :form="outform"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 10 }"
      >-->
      <a-form-item :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" label="集群" required>
        <span>{{catalog}}</span>
      </a-form-item>
      <a-form-item label="数据库" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
        <span>{{database}}</span>
      </a-form-item>
      <a-form-item label="表名称" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
        <a-select
          :disabled="isedit"
          v-model="tableName"
          style="width: 200px"
          @change="changetablename"
        >
          <a-select-option
            v-for="(item,index) in listname"
            :key="index"
            :value="item.tableName"
            :disabled="item.arctic"
          >{{item.tableName}}</a-select-option>
        </a-select>
      </a-form-item>
      <!-- <a-form-item label="字段" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
        <a-table
          :columns="fieldcolumns"
          :data-source="columnList"
          :pagination="fieldtotal>25"
          bordered
        ></a-table>
      </a-form-item>
      <a-form-item label="分区字段" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
        <a-table
          :columns="fieldcolumns"
          :data-source="partitionColumnList"
          :pagination="Partfieldtotal>25"
          bordered
        ></a-table>
      </a-form-item>-->
      <a-form-item label="主键" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }">
        <div v-if="isedit" class="m-edit-pklist">
          <span
            style="color:#eddb9c;margin-right:16px"
            v-for="(item,index) in pkList"
            :key="index"
          >{{item.name}}</span>
        </div>
        <u-alarm-input v-else v-on:changeVal="lockValueSel" :options="pkList"></u-alarm-input>
        <span class="m-newbuilt-tips" v-show="isuser">未选择主键的情况下，不支持 Update 操作</span>
      </a-form-item>
      <a-form-item label="合并到数据Hive" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
        <a-radio-group v-model="mergehive" @change="hiveonChange">
          <a-radio :value="true">是</a-radio>
          <a-radio :value="false">否</a-radio>
        </a-radio-group>
      </a-form-item>
      <a-form-item
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 13 }"
        v-show="ismergehive"
        label="合并时间"
        name="time"
        required
      >
        <a-radio-group v-model="mergetime" @change="timeonChange">
          <a-radio :value="true">固定周期</a-radio>
          <a-radio :value="false">固定时刻</a-radio>
        </a-radio-group>
        <div v-if="mergetime">
          每
          <input class="ndc-input" v-model="interval" @input="onJumpInput" />
          <a-select v-model="timeround" style="width:80px" @change="timeroundChange">
            <a-select-option value="min">分钟</a-select-option>
            <a-select-option value="hour">小时</a-select-option>
          </a-select>
        </div>
        <div v-else>
          <a-form :form="outform">
            <!-- 客户姓名 -->
            <a-form-item>
              <a-input
                type="string"
                autocomplete="off"
                v-decorator="[
                    'fixedtime',
                    {
                    rules: [
                        { required: false, message: '请输入24小时制时刻“HH:mm“，多个时刻以空格隔开' },]
                    },
                ]"
                @blur="validatetimeBlur"
                placeholder="请输入24小时制时刻“HH:mm“，多个时刻以空格隔开"
              />
            </a-form-item>
          </a-form>
        </div>
      </a-form-item>
      <a-form-item
        v-show="ismergehive"
        label="合并范围"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 10 }"
        required
      >
        <a-radio-group v-model="mergeround" @change="roundonChange">
          <a-radio :value="true">全部</a-radio>
          <a-radio :value="false">部分</a-radio>
        </a-radio-group>
        <div v-if="!mergeround">
          最新
          <input class="ndc-input" :value="roundvalue" @input="onJumpInput" /> 个分区
        </div>
      </a-form-item>
      <!-- </a-form> -->
    </div>
    <!-- <div class="m-newbuilt-tit">
      <div @click="changecdc" style="float:left;margin-right:16px">
        <a-icon v-if="cdcbool" type="down" />
        <a-icon v-else type="up" />CDC配置
      </div>
      <a-switch :disabled="isedit" v-model="cdcenable" @change="cdconChange" />
    </div>
    <div v-show="cdcbool" class="m-newbuilt-info">
      <a-form
        layout="horizontal"
        :form="cdcform"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 10 }"
      >
        <a-form-item label="Kafka集群" required>
          <a-select
            :disabled="isedit"
            placeholder="请选择集群"
            v-model="cluster"
            style="width:160px"
            @change="clusterchange"
          >
            <a-select-option
              v-for="(item,index) in clusterlist"
              :value="item.name"
              :key="index"
              :disabled="isedit"
            >{{item.name}}</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="Broker 地址">
          <textarea disabled v-model="broker" style="cursor: not-allowed;width:260px;padding:5px"></textarea>
        </a-form-item>
        <a-form-item label="Topic" required>
          <a-input
            :disabled="isedit"
            type="string"
            v-decorator="[
                    'topic',
                    {
                    rules: [
                        { required: false, message: '请输入Topic名称' },]
                    },
                ]"
            @blur="validatetopicBlur"
            placeholder="请输入Topic名称"
          />
          <div v-if="warning" style="color: #faad14;">Topic已存在</div>
          <div v-if="success" style="color: #52c41a;">Topic未被占用</div>
        </a-form-item>

        <a-form-item label="副本数">
          <a-input
            :disabled="isedit"
            type="string"
            v-decorator="[
                    'replication',
                    {
                    rules: [
                        { required: true, message: '副本数不能为空' },]
                    },
                ]"
          />
        </a-form-item>
        <a-form-item name="partition" label="分区数">
          <a-input
            :disabled="isedit"
            v-decorator="[
                    'partition',
                    {
                    rules: [
                        { required: true, message: '分区不能为空' },]
                    },
                ]"
          />
        </a-form-item>
        <a-form-item label="实时数据湖" required>
          <a-radio-group :disabled="isedit" v-model="datalake" @change="datalakeChange">
            <a-radio :value="true">开启</a-radio>
            <a-radio :value="false">关闭</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>-->

    <!-- <div class="m-newbuilt-tit" @click="changeother">
      <a-icon v-if="otherbool" type="down" />
      <a-icon v-else type="up" />其他配置
    </div>
    <div v-show="otherbool" class="m-newbuilt-tab">
      <div class="m-newbuilt-tab-othertit">
        <div style="width:250px">参数</div>
        <div style="width:250px">值</div>
      </div>
      <div class="m-newbuilt-tab-other" v-for="(item,index) in paramslist" :key="index">
        <div class="div" style="width:250px;height:34px">
          <a-auto-complete
            :data-source="TableProperties"
            style="width: 200px"
            placeholder="input here"
            v-model="item.params"
            @change="propertieschange(item.params,index)"
          />
        </div>
        <div class="div" style="width:230px;height:34px">
          <input type="text" class="addinput" v-model="item.value" />
        </div>
        <a-icon style="width:20px;cursor:pointer" type="close" @click="delparams(index)" />
      </div>
      <div @click="addparams" class="m-newbuilt-tab-add">+</div>
    </div>-->
    <div class="m-newbuilt-foot">
      <a-button type="primary" @click="check">确定</a-button>
      <a-button @click="cancle">取消</a-button>
    </div>
    <a-modal @ok="goback()" width="300px" v-model="canclemodal" title="提示">
      <div class="ant-modal-confirm-body">
        <!-- <a-icon type="question-circle" :style="{ fontSize: '22px', color: '#faad14' }" /> -->
        <a-icon type="exclamation-circle" :style="{ fontSize: '30px', color: '#1890ff' }" />
        <span class="ant-modal-confirm-title">确定要离开当前页面？</span>

        <div class="ant-modal-confirm-content">离开后已更改信息将不会保留</div>
      </div>
    </a-modal>
    <a-modal width="300px" v-model="successmodal" :footer="false" title="提示">
      <div class="ant-modal-confirm-body" style="height:60px">
        <a-icon type="check-circle" :style="{ fontSize: '30px', color: '#52c41a' }" />
        <span class="ant-modal-confirm-title">新建表成功！</span>
      </div>
    </a-modal>
  </div>
</template>
<script lang="ts">
import { Component, Vue, Provide } from "vue-property-decorator";
import UAlarmInput from "./alarm-input.vue";

@Component({
  components: {
    UAlarmInput
  }
})
export default class Newbuilt extends Vue {
  private outform: any;
  private cdcform: any;
  private warning: boolean = false;
  private success: boolean = false;
  private isedit: boolean = false;
  private created() {
    this.outform = this.$form.createForm(this, { name: "dynamic_rule" });
    // this.cdcform = this.$form.createForm(this, { name: "cdcform_rule" });
  }
  private outbool: boolean = true;
  private basebool: boolean = true;
  private cdcbool: boolean = true;
  private otherbool: boolean = true;
  private isuser: boolean = true;
  private ismergehive: boolean = true;
  private topicflag: boolean = true;
  private cdcenable: Boolean = true;
  private catalog: string = this.$route.query.catalog;
  private database: string = this.$route.query.database;
  private tableName: string = "";
  private mergehive = true;
  private mergetime = true;
  private mergeround = true;
  private successmodal: boolean = false;
  private canclemodal: boolean = false;
  private interval: any = 20;
  private roundvalue = ""; //
  private fixedTimes: object = [];
  private cluster = "";
  private timeround: string = "min";
  private broker: string = "xxx.xxx.xxx.xxx";
  private partition: string = "";
  private topic: string = "";
  private replication: string = "";
  private datalake: boolean = true;
  private TableProperties: object = []; //下拉选项数组
  private paramsData: object = []; //配置项：值 的数组
  private paramslist: object = []; //最后提交的数组
  private changeDetail: object = {
    time: "2021-06-17 20:38:32"
  };
  private listname: object = [];
  private clusterlist: object = [];
  private fieldcolumns: object = [
    {
      dataIndex: "name",
      title: "字段"
    },
    {
      dataIndex: "type",
      title: "类型"
    },
    {
      dataIndex: "comment",
      title: "描述"
    }
  ];
  private columnList: object = [];
  private partitionColumnList: object = [];
  private configcolumns: object = [
    {
      dataIndex: "parameter",
      title: "参数"
    },
    {
      dataIndex: "val",
      title: "值"
    }
  ];
  private configData: object = [
    {
      parameter: "compact.major",
      val: "true"
    }
  ];
  private fieldtotal: number = 5;
  private Partfieldtotal: number = 5;

  private pkList: object = [];
  private finalpklist: object = [];
  private times: any = "";

  private back() {
    this.canclemodal = true;
  }

  private goback() {
    this.$router.back();
    this.canclemodal = false;
  }

  private async getTableNames() {
    //获取hive表
    const res = await this.$request("getHiveTables", {
      catalog: this.catalog,
      database: this.database
    });
    this.listname = res.result;
    console.log(this.listname, "listname");
  }

  private async getHiveTableInfo() {
    const res = await this.$request("getHiveTableInfo", {
      catalog: this.catalog,
      database: this.database,
      tableName: this.tableName
    });

    if (res.code !== 200) {
      this.$handleException(res, res.message);
    }
    this.partitionColumnList = res.result.partitionColumnList; //分区字段
    this.Partfieldtotal = res.result.partitionColumnList.length;
    this.fieldtotal = res.result.columnList.length;
    this.columnList = res.result.columnList; //字段
    this.pkList = res.result.columnList; //主键
    console.log(res, "partitionColumnList");
  }

  private async getKafkaClusterInfos() {
    const res = await this.$request("getKafkaClusterInfos", {});
    this.clusterlist = res.result;
    this.cluster = this.clusterlist[0].name;
    this.broker = this.clusterlist[0].brokerList;
    this.partition = this.clusterlist[0].defaultPartition;
    this.replication = this.clusterlist[0].defaultReplication;
    console.log(res, "getKafkaClusterInfos");
  }

  private async checkKafkaTopicExist(val) {
    let res = await this.$request("checkKafkaTopicExist", {
      topic: val,
      brokerList: this.broker
    });
    res = res.result;
    // if(res.result){
    //   this.warning=true
    //   this.success=false

    // }else{
    //   this.success=true
    //   this.warning=false

    // }
    console.log(res, "checkKafkaTopicExist");

    return res;
  }

  private async getTableProperties() {
    const res = await this.$request("getTableProperties", {});
    let arr = [];
    let arr2 = [];
    for (let i in res.result) {
      arr.push({ params: i, value: res.result[i] });
      arr2.push(i);
    }
    this.TableProperties = arr2;
    this.paramsData = arr;
    // this.paramslist = res;
    // console.log(arr, arr2, "getTableProperties");
  }

  private async getTableMeta() {
    this.tableName = this.$route.query.tableName;
    const res = await this.$request("getTableMeta", {
      catalog: this.catalog,
      database: this.database,
      tableName: this.$route.query.tableName
    });
    this.columnList = res.result.columnList;
    this.partitionColumnList = res.result.partitionColumnList;
    this.pkList = res.result.pkList;
    this.cdcenable = res.result.cdcMeta.enable;
    this.cluster = res.result.cdcMeta.kafkaClusterInfo.name;
    this.broker = res.result.cdcMeta.kafkaClusterInfo.brokerList;
    // this.topic = res.cdcMeta.topicInfo.topicName;
    // this.partition = res.cdcMeta.topicInfo.partition;
    // this.replication = res.cdcMeta.topicInfo.replication;
    // this.cdcform.setFieldsValue({
    //   replication: res.result.cdcMeta.topicInfo.replication,
    //   partition: res.result.cdcMeta.topicInfo.partition,
    //   topic: res.result.cdcMeta.topicInfo.topicName
    // });
    this.datalake = res.result.cdcMeta.intoArctic;
    this.mergehive = res.result.adaptHiveMeta.enable;
    this.mergetime =
      res.result.adaptHiveMeta.mergeType == "FIXED_INTERVAL" ? true : false;
    this.interval = res.result.adaptHiveMeta.interval / 6000;
    this.fixedTimes = res.result.adaptHiveMeta.fixedTimes;
    this.outform.setFieldsValue({
      fixedTimes: res.result.adaptHiveMeta.fixedTimes
    });
    this.mergeround = res.result.adaptHiveMeta.mergeAll;
    this.roundvalue = res.result.adaptHiveMeta.partitionCnt;
    let result = res.result.properties;
    let arr = [];
    for (let i in result) {
      arr.push({ params: i, value: result[i] });
    }
    this.paramslist = arr;
    console.log(res, "getTableMeta");
  }
  //   private outform: any
  private async mounted() {
    await this.getTableNames();
    await this.getKafkaClusterInfos();
    await this.getTableProperties();
    if (this.$route.query.tableName) {
      this.isedit = true;
      await this.getTableMeta();
    }
  }
  private validatetimeBlur(e) {
    console.log(e.target.value);
    const validatetimeReg = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
    const values = e.target.value;
    const arr = values.split(" ");
    let flag = false;
    arr.forEach(element => {
      console.log(element, validatetimeReg.test(element));
      if (element && !validatetimeReg.test(element)) {
        flag = true;
      } else {
        flag = false;
      }
    });
    if (e.target.value && flag) {
      const arr = [
        {
          message: "请输入24小时制时刻“HH:mm“，多个时刻以空格隔开!",
          field: "fixedtime"
        }
      ];
      this.outform.setFields({
        fixedtime: { value: e.target.value, errors: arr }
      });
    }
  }
  private async validatetopicBlur(e) {
    const reg = /^[a-z0-9A-Z._]+$/;
    let topicflag = true;
    console.log(e.target.value);
    if (e.target.value && reg.test(e.target.value)) {
      topicflag = await this.checkKafkaTopicExist(e.target.value);
    }
    console.log(topicflag);
    if (e.target.value && !reg.test(e.target.value)) {
      const arr = [
        {
          message: "只支持输入字母、数字、下划线、点",
          field: "topic"
        }
      ];
      this.success = false;
      this.warning = false;
      // this.cdcform.setFields({
      //   topic: { value: e.target.value, errors: arr }
      // });
    } else if (!e.target.value) {
      const arr = [
        {
          message: "请输入topic",
          field: "topic"
        }
      ];
      this.warning = false;
      this.success = false;
      // this.cdcform.setFields({
      //   topic: { value: e.target.value, errors: arr }
      // });
      console.log("请输入topic");
    } else if (topicflag) {
      this.success = false;
      this.warning = true;
    } else {
      this.warning = false;
      this.success = true;
    }
    // });
  }
  private propertieschange(val, k) {
    console.log(val, k, this.paramsData, "properties");
    let value = "";
    this.paramsData.forEach(e => {
      if (val == e.params) {
        value = e.value;
        return;
      }
    });
    this.paramslist[k] = { params: val, value: value };
    console.log(this.paramslist);
  }
  private async check() {
    this.outform.validateFields(async (err, values) => {
      if (!err) {
        // console.info("success", values);
        const arr = values.fixedtime && values.fixedtime.split(" ");
        this.fixedTimes = arr;
        console.log(values.fixedtime, arr);
      }
    });
    // return
    // this.cdcform.validateFields(async (err, values) => {
    //   if (!err) {
    //     // console.info("success",values);
    //     this.partition = values.partition;
    //     this.topic = values.topic;
    //     this.replication = values.replication;
    //   }
    // });
    let params = await this.getparams();
    console.log(params, "params", this.isedit);
    let res: any = {};
    if (this.isedit) {
      res = await this.updateTable(params);
    } else {
      res = await this.createTable(params);
    }
    if ((res.message = "success")) {
      this.successmodal = true;
      this.times = setTimeout(() => {
        this.$router.push({
          name: "database"
        });
      }, 2000);
    }
    console.log(res, "getKafkaClusterInfos");
  }
  private async updateTable(params) {
    let res = await this.$request("updateTable", params);
    return res;
  }
  private async createTable(params) {
    let res = await this.$request("createTable", params);
    return res;
  }
  private async getparams() {
    let properties = {};
    this.paramslist.forEach(e => {
      properties[e.params] = e.value;
    });
    let intervals: any = 0;
    if (this.timeround == "min") {
      intervals = this.interval * 6000;
    } else {
      intervals = this.interval * 3600000;
    }
    let obj = {
      userId: "wangtao03",
      productId: "1",
      userName: "未知",
      catalog: this.catalog,
      database: this.database,
      tableName: this.tableName,
      tableIdentifier: {
        //关联数据模型表
        catalog: this.catalog,
        database: this.database,
        tableName: this.tableName
      },
      columnList: this.columnList,
      pkList: this.isedit ? this.pkList : this.finalpklist, //主键
      partitionColumnList: this.partitionColumnList,
      cdcMeta: {
        enable: this.cdcenable, //CDC配置开关
        kafkaClusterInfo: {
          name: this.cluster, //选中的kafka集群名字
          zkAddress: "",
          brokerList: this.broker //对应的kafka broker地址
        },
        topicInfo: {
          topicName: `${this.catalog}.${this.database}.${this.tableName}`,
          partition: this.partition, //分区
          replication: this.replication //副本
        },
        intoArctic: this.datalake //实时数据入湖
      },

      adaptHiveMeta: {
        enable: this.mergehive, //是否合并数据到hive
        mergeType: this.mergetime ? "FIXED_INTERVAL" : "FIXED_TIME", //合并时间/方式
        interval: intervals, //周期配置 传ms
        fixedTimes: this.fixedTimes, //时刻配置
        mergeAll: this.mergeround, //合并分区？
        partitionCnt: this.roundvalue //最近几个分区
      },
      properties: properties
    };
    return obj;
  }

  private cancle() {}
  private changeout() {
    this.outbool = !this.outbool;
  }

  // private changecdc() {
  //   this.cdcbool = !this.cdcbool;
  // }
  private changeother() {
    this.otherbool = !this.otherbool;
  }

  private lockValueSel(val) {
    console.log(val, "选中的pklist");
    this.isuser = false;
    this.finalpklist = val;
  }
  private hiveonChange() {
    console.log(this.mergehive);
  }
  private delparams(index) {
    this.paramslist.splice(index, 1);
  }
  private addparams() {
    this.paramslist.push({
      params: "",
      value: ""
    });
  }
  private async changetablename(val) {
    console.log(val);
    // await this.getTableMeta();
    this.getHiveTableInfo();
  }
  private timeonChange() {}
  private roundonChange() {}
  private onJumpInput() {}
  private timeroundChange() {}
  // private cdconChange() {}
  private clusterchange(value) {
    console.log(value);
    this.clusterlist.forEach(e => {
      if (e.name == value) {
        console.log(e.brokerList);
        this.broker = e.brokerList;
      }
    });
  }
  private datalakeChange() {}
}
</script>
<style lang="scss" scoped>
.m-newbuilt {
  color: #eddb9c;
  // background: #263238;
  width: 100%;
  height: 100%;
  padding: 0 16px;
  overflow-y: scroll;
  &-title {
    color: #eddb9c;
    cursor: pointer;
    font-size: 16px;
    border-bottom: $border;
    line-height: 40px;
  }
  &-tit {
    color: #eddb9c;
    margin-top: 10px;
    cursor: pointer;
    font-size: 14px;
  }
  &-info {
    width: 60%;
    min-height: 75%;
    font-size: 12px;
    color: #eddb9c;
  }
  &-tab {
    width: 500px;
    line-height: 32px;
    color: #eddb9c;
    &-othertit {
      display: flex;
      width: 500px;
      margin-top: 5px;
      background: #888;
      div {
        width: 250px;
        border: $border;
        box-sizing: border-box;
        padding-left: 5px;
      }
    }
    &-other {
      display: flex;
      width: 500px;
      align-items: center;
      .div {
        border: $border;
        box-sizing: border-box;
        padding-left: 5px;
        input {
          border: none;
        }
      }
    }
    &-add {
      width: 500px;
      border: $border;
      text-align: center;
      cursor: pointer;
    }
  }
  .formtit:before {
    display: inline-block;
    margin-right: 4px;
    color: #f5222d;
    font-size: 14px;
    font-family: SimSun, sans-serif;
    line-height: 1;
    content: "*";
  }
  &-tips {
    font-size: 12px;
  }
  &-foot {
    padding: 16px;
    button {
      margin-right: 16px;
    }
    border-top: $border;
  }
  .m-edit-pklist {
    width: 320px;
    height: 32px;
    line-height: 32px;
    padding: 0 16px;
    border: $border;
    cursor: not-allowed;
  }
}
</style>
<style >
.ant-form-item-label {
  text-align: left;
}
.ant-form-item {
  margin: 5px 0;
}
.ant-table-thead > tr > th,
.ant-table-tbody > tr > td {
  padding: 5px;
}
.ndc-input {
  width: 48px;
  height: 32px;
  border-color: #bbb;
  box-sizing: border-box;
  width: 48px;
  height: 32px;
  text-align: center;
  padding: 4px 10px;
  border: 1px solid #d2d7e0;
  border-radius: 2px;
  font-size: 14px;
  line-height: 32px;
  color: #eddb9c;
}
.has-error .ant-input,
.has-error .ant-input:hover {
  color: #f5222d;
}
.ant-select-auto-complete.ant-select .ant-input {
  height: 24px !important;
  padding: 0 !important;
  border: none !important;
}
</style>
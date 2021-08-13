<template>
  <div class="m-newbuilt">
    <div class="m-newbuilt-title">
      <div @click="back" style="margin-right:16px;float:left;">
        <a-icon type="left" />
        <span>配置信息</span>
      </div>
      <span style="color:#3b68b7;font-size:14px" @click="goedit">
        <a-icon type="edit" />编辑
      </span>
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
        <span>{{tableName}}</span>
      </a-form-item>
      <a-form-item label="字段" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
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
      </a-form-item>
      <a-form-item label="主键" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }">
        <span v-for="(item,index) in pkList" :key="index">{{item.name}}</span>&nbsp;&nbsp;
        <!-- <u-alarm-input v-on:changeVal="lockValueSel" :options="pkList"></u-alarm-input> -->
        <!-- <span class="m-newbuilt-tips" v-show="isuser">未选择主键的情况下，不支持 Update 操作</span> -->
      </a-form-item>
      <a-form-item label="合并到数据Hive" :label-col="{ span: 5 }" :wrapper-col="{ span: 10 }" required>
        <a-radio-group disabled v-model="mergehive" @change="hiveonChange">
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
        <a-radio-group disabled v-model="mergetime" @change="timeonChange">
          <a-radio :value="true">固定周期</a-radio>
          <a-radio :value="false">固定时刻</a-radio>
        </a-radio-group>
        <div v-if="mergetime">
          每
          <span>{{interval}}</span> &nbsp;&nbsp;&nbsp;
          <span>{{timeround=="min"?"分钟":"小时"}}</span>
          <!-- <input class="ndc-input" v-model="interval" @input="onJumpInput" /> -->
          <!-- <a-select v-model="timeround" style="width:80px" @change="timeroundChange">
            <a-select-option value="min">分钟</a-select-option>
            <a-select-option value="hour">小时</a-select-option>
          </a-select>-->
        </div>
        <div v-else>
          <a-form :form="outform">
            <a-form-item>
              <!-- <a-input
                type="string"
                v-decorator="[
                    'fixedtime',
                    {
                    rules: [
                        { required: false, message: '请输入24小时制时刻“HH:mm“，多个时刻以空格隔开' },]
                    },
                ]"
                @blur="validatetimeBlur"
                placeholder="请输入24小时制时刻“HH:mm“，多个时刻以空格隔开"
              />-->
              <span>{{fixedtimes}}</span>
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
        <a-radio-group disabled v-model="mergeround" @change="roundonChange">
          <a-radio :value="true">全部</a-radio>
          <a-radio :value="false">部分</a-radio>
        </a-radio-group>
        <div v-if="!mergeround">
          最新
          <span>{{roundvalue}}</span>
          <!-- <input class="ndc-input" :value="roundvalue" @input="onJumpInput" /> -->
          个分区
        </div>
      </a-form-item>
      <!-- </a-form> -->
    </div>
    <div class="m-newbuilt-tit">
      <div @click="changecdc" style="float:left;margin-right:16px">
        <a-icon v-if="cdcbool" type="down" />
        <a-icon v-else type="up" />CDC配置
      </div>
      <a-switch :disabled="true" v-model="cdcenable" @change="cdconChange" />
    </div>
    <div v-show="cdcbool" class="m-newbuilt-info">
      <a-form
        layout="horizontal"
        :form="cdcform"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 10 }"
      >
        <a-form-item label="Kafka集群" required>
          <span>{{cluster}}</span>
        </a-form-item>
        <a-form-item label="Broker 地址">
          <textarea disabled v-model="broker" style="cursor: not-allowed;width:260px;padding:5px"></textarea>
        </a-form-item>
        <a-form-item label="Topic" required>
          <span>{{topic}}</span>
        </a-form-item>

        <a-form-item label="副本数">
          <span>{{replication}}</span>
        </a-form-item>
        <a-form-item name="partition" label="分区数">
          <span>{{partition}}</span>
        </a-form-item>
        <a-form-item label="实时数据湖" required>
          <a-radio-group disabled v-model="datalake" @change="datalakeChange">
            <a-radio :value="true">开启</a-radio>
            <a-radio :value="false">关闭</a-radio>
          </a-radio-group>
        </a-form-item>
      </a-form>
    </div>

    <div class="m-newbuilt-tit" @click="changeother">
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
          <!-- <a-auto-complete
            :data-source="TableProperties"
            style="width: 200px"
            placeholder="input here"
            v-model="item.params"
            @change="propertieschange(item.params,index)"
          />-->
          {{item.params}}
        </div>
        <div class="div" style="width:250px;height:34px">
          <!-- <input type="text" v-model="item.value" /> -->
          {{item.value}}
        </div>
        <!-- <a-icon style="width:20px;cursor:pointer" type="close" @click="delparams(index)" /> -->
      </div>
      <!-- <div @click="addparams" class="m-newbuilt-tab-add">+</div> -->
    </div>
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
    this.cdcform = this.$form.createForm(this, { name: "cdcform_rule" });
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
  private newmodal: boolean = true;
  private interval = "";
  private roundvalue = ""; //
  private fixedTimes: string = "";
  private cluster = "";
  private timeround: string = "min";
  private broker: string = "xxx.xxx.xxx.xxx";
  private partition: string = "";
  private topic: string = "";
  private replication: string = "";
  private datalake: boolean = true;
  private TableProperties: object = []; //下拉选项数组
  private paramslist: object = []; //最后展示的数组
  private changeDetail: object = {
    time: "2021-06-17 20:38:32"
  };
  private listname: object = [
    {
      id: 1,
      name: "dwd_1"
    }
  ];
  private clusterlist: object = [
    {
      id: 1,
      name: "dwd_1"
    }
  ];
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

  private back() {
    this.$router.back();
  }
  private async getTableMeta() {
    let res = await this.$request("getTableMeta", {
      catalog: this.catalog,
      database: this.database,
      tableName: this.$route.query.tableName
    });
    res = res.result
    this.columnList = res.columnList;
    this.partitionColumnList = res.partitionColumnList;
    this.pkList = res.pkList;
    this.cdcenable = res.cdcMeta.enable;
    this.cluster = res.cdcMeta.kafkaClusterInfo.name;
    this.broker = res.cdcMeta.kafkaClusterInfo.brokerList;
    this.topic = res.cdcMeta.topicInfo.topicName;
    this.partition = res.cdcMeta.topicInfo.partition;
    this.replication = res.cdcMeta.topicInfo.replication;
    this.datalake = res.cdcMeta.intoArctic;
    this.mergehive = res.adaptHiveMeta.enable;
    this.mergetime =
      res.adaptHiveMeta.mergeType == "FIXED_INTERVAL" ? true : false;
    this.interval = (res.adaptHiveMeta.interval)/6000;
    this.fixedTimes = res.adaptHiveMeta.fixedTimes;
    this.mergeround = res.adaptHiveMeta.mergeAll;
    this.roundvalue = res.adaptHiveMeta.partitionCnt;
    let result = res.properties;
    let arr = [];
    for (let i in result) {
      arr.push({ params: i, value: result[i] });
    }
    this.paramslist = arr;
    console.log(res, "getTableMeta");
  }

  private async mounted() {
    this.tableName = this.$route.query.tableName;
    await this.getTableMeta();
  }

  private goedit() {
    this.$router.push({
      name: "newbuilt",
      query: {
        catalog: this.catalog,
        database: this.database,
        tableName: this.tableName
      }
    });
  }

  private changeout() {
    this.outbool = !this.outbool;
  }

  private changecdc() {
    this.cdcbool = !this.cdcbool;
  }
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
  private timeonChange() {}
  private roundonChange() {}
  private onJumpInput() {}
  private timeroundChange() {}
  private cdconChange() {}
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
  width: 100%;
  height: 100%;
  padding: 0 16px;
  overflow-y: scroll;
  &-title {
    cursor: pointer;
    font-size: 16px;
    border-bottom: $border;
    line-height: 32px;
  }
  &-tit {
    margin-top: 10px;
    cursor: pointer;
    font-size: 14px;
  }
  &-info {
    width: 60%;
    font-size: 12px;
    color: #333;
  }
  &-tab {
    width: 500px;
    line-height: 32px;
    &-othertit {
      display: flex;
      width: 500px;
      margin-top: 5px;
      background: #eee;
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
    margin: 10px 0;
    button {
      margin-right: 16px;
    }
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
  padding: 4px 16px;
  border: 1px solid #d2d7e0;
  border-radius: 2px;
  font-size: 14px;
  line-height: 32px;
  color: #333;
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
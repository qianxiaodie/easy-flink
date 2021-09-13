<template>
  <ndc-modal class="m-debug-modal" :visible="visible" title="调试任务" :width="720" @hide="hide">
    <div class="m-debug-loading" v-if="loading">
      <u-loading loading-text="加载中，请稍候..."></u-loading>
    </div>

    <div v-else class="m-debug-block">
      <!-- <span>输入表列表</span> -->
      <div class="m-debug-header">
        <img src="@/assets/images/卡片二级标题.png">
      </div>
      <!--      <div class="m-debug-header">输入表列表</div>-->
      <div class="m-debug-main">
        <div class="m-debug-title">
          <div class="body-header g-flex-ac">
            <div style="width: 38%;">表名</div>
            <div style="width: 30%;">调试文件</div>
            <div style="width: 32%;"></div>
          </div>
        </div>
        <div class="m-debug-body">
          <div class="body-row g-flex-ac" v-for="(tbl, index) in sourceTables" :key="index">
            <u-validator class="g-flex-ac" style="width: 100%;" :name="'srcerror_' + index" :validate="errors">
              <div class="g-text-nowrap body-row-td" style="width: 38%;" :title="tbl.tableName">{{ tbl.tableName }}</div>
              <!-- <div class="g-text-nowrap body-row-td" style="width: 35%;" :title="tbl.fileName">{{tbl.fileName}}</div> -->
              <div class="g-text-nowrap body-row-td" style="width: 30%;" :title="tbl.fileName">
                <el-tag
                  v-if="tbl.fileName"
                  :key="tbl.fileName"
                  closable
                  type="info"
                  @close="handleClose(tbl.fileName)"
                >
                  {{ tbl.fileName === "" ? '-' : tbl.fileName.length > 20 ? tbl.fileName.substring(0, 20) + "..." : tbl.fileName}}
                </el-tag>
                <span v-else> {{ tbl.fileName === "" ? '-' : tbl.fileName.length > 20 ? tbl.fileName.substring(0, 20) + "..." : tbl.fileName}}</span>

              </div>
              <div class="body-row-td g-flex" style="width: 32%">
                <!--                <div class="body-row-td g-flex" style="width: 20%">-->
                <ndc-file
                  auto-reset
                  media-type=".csv,.json"
                  :extensions="['csv','json']"
                  :max-size="1048576"
                  :button-text="tbl.fileName ? '重新上传' : '本地上传'"
                  :loading="uploadingArray.includes('srcerror_' + index)"
                  :loading-inside="true"
                  @change="onChangeTableFile(arguments[0], tbl, 'srcerror_' + index)"
                  @error="onUploadFileError(arguments[0], 'srcerror_' + index)"
                  @click="ndcfileClick"
                  :class="tbl.fileName ? 'forbidFileBtn' : 'ndc-button'"
                ></ndc-file>
                <!--                <div v-show="tbl.fileName">重新上传</div>-->
                <ndc-button id="desensitingFileBtn" @click="changeDesensitingFlag(tbl, index)" :class="tbl.fileName ? 'forbidDesensitationFile' : 'desensitationFile'" v-show="tbl.metahubInfo">脱敏文件
                </ndc-button>
                <div class="desensitingFile" id="desensitingFileTree" v-show="desensitingFlag && tableName===tbl.tableName" >
                  <!--                  v-show="desensitingFlag && tableName===tbl.tableName"-->
                  <div class="m-nav-tree" @click.right="onRightClickTree">
                    <el-tree
                      :data="desensitingFile"
                      expand-on-click-node
                      @node-click="handleNodeClick"
                    >
                      <!--                      :render-content="renderContent"-->
                      <!--                    <span>testTime</span>-->
                      <span class="custom-tree-node" slot-scope="{ node, data }">
<!--                        <div v-for="item in data" :key="item.time">-->
                          <span  :title="data.label">{{ data.label.length > 15 ? data.label.substring(0, 15) + "..." : data.label}}</span>
                        &nbsp;&nbsp;&nbsp;&nbsp;
                        <span v-show="!data.isFolder">
                          {{data.time}}
                        </span>
                        <!--                        </div>-->
                      </span>
                    </el-tree>
                  </div>
                </div>
              </div>
              <!--              <div class="desensitingFile" v-show="desensitingFlag">-->
              <!--                <ndc-tree :data="desensitingFile " placeholder="脱敏文件"></ndc-tree>-->
              <!--              </div>-->
            </u-validator>
          </div>
        </div>
      </div>
    </div>
    <div class="m-debug-tips">
      <div class="left">格式说明:</div>
      <div class="right">
        <p>1. 调试文件支持csv和json格式，及脱敏文件</p>
        <p>2. 上传的调试文件仅支持UTF-8格式，内容暂不支持嵌套</p>
        <p>3. 上传的调试文件最大支持1MB(记录建议1千条以内)，脱敏调试文件最大支持100条记录</p>
        <p>4. 数值类型仅支持普通格式，不支持科学计数法</p>
        <p>5. 文件名仅支持字母数字下划线组合，不超过64位字符</p>
        <p>6. 脱敏调试文件最多保存最近的七个日期的数据</p>
      </div>
    </div>

    <div class="m-modal-error" v-if="errorText">{{ errorText }}</div>

    <template v-slot:footer>
      <div class="content">
        <ndc-button theme="primary" :disabled="confirmDisabled" @click="confirm">确认</ndc-button>
        <ndc-button @click="hide">取消</ndc-button>
      </div>
    </template>
  </ndc-modal>
</template>

<script lang="ts">
import { Component, Prop, Vue } from 'vue-property-decorator';
import { ICluster, IDebugFile, IFolder, IJobTreeNode, IResource, ITreeOption } from '@utils/types';
import { trackEvent } from "@/utils/trackEvent";
import MSqlNav from "@views/develop/components/sql-nav/index.vue";
import ConfigList from "@views/administrator/configuration/list.vue";
import Axios from 'axios';
import debug from "@views/develop/components/ide-panel/debug.vue";
  interface IDebugTable {
    tableName: string
    filePath: string
    fileName: string
  }

  @Component({
    components: {
      MSqlNav
    }
  })

export default class MDebugModal extends Vue {
    private visible: boolean = false
    private sourceTables: IDebugTable[] = []
    private errorText: string = ''
    private jobId: number = -1
    private uploadingArray: string[] = []
    private onConfirm: any = null
    private loading: boolean = false
    private confirmDisabled: boolean = false
    private desensitingFile:any = []

    private setProps = {
      label: 'label'
    }
    public async show(jobId: number, callback: any) {
      try {
        this.errorText = '';
        this.sourceTables = [];
        this.confirmDisabled = false;

        this.onConfirm = callback;
        this.jobId = jobId;
        this.getJobSourceTables(jobId);
        this.visible = true;
        this.$nextTick(() => {
          this.errors.clear();
        });
      } catch (e) {
        this.$handleException(e);
      }
    }
    public hide() {
      this.desensitingFlag = false;
      this.sourceTblesResult = [];
      this.tblindexArr = [];
      this.desFileResult = [];
      this.visible = false;
    }

    private mounted() {
      document.addEventListener('click', (e) => {
        const target = e.target as any;
        if (target.id !== 'desensitingFileBtn' && target.id !== 'desensitingFileTree') {
          this.desensitingFlag = false;
        }
      });
    }

    private tableName:string = ''
    private selectDesensitingFile:any = {}
    private desensitingFlag:boolean = false
    private tblindexArr:any = []

    // tag标签关闭事件
    private handleClose(tag) {
      this.sourceTables.forEach( item => {
        if (item.fileName === tag) {
          // this.sourceTables.splice(this.sourceTables.indexOf(item), 1)
          const index = this.sourceTables.indexOf(item);
          this.sourceTables[index].fileName = '';
          this.sourceTables[index].filePath = '';
        }
      });
    }
    // handleClose(tag) {
    //   this.dynamicTags.splice(this.dynamicTags.indexOf(tag), 1);
    // },
    // 获取脱敏文件列表
    private DesensitingFileParams = {
      path: ''
    }

    // 上传脱敏文件
    private uploadDesensitingFileData = {
      tableName: '',
      path: '',
      jobId: -1
    }

    private handleDate(date:string) {
      const year = date.slice(0, 4);
      const month = date.slice(4, 6);
      const day = date.slice(6, 8);
      return year + '-' + month + '-' + day;
    }

    private desFileResult:any = []
    private desBtnFlag:boolean = false
    private async getDesensitingFile(data) {
      try {
        const result = await this.$request('getDesensitingFile', data);
        if ( result === null ) {
          this.desBtnFlag = false;
          return this.desensitingFile = [];
        } else {
          this.desBtnFlag = true;
          // test 先获取所有数据
          // this.desFileResult.push(result)
          // console.log(this.desFileResult,'this.desFileResult')
          // this.desFileResult.forEach(item => {
          //   item.forEach( i => {
          //     i.label = this.handleDate(i.name)
          //     i.children.sort((a, b) => {
          //       return a.time < b.time ? 1 : -1;
          //     });
          //     i.children.forEach( j => {
          //       j.label = j.name;
          //     });
          //   });
          // });
          // debugger

          // 点击按钮获取脱敏数据
          this.desensitingFile = result;
          // this.desensitingFile.name = this.handleDate(result.name)
          this.desensitingFile.forEach(item => {
            item.label = this.handleDate(item.name);
            item.children.sort((a, b) => {
              return a.time < b.time ? 1 : -1;
            });
            item.children.forEach( i => {
              i.label = i.name;
            });
          });
          // console.log(this.desensitingFile)
          // debugger
        }
      } catch (e) {
        this.errorText = e.message;
        this.confirmDisabled = true;
      }
    }

    private changeDesensitingFlag(tbl, val) {
      console.log(this.desensitingFlag, 'this.desensitingFlag');
      if (!this.desensitingFlag) {
        //   this.uploadDesensitingFileData.tableName = tbl.tableName;
        //   this.desensitingFlag = true;
        //   console.log(this.sourceTables)
        //   // debugger
        //   if (tbl.tableName === this.sourceTables[0].tableName) {
        //     this.desensitingFile = this.desFileResult[0];
        //   } else {
        //     this.desensitingFile = this.desFileResult[1];
        //   }
        //   // debugger
        //   if (this.tblindexArr.length === 0 ) {
        //     this.tblindexArr.push(val);
        //     this.tableName = tbl.tableName;
        //     // this.desensitingFlag = !this.desensitingFlag;
        //   } else if (this.tblindexArr.length !== 0 && this.tblindexArr.includes(val)) {
        //     this.tableName = tbl.tableName;
        //     // this.desensitingFlag = !this.desensitingFlag;
        //   } else {
        //     this.tblindexArr.splice(0, 1, val);
        //     this.tableName = tbl.tableName;
        //     // this.desensitingFlag = true;
        //   }
        //   this.selectDesensitingFile = tbl;

        // 点击按钮获取脱敏数据
        // console.log(this.sourceTblesResult, 'this.sourceTblesResult');
        this.sourceTblesResult.forEach(item => {
          if (item && item[2] === tbl.tableName) {
            this.DesensitingFileParams.path = `/user/realtime_props/${item[0]}-PRD/${item[1]}/${item[2]}`;
            this.getDesensitingFile(this.DesensitingFileParams).then( () => {
              this.desensitingFlag = true;
              this.uploadDesensitingFileData.tableName = tbl.tableName;
              if (this.tblindexArr.length === 0 ) {
                this.tblindexArr.push(val);
                this.tableName = tbl.tableName;
                // this.desensitingFlag = !this.desensitingFlag;
              } else if (this.tblindexArr.length !== 0 && this.tblindexArr.includes(val)) {
                this.tableName = tbl.tableName;
                // this.desensitingFlag = !this.desensitingFlag;
              } else {
                this.tblindexArr.splice(0, 1, val);
                this.tableName = tbl.tableName;
                // this.desensitingFlag = true;
              }
              this.selectDesensitingFile = tbl;
            });
          }
        });
      } else {
        this.desensitingFlag = false;
        this.selectDesensitingFile = {};
      }
    }

    private selectedNode: IJobTreeNode | null = null

    // private uploadDesFilePathArray:any = []
    // elementUI tree 节点点击事件
    private handleNodeClick(data, node, self) {
      // 拼接上传脱敏文件的路径
      let folderName = node.parent.data.name;
      let DesensitingFileName = data.name;

      this.uploadDesensitingFileData.path = `${this.DesensitingFileParams.path}/${folderName}/${DesensitingFileName}`;
      if ( !data.isFolder ) {
        this.selectedNode = data;
        this.selectDesensitingFile.fileName = this.selectedNode && this.selectedNode.name;
        this.selectDesensitingFile.path = this.uploadDesensitingFileData.path;
        this.sourceTables.forEach(item => {
          if (item.tableName === this.selectDesensitingFile.tableName) {
            let index = this.sourceTables.indexOf(item);
            this.sourceTables[index].filePath = this.selectDesensitingFile.path;
            this.sourceTables.splice(index, 1, this.selectDesensitingFile);
          }
        });
        this.uploadDesensitingFileData.jobId = Number(this.jobId);
        this.uploadDesensitingFile(this.uploadDesensitingFileData);
        this.desensitingFlag = false;
      }
    }

    // upload脱敏文件
    private async uploadDesensitingFile(data) {
      try {
        await this.$request('uoloadDesensitingFile', data);
      } catch (e) {
        this.errorText = e.message;
        this.confirmDisabled = true;
      }
    }

    private onRightClickTree(e) {
      e.preventDefault();
    }

    private sourceTblesResult:any = []
    private async getJobSourceTables(jobId: number) {
      try {
        this.loading = true;
        const result = await this.$request('getJobSourceTables', { jobId });
        result.forEach( item => {
          this.sourceTblesResult.push( item.metahubInfo );
        });
        const func = (path: string): string => {
          const arr = path.split('/');
          return arr.length ? arr[arr.length - 1] : '';
        };
        this.sourceTables = (result || []).map((tbl: any) => ({
          tableName: tbl.tableName,
          filePath: tbl.filePath,
          fileName: func(tbl.filePath),
          metahubInfo: tbl.metahubInfo
        }));
      } catch (e) {
        this.errorText = e.message;
        this.confirmDisabled = true;
      } finally {
        // const path:any = []
        // this.sourceTables.forEach( i => {
        //   this.sourceTblesResult.forEach( item => {
        //     if (item && i.tableName === item[2]) {
        //       path.push(`/user/realtime_props/${item[0]}-PRD/${item[1]}/${item[2]}`)
        //
        //       this.DesensitingFileParams.path = `/user/realtime_props/${item[0]}-PRD/${item[1]}/${item[2]}`;
        //       console.log(this.DesensitingFileParams)
        //       debugger
        //       // this.DesensitingFileParams.path = `/user/realtime_props/${this.sourceTblesResult[0]}-PRD/realtime_props/tyytesttb0208003`;
        //       // 获取脱敏文件
        //       this.getDesensitingFile(this.DesensitingFileParams).then(() => {
        //         console.log(this.sourceTables)
        //         console.log(this.desensitingFile)
        //         debugger
        //       });
        //     }
        //   });
        // })

        // test 先获取所有数据
        // if (path.length === 1) {
        //   this.DesensitingFileParams.path = path[0]
        //   // this.uploadDesFilePathArray.push(path[0])
        //   this.getDesensitingFile(this.DesensitingFileParams);
        // } else {
        //   this.DesensitingFileParams.path = path[0]
        //   // this.uploadDesFilePathArray.push(path[0])
        //   this.getDesensitingFile(this.DesensitingFileParams).then(() => {
        //     this.DesensitingFileParams.path = path[1]
        //     // 获取所有数据上传脱敏文件需要区分路径
        //     // this.uploadDesFilePathArray.push(path[1])
        //     this.getDesensitingFile(this.DesensitingFileParams);
        //   });
        // }
        this.loading = false;
      }
    }

    private ndcfileClick() {
      debugger;
      console.log('clickclick');
    }

    private async onChangeTableFile(data: any, tbl: any, field: string) {
      // 收起脱敏文件树
      this.desensitingFlag = false;
      // debugger
      const files: FileList = data.files;
      if (files.length) {
        const file = files[0];
        const name = file.name.split('.')[0];
        if (/^[a-zA-Z0-9_]*$/.test(name) && name.length <= 64) {
          this.removeValidatorError(field);
          try {
            this.uploadingArray.push(field);
            const path = await this.$request('uploadDebugFile', {
              jobId: this.jobId,
              sourceFile: file,
              tableName: tbl.tableName
            });
            tbl.filePath = path;
            tbl.fileName = file.name;
          } catch (e) {
            this.addValidatorError(field, '');
            this.$message.error('文件上传失败');
          } finally {
            const index = this.uploadingArray.findIndex(u => u === field);
            index !== -1 && this.uploadingArray.splice(index, 1);
          }
        } else {
          this.addValidatorError(field, '');
          this.$message.error('文件名仅支持字母数字下划线组合，不超过64位字符');
        }
      }
    }

    private confirm() {
      if (this.loading) {
        return false;
      }
      const valid = this.validate();
      if (!valid) {
        return false;
      }
      if (this.uploadingArray.length) {
        this.errorText = '调试文件正在上传';
        return false;
      }

      const fileList: IDebugFile[] = this.sourceTables.map((tbl: IDebugTable) => ({
        tableName: tbl.tableName,
        filePath: tbl.filePath
      }));
      this.onConfirm && this.onConfirm(fileList);
      trackEvent({ btn_title: '调试按钮', btn_id: 'btn_004' }, 'btn_click');
      this.hide();
    }

    private validate() {
      this.errorText = '';
      this.sourceTables.forEach((tbl: any, index: number) => {
        if (!tbl.filePath) {
          this.addValidatorError('srcerror_' + index, '');
          this.$message.error('调试文件不能为空');
        }
      });
      return this.errors.items.length === 0;
    }

    private onUploadFileError(data: any, name: string) {
      let msg = '';
      if (data.type === 'EXT_ERROR') {
        msg = '上传文件格式不正确，支持csv、json格式';
      } else if (data.type === 'SIZE_ERROR') {
        msg = '上传文件大小超出限制，最大支持1MB';
      } else {
        msg = '上传文件失败';
      }
      this.addValidatorError(name, '');
      this.$message.error(msg);
    }

    private removeValidatorError(field: string) {
      this.errors.remove(field);
    }

    private addValidatorError(field: string, msg: string) {
      this.removeValidatorError(field);
      this.errors.add({
        field,
        msg
      });
      setTimeout(() => {
        this.removeValidatorError(field);
      }, 2000);
    }
}
</script>

<style lang="scss" scoped>
  .m-debug {
    &-modal {
      /deep/ .ndc-modal-main {
        overflow: unset;
        .ndc-modal-content {
          padding: 20px;
          overflow: unset;
        }
      }
    }
    &-block {
      // border: $border;
      & + .m-debug-block {
        margin-top: 16px;
      }
    }
    &-header {
      margin-bottom: 12px;
    }
    &-main {
      width: 680px;
      border-radius: 5px;
    }
    &-title {
      font-size: 14px;
      line-height: 32px;
      padding-left: 20px;
      background: #eee;
      font-family: PingFangSC-Regular, PingFang SC;
      font-weight: 400;
      color: #888888;
      border-radius: 3px;
    }
    &-loading {
      position: relative;
      height: 100px;
      width: 100%;
    }
    &-body {
      .body-header {
        width: 100%;
        padding-left: 16px;
        line-height: 24px;
        font-size: 12px;
        color: #999;
      }
      .body-row {
        height: 44px;
        padding-left: 20px;
        color: #333;
        line-height: 44px;
        border-bottom: 1px solid #dddddd;
        /deep/ &-td {
          /*padding-right: 16px;*/
          box-sizing: border-box;
          .ndc-file{
            margin-right: 12px;
          }
          .desensitingFile{
            position: absolute;
            left: 548px;
            top: 40px;
            min-width: 240px;
            max-height: 319px;
            overflow: auto;
            border-radius: 2px;
            border: 1px solid #cccccc;
            box-shadow: 0px 2px 8px 0px rgba(0, 0, 0, 0.2);
            z-index: 123;
            .el-tree-node__content{
              height: 32px;
              overflow-y:hidden;
            }
            .custom-tree-node {
              height: 100%;
              flex: 1;
              display: flex;
              align-items: center;
              justify-content: space-between;
              font-size: 14px;
              padding-right: 8px;
            }
          }
          .ndc-button {
            min-width: 88px;
            /*width: 88px;*/
            /*color: #3b68b7;*/
            /*border-radius: 3px;*/
            /*border: 1px solid #3b68b7;*/
            &:hover{
              background: rgba(59, 104, 183, 0.06);
            }
          }
          .forbidFileBtn {
            pointer-events: none;
            .ndc-button-default {
              min-width: 88px;
              width: 88px;
              background: #F9F9F9;
              border-radius: 3px;
              border: 1px solid #DDDDDD;
              color: #DDDDDD;
              pointer-events: none;
            }
          }
          .forbidDesensitationFile{
            pointer-events: none;
            width: 88px;
            border: 1px solid #DDDDDD;
            color: #DDDDDD;
            text-align: unset;
            padding: 0 10px;
            background: url("../../../../assets/images/dis.png") no-repeat #F9F9F9;
            background-position: 92% 55%;
            &:hover{
              background: rgba(59, 104, 183, 0.06) url("../../../../assets/images/dis.png") no-repeat;
              text-align: unset;
              padding: 0 10px;
              background-position: 92% 55%;
            }
          }

          .desensitationFile{
            width: 88px;
            text-align: unset;
            padding: 0 10px;
            background: url("../../../../assets/images/down(normal).svg") no-repeat;
            background-position: 92% 55%;
            &:hover{
              background: rgba(59, 104, 183, 0.06) url("../../../../assets/images/down(normal).svg") no-repeat;
              text-align: unset;
              padding: 0 10px;
              background-position: 92% 55%;
            }
          }
        }
        /deep/ .u-validator .error {
          /*margin-bottom: unset;*/
          /*padding-left: 55px;*/
          position: absolute;
          left: 135px;
          top: 0;
        }
      }
    }
    &-tips {
      width: 680px;
      margin-top: 20px;
      padding: 12px 20px;
      display: flex;
      background: #fafafa;
      .left {
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #888888;
      }
      .right {
        margin-left: 12px;
        line-height: 20px;
        font-family: PingFangSC-Regular, PingFang SC;
        font-weight: 400;
        color: #888888;
      }
    }
  }
</style>

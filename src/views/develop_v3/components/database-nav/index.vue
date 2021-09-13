<template>
  <div class="m-database-nav" id="databaseBox">
    <div class="treePart">
      <div v-if="metadataTableList.length !== 0" style="height:100%">
        <m-nav-header id="databaseSearch" placeholder="输入关键字进行搜索" :icon-visible="false" @keywords-change="keywords = arguments[0]"></m-nav-header>

        <div class="m-nav-tree">
          <!--        @node-drag-leave="onNodeDragLeave"-->
          <ndc-tree ref="tree" :data="databases" :filter-node-method="filterNodes" :is-filter="isFilter" :draggable="true">
            <template v-slot:node="scope">
              <div class="g-flex-ac" style="width: 0;flex: 1;">
                <i v-if="scope.node.isDs" class="ndc-icon-db g-mr-8" />
                <i v-else-if="scope.node.isDb" class="ndc-icon-db g-mr-8" />
                <i v-else-if="scope.node.isTable" class="ndc-icon-table g-mr-8" />
                <!--               新增-->
                <div class="g-flex-ac g-flex-jsp" style="width: 0;flex: 1;" v-if="scope.node.isDb">
                  <span class="g-mr-16 g-text-nowrap" :title="scope.node.name">{{ scope.node.name }}</span>
                  <span class="g-text-nowrap" style="color: #999;" :title="scope.node.type">{{ scope.node.type }}</span>
                </div>

                <div class="g-flex-ac g-flex-jsp" style="width: 0;flex: 1;" v-else-if="scope.node.isField">
                  <!--                  <ndc-tooltip position="top" :content="scope.node.comments">-->
                  <span class="g-mr-16 g-text-nowrap" :title="scope.node.comments">{{ scope.node.name }}</span>
                  <span class="g-mr-16 g-text-nowrap" style="color: #999;" :title="scope.node.sourceType">{{ scope.node.sourceType }}</span>
                  <i class="g-mr-16 g-text-nowrap primaryKey" title="primary key" v-if="scope.node.primaryKey"> primary key</i>
                  <!--                  </ndc-tooltip>-->
                </div>
                <div class="g-flex-ac" style="width: 0;flex: 1;" v-else>
                  <span class="g-text-nowrap" :title="scope.node.label">{{ scope.node.name }}</span>
                  <div class="g-flex-ac g-ml-8" v-if="scope.node.isTable">
                    <ndc-tooltip content="引用" class="g-mr-4">
                      <i class="ndc-icon-mig" style="color: #3274e6;font-size: 14px;" :class="opCodesFlag ? '' : 'changeCursor'" @click="quote(scope.node.catalog + '.' + scope.node.key)" />
                    </ndc-tooltip>
                    <ndc-tooltip content="复制" v-if="opCodesFlag">
                      <ndc-clipboard :text="scope.node.catalog + '.' + scope.node.key" @success="copy">
                        <i class="ndc-icon-file-copy" style="color: #3274e6;font-size: 14px;" />
                      </ndc-clipboard>
                    </ndc-tooltip>
                    <ndc-tooltip content="复制" v-else>
                      <i class="ndc-icon-file-copy" style="color: #3274e6;font-size: 14px;" :class="opCodesFlag ? '' : 'changeCursor'" />
                    </ndc-tooltip>
                  </div>
                </div>
              </div>
            </template>
          </ndc-tree>
        </div>
      </div>

      <div v-else style="height:100%">
        <el-input
          :placeholder="metadataTableList.length === 0 ? '正在获取搜索数据，请稍等...' : '输入关键字进行搜索'"
          suffix-icon="el-icon-search"
          v-model="filterText"
          :disabled="metadataTableList.length === 0"
        >
        </el-input>
        <div class="m-nav-tree2">
          <el-tree class="filter-tree" :data="datasourseData" :load="loadNode" :props="props" :filter-node-method="filterNode" :expand-on-click-node="false" ref="tree" lazy>
            <span class="custom-tree-node" slot-scope="{ node, data }">
              <span v-show="!data.isField && !data.isTable">
                <i v-if="data.isDs" class="ndc-icon-db g-mr-8" />
                <i v-else-if="data.isDb" class="ndc-icon-db g-mr-8" />
                {{ data.label }}</span
              >

              <!--                <span v-else>{{data.label}}</span>-->
              <div class="g-flex-ac" style="width: 0;flex: 1;" v-show="data.isTable">
                <i class="ndc-icon-table g-mr-8" />
                <span :title="data.label">{{ data.label }}</span>
                <div class="g-flex-ac g-ml-8">
                  <ndc-tooltip content="引用" class="g-mr-4">
                    <i class="ndc-icon-mig" style="color: #3274e6;font-size: 14px;" :class="opCodesFlag ? '' : 'changeCursor'" @click="quote(data.catalog + '.' + data.db + '.' + data.table)" />
                  </ndc-tooltip>
                  <ndc-tooltip content="复制" v-if="opCodesFlag">
                    <ndc-clipboard :text="data.catalog + '.' + data.db + '.' + data.table" @success="copy">
                      <i class="ndc-icon-file-copy" style="color: #3274e6;font-size: 14px;" />
                    </ndc-clipboard>
                  </ndc-tooltip>
                  <ndc-tooltip content="复制" v-else>
                    <i class="ndc-icon-file-copy" style="color: #3274e6;font-size: 14px;" :class="opCodesFlag ? '' : 'changeCursor'" />
                  </ndc-tooltip>
                </div>
              </div>

              <div v-if="data.isField" class="fields">
                <!--                <ndc-tooltip position="top" :content="data.comments">-->
                <span :title="data.comments">{{ data.label }}&nbsp;&nbsp;&nbsp;&nbsp;</span>
                <span class="sourceType" :title="data.sourceType">{{ data.sourceType.length > 30 ? data.sourceType.substring(0, 30) + '...' : data.sourceType }}</span>
<!--                <i class="g-mr-16 g-text-nowrap primaryKey" title="primary key" v-if="scope.node.primaryKey"> primary key</i>-->
                <!--                </ndc-tooltip>-->
              </div>
            </span>
          </el-tree>
        </div>
      </div>
    </div>
    <!--    <u-loading v-if="databaseLoading" loading-text="正在查询流式表，请稍等..." ></u-loading>-->
  </div>
</template>

<script lang="ts">
import { Component, Mixins, Prop, Watch } from 'vue-property-decorator'
import NavMixin from '../../navMixin'
import MNavHeader from '../nav-header/index.vue'
import { State, Action } from 'vuex-class'
import { MODULE_NAMESPACE } from '@/utils/constant'
import { EDITOR_CMD } from '../../constant'

@Component({
  components: {
    MNavHeader
  }
})
export default class MDatabaseNav extends Mixins(NavMixin) {
  @State('metadataTableList', MODULE_NAMESPACE.develop_v3)
  private metadataTableList!: any[]

  private getDataBasesList: any = []

  private get databases(): any[] {
    const keys = Object.keys(this.metadataTableList).sort()
    return keys.map(k => this.handleSourse(k, this.metadataTableList[k]))
  }
  // private get databases(): any[] {
  //   const keys = Object.keys(this.metadataTableList);
  //   let databaseArr:any = [];
  //   databaseArr = keys.map(k => this.handleSourse(k, this.metadataTableList[k]));
  //   databaseArr.sort(this.sortBy('name'));
  //   return databaseArr;
  //   // return keys.map(k => this.handleSourse(k, this.metadataTableList[k]));
  // }

  private sortBy(props) {
    return function(a, b) {
      return a[props].localeCompare(b[props])
    }
  }

  @Action('getMetadataTableList', MODULE_NAMESPACE.develop_v3)
  private getMetadataTableList!: any
  // sidebar 传值权限
  @Prop({
    default: false
  })
  private opCodesFlag!: boolean
  // 查询流式表的loading状态
  private databaseLoading: boolean = false
  private datasourseData: any = []
  private filterText = ''
  // private datasourse: any = {};
  private metaDataList: any = []
  private handleSourse(name: string, source: any[] = []) {
    const datasourse: any = {}
    datasourse.isDs = true
    // key与name相同会导致同名数据源、数据库、表格同时展开或关闭
    // datasourse.name = datasourse.key = name;
    datasourse.name = name
    datasourse.label = name
    datasourse.key = 'ds_' + name
    // debugger
    // datasourse.children = [];
    datasourse.children = Object.keys(source).map(s => this.handleDatabase(s, source[s]))
    // this.metaDataList.forEach(item => {
    //   debugger
    //   console.log(item)
    //   if (item !== datasourse) {
    //     this.metaDataList.push(datasourse)
    //   }
    // })
    // this.metaDataList.push(datasourse)
    // // debugger
    // if (this.metaDataList.length !== 0) {
    //       this.inputFlag = false;
    //       this.datasourseData = this.metaDataList
    // }
    // this.datasourseData.push(datasourse);
    // this.dataSourceFlag = true;
    return datasourse
  }

  // private changeElTreeData() {
  //   this.datasourseData = this.metaDataList
  //   debugger
  // }

  refresh() {
    this.getMetadataTableList()
  }

  private props = {
    label: 'label',
    isLeaf: 'leaf',
    children: 'children'
  }

  private created() {
    this.getDatasourceList()
    // this.getDataBases();
  }

  // private onJobTreeClick( event ){
  //   console.log(event,'event')
  //   if (event.isDs) {
  //     this.getDatabaseList(event.key)
  //   }
  // }

  private loadNode(node, resolve) {
    if (node.level === 1) {
      this.getDatabaseList(node.data.name, resolve)
      return resolve([]) // 加这个，防止在该节点没有子节点时一直转圈的发生
    }
    if (node.level === 2) {
      this.getTableList(node, resolve)
      return resolve([])
    }
    if (node.level === 3) {
      this.getFieldsList(node, resolve)
    }
    if (node.level === 4) {
      return resolve([])
    }
  }

  // el-tree节点过滤
  @Watch('filterText')
  private onFilterTextChanged(val) {
    ;(this.$refs as any).tree.filter(val)
  }

  private filterNode(value, data, node) {
    // this.metadataTableList.length === 0 ?
    // const keys = this.metadataTableList;
    // console.log(keys, 'keys');
    // console.log(data, 'data');
    // // value = keys
    // 如果什么都没填就直接返回
    // debugger
    if (!value) {
      return true
    }
    // 如果传入的value和data中的label相同说明是匹配到了
    if (data.label.indexOf(value) !== -1) {
      return true
    }
    // debugger
    ;(this.$refs.tree as any).store.nodesMap[data.id].expanded = true
    data.unfold = true
    // 否则要去判断它是不是选中节点的子节点
    return this.checkBelongToChooseNode(value, data, node)
  }
  // 判断传入的节点是不是选中节点的子节点
  private checkBelongToChooseNode(value, data, node) {
    const level = node.level
    // 如果传入的节点本身就是一级节点就不用校验了
    if (level === 1) {
      return false
    }
    // 先取当前节点的父节点
    let parentData = node.parent
    // 遍历当前节点的父节点
    let index = 0
    while (index < level - 1) {
      // 如果匹配到直接返回
      if (parentData.data.label.indexOf(value) !== -1) {
        return true
      }
      // 否则的话再往上一层做匹配
      parentData = parentData.parent
      index++
    }
    // this.$refs.tree2.store.nodesMap[data.id].expanded = true;
    // data.unfold = true;
    // 没匹配到返回false
    return false
  }

  // private handleNodeClick(data,node) {
  //   console.log(data,node,'handleNodeClick')
  //   // this.loadNode(node,resolve)
  // }

  private dataSourceFlag: boolean = false

  // 根目录，数据源的名称
  private datasourceName: any = []
  private async getDatasourceList(type?: string) {
    try {
      const result = await this.$request('getDatasourceList', {
        limit: 99999999,
        offset: 0,
        dsType: 'kafka'
      })
      result.list.forEach(item => {
        this.datasourceName.push(item)
      })
      const keys: any = []

      this.datasourceName.forEach(item => {
        keys.push(item.name)
      })
      keys.map(k => this.elTreeHandleSourse(k, this.datasourceName[k]))
    } catch (e) {
      this.$handleException(e, '获取数据源列表失败')
    }
  }

  private elTreeHandleSourse(name: string, source: any[] = []) {
    const datasourse: any = {}
    datasourse.isDs = true
    // key与name相同会导致同名数据源、数据库、表格同时展开或关闭
    // datasourse.name = datasourse.key = name;
    datasourse.name = name
    datasourse.label = name
    datasourse.key = 'ds_' + name
    datasourse.children = []
    // datasourse.children = Object.keys(source).map(s => this.handleDatabase(s, source[s]));
    this.datasourseData.push(datasourse)
    this.dataSourceFlag = true
    this.datasourseData.sort(this.sortBy('name'))
    // this.datasourseData.sort();
    // console.log(this.datasourseData)
    return this.datasourseData
  }

  // 获取指定catalog下的数据库列表
  private databaseList: any = []
  private async getDatabaseList(key, resolve) {
    try {
      const list = await this.$request('getDatabaseList', {
        catalog: key
      })
      let data = list
      data.forEach(item => {
        item.label = item.db
        item.children = []
        item.isDb = true
        // 补全数据结构
        this.datasourseData.forEach(i => {
          if (i.name === key) {
            i.children.push(item)
          }
        })
      })
      this.databaseList = data
      resolve(data)
    } catch (e) {
      this.$handleException(e, '获取元数据列表失败')
    }
  }

  // 获取指定catalog/db 下的表列表
  private fieldsList: any = []
  private async getTableList(node, resolve) {
    try {
      const result = await this.$request('getTableList', {
        db: node.data.db,
        table: '',
        type: '',
        offset: 0,
        limit: 99999999,
        topic: '',
        catalog: node.data.catalog
      })

      let data = result.data

      data.forEach(item => {
        item.label = item.table
        item.children = item.fields
        item.isTable = true

        this.databaseList.forEach(i => {
          if (i.db === item.db) {
            i.children.push(item)
          }
        })
      })

      // setTimeout(() => {
      //   resolve(data);
      // }, 500);
      resolve(data)
    } catch (e) {
      this.$handleException(e, '获取数据表失败')
    } finally {
    }
  }

  private getFieldsList(node, resolve) {
    let fieldsData: any = []
    fieldsData = node.data.fields
    fieldsData.forEach(item => {
      item.label = item.name
      item.isField = true
      item.leaf = true
    })
    // setTimeout(() => {
    //   resolve(fieldsData);
    // }, 500);
    resolve(fieldsData)
  }

  private handleDatabase(name: string, db: any[] = []) {
    const database: any = {}
    database.isDb = true
    database.name = name
    database.key = 'db_' + name
    database.label = name
    // db.forEach( item => {
    //   database.label = item.db;
    //   debugger
    // })
    // debugger
    database.children = Object.keys(db).map(l => this.handleTable(db[l]))
    // debugger
    return database
  }

  private handleTable(table: any) {
    table.isTable = true
    table.key = `${table.db}.${table.table}`
    table.name = table.table
    table.label = table.metadata['connector.topic']
    table.children = (table.fields || []).map(f => this.handleField(table.key, f))
    return table
  }

  private handleField(pre: string, field: any) {
    field.isField = true
    field.label = field.name
    field.leaf = true
    field.key = `${pre}.${field.name}`
    // this.databaseLoading = false;
    return field
  }
  private quote(sql: string = '') {
    if (this.opCodesFlag) {
      this.develop && this.develop.executeCommand(EDITOR_CMD.quote, sql)
    }
  }

  private copy() {
    this.$ndcmessage.success('复制成功')
  }

  // private onNodeDragLeave(node) {
  //   console.log(node, 'onNodeDragLeave----');
  // }
}
</script>

<style lang="scss" scoped>
.m-database-nav {
  flex: auto;
  height: calc(100% - 56px);
  display: flex;
  flex-direction: column;
  background-color: #fafafa;
  width: 400px;
  padding-bottom: 5px;
  /*margin: 0 auto;*/
  .treePart {
    height: 100%;
    /deep/ .el-input {
      padding: 12px 16px;
      .el-input__inner {
        height: 32px;
      }
      .el-input__suffix {
        right: 20px;
      }
      :hover,
      :focus {
        border-color: #3b68b7;
      }
    }
    .m-nav-tree2 {
      max-height: calc(100% - 56px);
      /*min-height: 192px;*/
      overflow: auto;
      .changeCursor {
        &:hover {
          cursor: not-allowed;
        }
      }
      /deep/ .el-tree {
        padding-left: 12px;
        background: #fafafa;
        .fields {
          .sourceType {
            color: #999999;
          }
          .primaryKey {
            color: white;
            background-color: gray;
            display: inline-block;
            padding: 0px 5px;
            height: 18px;
            line-height: 15px;
            border-radius: 3px;
            font-size: 12px;
          }
        }
      }
    }
    .m-nav-tree {
      max-height: calc(100% - 56px);
      /*min-height: 192px;*/
      overflow: auto;
      .changeCursor {
        &:hover {
          cursor: not-allowed;
        }
      }
      /deep/ .ndc-tree {
        padding-left: 12px;
        background: #fafafa;
        .fields {
          .sourceType {
            color: #999999;
          }
          .primaryKey {
            color: white;
            background-color: gray;
            display: inline-block;
            padding: 0px 5px;
            height: 18px;
            line-height: 15px;
            border-radius: 3px;
            font-size: 12px;
          }
        }
      }
    }
    .m-database-line {
      position: absolute;
      width: 100%;
      box-sizing: border-box;
      height: 6px;
      border-bottom: $border;
      cursor: row-resize;
      z-index: 8;
      display: flex;
      justify-content: center;
      img {
        display: none;
        position: absolute;
        transform: rotate(90deg);
        top: -9px;
      }
    }
  }
  .queryFailed {
    position: absolute;
    top: 150px;
    left: 130px;
    color: #cccccc;
    font-size: 16px;
    font-weight: 600;
  }
  .primaryKey {
    color: white;
    background-color: gray;
    display: inline-block;
    padding: 0px 5px;
    height: 18px;
    line-height: 15px;
    border-radius: 3px;
    font-size: 12px;
  }
}
</style>

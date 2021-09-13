<template>
  <div class="m-ide-debug">
    <ndc-tabs is-card :tabs="debugTabs" v-model="activeTab" @change="onDebugTabChange">
      <ndc-tab-panel class="debug-result" v-for="(item, index) in (debugResult && debugResult.results) || []" :key="index" :name="item.tableName">
        <table class="ndc-table">
          <thead>
            <tr>
              <th v-for="th in item.fields" :key="th">{{ th }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(tr, idx) in item.values" :key="idx">
              <td v-for="(val, validx) in tr" :key="validx">{{ val }}</td>
            </tr>
          </tbody>
        </table>
      </ndc-tab-panel>
      <ndc-tab-panel name="log">
        <m-log-editor ref="debugEditor" :logs="debugResult.log || ''"></m-log-editor>
      </ndc-tab-panel>
    </ndc-tabs>
  </div>
</template>

<script lang="ts">
import { Component, Vue } from 'vue-property-decorator'
import { ITab, IDebugResult } from '@utils/types'
import MLogEditor from '../log-editor/index.vue'

import { cloneDeep } from 'lodash'
import { isNotEmpty } from '@/utils'

const DEBUG_TABS: ITab[] = [
  {
    name: 'log',
    label: '运行日志'
  }
]

@Component({
  components: {
    MLogEditor
  }
})
export default class MIdeDebug extends Vue {
  private debugTabs: ITab[] = DEBUG_TABS
  private activeTab: string = 'log'
  private debugResult: any = {}

  private created() {
    const { jobId } = this.$route.query || {}
    if (isNotEmpty(jobId)) {
      const key = `sloth_debug_${jobId}`
      let result = localStorage.getItem(key)
      if (result) {
        sessionStorage.setItem(key, result)
        localStorage.removeItem(key)
      } else {
        result = sessionStorage.getItem(key)
      }
      if (result) {
        this.debugResult = JSON.parse(result)
        const resultData: IDebugResult[] = (this.debugResult && this.debugResult.results) || []
        const tabs = cloneDeep(DEBUG_TABS)
        resultData.forEach(re => {
          tabs.push({
            name: re.tableName,
            label: re.tableName
          })
        })
        this.debugTabs = tabs
      }
    }
  }

  private onDebugTabChange(val: string) {
    if (val === 'log') {
      this.$nextTick(() => {
        const editor = this.$refs.debugEditor as MLogEditor
        editor && editor.resize()
      })
    }
  }
}
</script>

<style lang="scss">
.m-ide-debug {
  width: 100%;
  height: 100%;
  background-color: #e9ebf0;
  .ndc-tabs {
    padding-top: 16px;
    box-sizing: border-box;
  }
  .debug-result {
    padding: 16px;
    box-sizing: border-box;
    background: #fff;
    overflow: auto;
    .ndc-table {
      thead tr {
        height: 36px;
        th {
          font-size: 12px;
          line-height: 20px;
          padding: 8px 0 8px 16px;
        }
      }
      tbody tr {
        height: 36px;
        td {
          font-size: 12px;
          line-height: 20px;
          padding: 8px 0 8px 16px;
        }
      }
    }
  }
  .ndc-tabs-header {
    .tab {
      color: #333;
      justify-content: center;
    }
  }
}
</style>

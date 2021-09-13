import { IDevelopState, IHttpResponse, IJobTreeNode, ITab, ITag, IMetadata, IResource, IMetadataTable, IJob } from '../utils/types'
import { request } from '@utils/request'
import { Commit, MutationTree, ActionTree } from 'vuex'

const localStorageTabs = localStorage.getItem('sloth_tabs')

const state: IDevelopState = {
  tabs: (localStorageTabs && JSON.parse(localStorageTabs)) || [],
  activeTab: localStorage.getItem('sloth_activetab') || '',
  jobList: [],
  jarList: [],
  tagList: [],
  metadataList: [],
  resourceList: [],
  metadataTableList: [],
  treeWidth: 232,
  leftWidth: 264
}

const mutations: MutationTree<IDevelopState> = {
  SET_TREEWIDTH(state: IDevelopState, treeWidth: number) {
    state.treeWidth = treeWidth
  },
  SET_LEFTWIDTH(state: IDevelopState, leftWidth: number) {
    state.leftWidth = leftWidth
  },
  SET_TABS(state: IDevelopState, tabs: ITab[]) {
    localStorage.setItem('sloth_tabs', JSON.stringify(tabs))
    state.tabs = tabs
  },
  SET_ACTIVETAB(state: IDevelopState, tab: string) {
    localStorage.setItem('sloth_activetab', tab)
    state.activeTab = tab
  },
  SET_JOBLIST(state: IDevelopState, jobList: IJobTreeNode[]) {
    state.jobList = jobList
  },

  SET_JARLIST(state: IDevelopState, jobList: IJobTreeNode[]) {
    state.jarList = jobList
  },

  SET_TAGLIST(state: IDevelopState, tagList: ITag[]) {
    state.tagList = tagList
  },
  SET_METADATALIST(state: IDevelopState, metadataList: IMetadata[]) {
    state.metadataList = metadataList
  },
  SET_RESOURCELIST(state: IDevelopState, resourceList: IResource[]) {
    state.resourceList = resourceList
  },
  SET_METADATATABLELIST(state: IDevelopState, metadataTableList: IMetadataTable[]) {
    state.metadataTableList = metadataTableList
  }
}

const actions: ActionTree<IDevelopState, any> = {
  async getJobList(context: { commit: Commit }, data: any = {}) {
    const result: IJobTreeNode[] = await request('getJobList', data)

    result.forEach((item, index) => {
      if (item.id === -1) {
        result.splice(index, 1)
        item.jobs.forEach((element) => {
          result.push(element as IJobTreeNode);
        });
      }
    })

    if (data.jobType === 'JAR') {
      context.commit('SET_JARLIST', result)
    } else {
      context.commit('SET_JOBLIST', result)
    }
    return result;
  },
  async getTagList(context: { commit: Commit }, data: any = {}) {
    const result: any = await request('getTagList', data)
    context.commit('SET_TAGLIST', result)
    return result
  },
  async getMetadataList(context: { commit: Commit }, data: any = {}) {
    const result: IMetadata[] = await request('getMetadataList', data)
    context.commit('SET_METADATALIST', result)

    return result
  },
  async getResourceList(context: { commit: Commit }, data: any = {}) {
    const result: IMetadata[] = await request('getResourceList', data)

    result.forEach((item, index) => {
      if (item.id === -1) {
        result.splice(index, 1)
        item.files.forEach((element) => {
          result.push(element as IMetadata);
        });
      }
    })

    context.commit('SET_RESOURCELIST', result)

    return result;
  },
  async getMetadataTableList(context: { commit: Commit }, data: any = {}) {
    const result: any = await request('getMetadataTableList', data)
    context.commit('SET_METADATATABLELIST', result)
    return result
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations
}

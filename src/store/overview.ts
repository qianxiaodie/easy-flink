import { request } from '@utils/request';
import { IOverviewState, ICluster, IKernel, IQueue } from '@utils/types';
import { MutationTree, ActionTree, Commit } from 'vuex';

const state: IOverviewState = {
  clusterList: [],
  kernelList: [],
  queueList: []
};

const mutations: MutationTree<IOverviewState> = {
  SET_CLUSTERLIST(state: IOverviewState, clusterList: ICluster[]) {
    state.clusterList = clusterList;
  },
  SET_KERNELLIST(state: IOverviewState, kernelList: IKernel[]) {
    state.kernelList = kernelList;
  },
  SET_QUEUELIST(state: IOverviewState, queueList: IQueue[]) {
    state.queueList = queueList;
  }
};

const actions: ActionTree<IOverviewState, any> = {
  async getClusterList(context: { commit: Commit }, data: any = {}) {
    const result: any = await request('getClusterList', data);
    context.commit('SET_CLUSTERLIST', result || []);
    return result;
  },
  async getKernelList(context: { commit: Commit }, data: any = {}) {
    const result: any = await request('getKernelList', data);
    context.commit('SET_KERNELLIST', result || []);
    return result;
  },
  async getQueueList(context: { commit: Commit }, data: any = {}) {
    const result: any = await request('getQueueList', data);
    context.commit('SET_QUEUELIST', result || []);
    return result;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};

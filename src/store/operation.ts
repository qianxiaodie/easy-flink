import { request } from '@utils/request';
import { IOperationState, IJob } from '@utils/types';
import { MutationTree, ActionTree, Commit } from 'vuex';
import { IJobCounter } from '../utils/types';

const DEFAULT_JOBCOUNTER = {
  normal: 0,
  abnormal: 0,
  failed: 0,
  stopped: 0,
  other: 0,
  total: 0
};

const DEFAULT_PARAMS = {
  pageSize: 25,
  pageNo: 1,
  order: 'desc',
  orderBy: 'startTime'
};

const state: IOperationState = {
  operationList: [],
  jobCounter: DEFAULT_JOBCOUNTER
};

const mutations: MutationTree<IOperationState> = {
  SET_OPERATIONLIST(state: IOperationState, operationList: IJob[]) {
    state.operationList = operationList;
  },
  SET_JOBCOUNTER(state: IOperationState, jobCounter: IJobCounter) {
    state.jobCounter = jobCounter;
  }
};

const actions: ActionTree<IOperationState, any> = {
  async getOperationJobList(context: { commit: Commit }, data: any = DEFAULT_PARAMS) {
    const result: any = await request('getOperationJobList', data);
    context.commit('SET_OPERATIONLIST', (result && result.info) || []);
    context.commit('SET_JOBCOUNTER', (result && result.jobCounter) || DEFAULT_JOBCOUNTER);
    return result;
  }
};

export default {
  namespaced: true,
  state,
  actions,
  mutations
};

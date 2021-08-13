// import { request } from '@utils/request';
import { IDatabase, IJob } from '@utils/types';
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

const state: IDatabase = {
    operationList: [],
    jobCounter: DEFAULT_JOBCOUNTER,
    dataBase: "",
    catalog:""
};

const mutations: MutationTree<IDatabase> = {
    SET_CATALOG(state: IDatabase, catalog: string) {
        state.catalog = catalog
    },
    SET_DATBASE(state: IDatabase, dataBase: string) {
        state.dataBase = dataBase
    }
};

const actions: ActionTree<IDatabase, any> = {
    //   async getOperationJobList(context: { commit: Commit }, data: any = DEFAULT_PARAMS) {
    // const result: any = await request('getOperationJobList', data);
    // context.commit('SET_OPERATIONLIST', (result && result.info) || []);
    // context.commit('SET_JOBCOUNTER', (result && result.jobCounter) || DEFAULT_JOBCOUNTER);
    // return result;
    //   }
};

export default {
    namespaced: true,
    state,
    actions,
    mutations
};

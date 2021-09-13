import { IGlobalState, IUser, IProduct, IUserConfig } from '@utils/types'
import { MutationTree, ActionTree, Commit } from 'vuex'
import { request } from '@/utils/request'
import { cloneDeep } from 'lodash'
import Axios from 'axios'
// let qs = require('qs')
// const isDevelop = process.env.NODE_ENV === "development";
const isDevelop = false
const state: IGlobalState = {
  // this.checkUserInfo();
  // userId: isDevelop ? 'liuweimin@corp.netease.com' : '',
  // userId: localStorage.getItem('userInfo') ? JSON.parse(<string>localStorage.getItem('userInfo')).ivUser : '',
  userId: '',

  // userId: 'fe_2@163.org',
  userName: '刘为民',
  product: localStorage.getItem('sloth_team') || '',
  developer: localStorage.getItem('sloth_developer') || '',
  team: localStorage.getItem('sloth_team') || '',
  space: localStorage.getItem('sloth_space') || '',
  roleID: localStorage.getItem('sloth_roleID') || '',
  productId: Number(localStorage.getItem('sloth_productId') || -1),
  productList: [],
  token: '',
  keepAliveList: [],
  userConfig: {
    env: '',
    server: '',
    mammutUrl: '',
    database: {}
  },
  host: {},
  databaseKeepAliveList: []
}

const mutations: MutationTree<IGlobalState> = {
  syncHost: (state: IGlobalState, payload: any) => {
    state.host = payload
  },
  SET_PRODUCT(state: IGlobalState, product: IProduct) {
    // localStorage.setItem('sloth_product', product.product)
    // localStorage.setItem('sloth_productId', product.productId.toString())
    // state.product = product.product
    // state.productId = product.productId
    state.product = localStorage.getItem('sloth_team') || ''
    state.productId = <number>(<unknown>localStorage.getItem('sloth_productId')) || -1
  },
  SET_PRODUCTLIST(state: IGlobalState, productList: IProduct[]) {
    state.productList = productList
  },
  LOG_IN(state: IGlobalState, user: IUser) {
    const releaseBaseUrl = `${window.location.origin}${window.location.pathname}`
    if (!localStorage.getItem('userInfo')) {
      window.location.href = releaseBaseUrl + '#/login';
    } else {
      state.userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser
    }
    if (isDevelop) {
      return;
    }
    // state.userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser
    // state.userId = user.email
    // state.userId = user.email
    // state.userId = 'fe_2@163.org'
    state.userName = user.fullName;
  },
  LOG_OUT(state) {
    state.userId = ''
    state.userName = ''
    state.productList = []
  },
  SET_KEEPALIVELIST(state: IGlobalState, keepAliveList: string[]) {
    state.keepAliveList = keepAliveList
  },
  SET_USERCONFIG(state: IGlobalState, userConfig: IUserConfig) {
    state.userConfig = userConfig
  },
  SET_DATABASEKEEPALIVELIST(state: IGlobalState, databaseKeepAliveList: string[]) {
    state.databaseKeepAliveList = databaseKeepAliveList
  },
  SET_USERID(state: IGlobalState, userId: string) {
    state.userId = userId
  }
}

const actions: ActionTree<IGlobalState, any> = {
  async getProductList(context: { commit: Commit }, data: any = {}) {
    const result: IProduct[] = await request('getProductList', data)
    context.commit('SET_PRODUCTLIST', cloneDeep(result || []))
    const product: string = localStorage.getItem('sloth_product') || ''
    if (result && result.length && (!product || result.findIndex(r => (r.product = product)) === -1)) {
      context.commit('SET_PRODUCT', result[0])
    }
    return result || []
  },
  async getUserInfo(context: { commit: Commit }) {
    const user: IUser = await request('getUserInfo')
    context.commit('LOG_IN', user)
    return user
  },
  async getUserConfig(context: { commit: Commit }) {
    const userConfig: IUserConfig = await request('getUserConfig')
    context.commit('SET_USERCONFIG', userConfig)
    return userConfig
  },
}
export default {
  namespaced: true,
  state,
  actions,
  mutations
}

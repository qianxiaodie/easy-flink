import Vue from 'vue';
import axios, { AxiosRequestConfig } from 'axios';
import qs from 'qs';
import API from '../api';
import store from '../store';

import { cloneDeep } from 'lodash';
import { IHttpResponse } from './types';

const { protocol, hostname, port } = window.location
const ORIGIN = port ? `${protocol}//${hostname}:${port}/` : `${protocol}//${hostname}/`
const DEV_ORIGIN = 'http://easydemo-arctic.163yun.com/'
// const DEV_ORIGIN = 'http://168.61.114.48:8080/HTAI/portal'
// const DEV_ORIGIN = ORIGIN;

// url前缀

const PRE_URL = '/'; // 本地

const DEFAULT_CONFIG = {
  baseURL: '',
  timeout: 10 * 60 * 1000,
  headers: {
    'Cache-Control': 'no-cache'
  }
}

const HTAI_CONFIG = {
  baseURL: 'http://168.61.114.19:8080/HTAI/portal/api',
  timeout: 10 * 60 * 1000,
  headers: {
    'Cache-Control': 'no-cache'
  }
}

const DEFAULT_OPTIONS: AxiosRequestConfig = {
  method: 'get',
  url: ''
}

const handleUrlSpecialCharacters = (url: string) => {
  return url.replace(/#/g, '%23'); // 暂时先处理 # 的情况，后续有出现其他特殊字符再说。
}
// console.log('requestrequest')
const ajax = (args: any = {}) => {
  // @ts-ignore
  // eslint-disable-next-line no-unused-vars
  const that = this

  const options: AxiosRequestConfig = Object.assign({}, DEFAULT_OPTIONS, args)
  const state = store.state as any

  // 所有接口都需要传 userId 和 product 参数
  if (!args.isFile && !args.isNode) {
    options.data = options.data || {}
    if (options.data && args.onlyUser) {
      // debugger
      const releaseBaseUrl = `${window.location.origin}${window.location.pathname}`
      if (!localStorage.getItem('userInfo')) {
        window.location.href = releaseBaseUrl + '#/login';
      } else {
        options.data.userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser || {}
        // that.$store.commit('SET_USERID', options.data.userId);
      }
      // options.data.userId=JSON.parse(<string>localStorage.getItem('userInfo')).ivUser || {}
      options.data.userId = 'wangtao03'
      // options.data.isDevelop= true,

    } else if (options.data) {
      // options.data.userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser ||{}
      // options.data.isDevelop= true,
      options.data.userId = 'wangtao03'
      // options.data.product='mammut'

      // console.log(options.data.product,'product')
      options.data.productId = 1
      // options.data.isDevelop=true
      // console.log(localStorage.getItem('sloth_team'),'sloth_team')
      // console.log(options.data.team)
      // options.data.jobType = 'JAR'
    }

    // console.log(options.data,'options.dataoptions.data')
  }
  if ((!options.method || options.method.toLowerCase() === 'get' || options.method.toLowerCase() === 'delete') && options.data) {
    if (!args.isFile && process.env.NODE_ENV === 'development') {
      // options.data.isDevelop = true;
    }
    options.url = handleUrlSpecialCharacters(options.url + '?' + qs.stringify(options.data))
    delete options.data
  }
  if (options.method && !args.isFile && (options.method.toLowerCase() === 'post' || options.method.toLowerCase() === 'put') && process.env.NODE_ENV === 'development') {
    const hasMask = options.url && options.url.includes('?')
    options.url = options.url + (hasMask ? '&' : '?')
  }

  // const origin = (state.global.userConfig && state.global.userConfig.server) || ORIGIN
  if (args.isDownload) {
    // window.open(origin + PRE_URL + options.url, '_blank')
    return Promise.resolve({
      code: 200,
      result: true
    })
  }

  const axiosConfig = cloneDeep(DEFAULT_CONFIG)
  axiosConfig.baseURL = DEV_ORIGIN
  if (options.headers) {
    axiosConfig.headers = options.headers
  }

  return new Promise((resolve, reject) => {
    const instance = axios.create(axiosConfig)
    const HTAIinstance = axios.create(HTAI_CONFIG)

    HTAIinstance.interceptors.request.use(
      config => {
        return config
      },
      e => {
        return Promise.reject(e)
      }
    )

    // request 拦截器
    instance.interceptors.request.use(
      config => {
        return config
      },
      e => {
        return Promise.reject(e)
      }
    )

    // response 拦截器
    instance.interceptors.response.use(
      response => {
        // IE9时response.data是undefined，因此需要使用response.request.responseText(Stringify后的字符串)
        const data = response.data === undefined ? response.request.responseText : response.data
        const code = data.code
        if (!code || (code && !code.toString().startsWith('2'))) {
          if (code && code.toString() === '403') {
            throw new Error('Token Failed')
          } else {
            // throw new Error(data.message)
            throw Vue.prototype.$message.error(data.message)

          }
        }
        return data
      },
      e => {
        return Promise.reject(e)
      }
    )

    // 请求处理
    instance(options)
      .then(res => resolve(res))
      .catch(e => {
        const msg = e.message
        // if (msg === 'Token Failed') {
        //   window.location.href = '/#/login'
        //   return
        // }
        if (msg === 'Network Error') {

          return Vue.prototype.$message.warning("请求超时，请稍后再试");
        }
        reject(e)
      })
  })
}

// 处理返回结果
const handleResponse = (res: IHttpResponse): any => {
  return res
}

// 处理异常情况
const handleException = (e: Error, content?: string): void => {
  console.log(content)
  const msg = e
  Vue.prototype.$message.error(content)
  // Vue.prototype.$message({
  //   type: 'error',
  //   content: content || msg || '请求错误',
  //   desc: content ? msg || '' : '',
  //   cancelButton: ''
  // })
}

const request = async (key: string, data?: any): Promise<any> => {
  const res = (await ajax(API[key](data))) as IHttpResponse
  return handleResponse(res)
}

export { request, handleException }

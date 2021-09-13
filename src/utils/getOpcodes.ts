import Axios from 'axios'

// 根据角色列表和操作码列表获取有权限的操作码列表（通用接口） 接口3
export const getOpCodes = async params => {
  // 获取sloth_roleID
  // if (localStorage.getItem('sloth_roleID') === null) {
  let locationMsg = window.location.href
  // 获取所有参数信息
  let num = locationMsg.indexOf('?')
  locationMsg = locationMsg.substr(num + 1)
  let paramsArr = locationMsg.split('&')
  paramsArr.forEach(item => {
    if (item.indexOf('roleID') === 0) {
      let index = item.indexOf('=')
      let roleID = item.substr(index + 1)
      localStorage.setItem('sloth_roleID', roleID)
    } else if (item.indexOf('ProRoleId') === 0) {
      let index = item.indexOf('=')
      let roleID = item.substr(index + 1)
      localStorage.setItem('sloth_roleID', roleID)
    }
  })
  // }

  let roleCode2 = []
  const params2 = <any>[]
  let roleCode1 = localStorage.getItem('sloth_roleID') as any
  roleCode2 = roleCode1.split(',')
  roleCode2.forEach(item => {
    params2.push({ roleCode: item, opCodes: ['rtdev_proj.devtest', 'rtdev_proj.devdeploy'] })
    // roleCode2 = item
  })
  const baseOpcodeUrl = '/HTAI/v2/api/portal/api/infra/privs-management/v1/roles/opcodes'
  // let hosturl = (window as any).sloth_config.VUE_APP_OPCODES;
  // let hosturl = '/HTAI/v2/api/portal';
  if (process.env.NODE_ENV === 'production') {
    return Axios.post(`${baseOpcodeUrl}`, params2, {
      headers: {
        API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
      }
    }).then(response => {
      return response.data.result[0]
    })
  } else {
    return Axios.post(`${baseOpcodeUrl}`, params2, {
      headers: {
        API_USER: '3be0a859885545b2b2bbb0157781636184a685b7cf6426c83909fe9'
      }
    })
      .then(response => {
        return response.data.result[0]
      })
      .catch(e => {
        console.log(e, 'getOpcddesError')
      })
  }
  // if (window.location.hostname === '168.7.76.117') {
  //   // prd
  //   return await Axios.post('http://168.11.73.250:8080/HTAI/portal/api/infra/privs-management/v1/roles/opcodes', params2).then(response => {
  //     return response.data.result[0];
  //   });
  // } else if (window.location.hostname === '168.61.114.48') {
  //   // SIT 核心区
  //   return await Axios.post('http://168.61.114.48:8080/HTAI/portal/api/infra/privs-management/v1/roles/opcodes', params2).then(response => {
  //     return response.data.result[0];
  //   });
  // } else if (window.location.hostname === '168.61.8.232') {
  //   // SIT 测试区
  //   return await Axios.post('http://168.61.8.232:8080/HTAI/portal/api/infra/privs-management/v1/roles/opcodes', params2).then(response => {
  //     return response.data.result[0];
  //   });
  // } else if (window.location.hostname === '168.63.118.52') {
  //   // UAT
  //   return await Axios.post('http://168.61.10.47:8080/HTAI/portal/api/infra/privs-management/v1/roles/opcodes', params2).then(response => {
  //     return response.data.result[0];
  //   });
  // } else if (window.location.hostname === '168.61.114.19') {
  //   // DEV 核心区
  //   return await Axios.post('http://168.61.114.19:8080/HTAI/portal/api/infra/privs-management/v1/roles/opcodes', params2).then(response => {
  //     return response.data.result[0];
  //   });
  // } else {
  //   // DEV 测试区
  //   return await Axios.post('http://168.61.8.233:8080/HTAI/portal/api/infra/privs-management/v1/roles/opcodes', params2).then(response => {
  //     return response.data.result[0];
  //   });
  // }
}

export default {
  getProductList(data: any) {
    const { userId } = data;
    return {
      url: 'mammut/products',
      method: 'get',
      data: { userId },
      onlyUser: true
    };
  },
  login(data: any) {
    const { returnTo } = data;
    return {
      url: 'login',
      method: 'get',
      data: { return_to: returnTo }
    };
  },
  getUserInfo() {
    return {
      url: 'login/info',
      method: 'get'
    };
  },
  judgeUserIdentify() {
    return {
      url: 'admin/user/role',
      method: 'get'
    };
  },
  logout() {
    return {
      url: 'logout',
      data: {}
    };
  },
  getUserConfig() { // 该接口在 node 中间层实现
    return {
      url: 'v1/config',
      method: 'get',
      isNode: true
    };
  }
};

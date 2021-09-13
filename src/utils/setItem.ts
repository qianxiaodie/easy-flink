export const setItem = state => {
  let locationMsg = window.location.href
  // 获取所有参数信息
  let num = locationMsg.indexOf('?')
  locationMsg = locationMsg.substr(num + 1)
  let paramsArr = locationMsg.split('&')
  // 遍历地址栏参数的数组，并赋值
  if (state === 'visible') {
    paramsArr.forEach(item => {
      if (item.indexOf('projectId') === 0) {
        let index = item.indexOf('=')
        let projectId = item.substr(index + 1)
        localStorage.setItem('sloth_projectId', projectId);
        localStorage.setItem('sloth_team', projectId);
      } else if (item.indexOf('developer') === 0) {
        let index = item.indexOf('=')
        let developer = item.substr(index + 1)
        localStorage.setItem('sloth_developer', developer);
      } else if (item.indexOf('spaceId') === 0) {
        let index = item.indexOf('=')
        let spaceId = item.substr(index + 1)
        localStorage.setItem('sloth_space', spaceId);
      } else if (item.indexOf('roleID') === 0) {
        let index = item.indexOf('=')
        let roleID = item.substr(index + 1)
        localStorage.setItem('sloth_roleID', roleID);
      } else if (item.indexOf('name') === 0) {
        let index = item.indexOf('=')
        let name = item.substr(index + 1)
        localStorage.setItem('sloth_projectName', name);
      } else if (item.indexOf('roleId') === 0) {
        let index = item.indexOf('=')
        let roleId = item.substr(index + 1)
        localStorage.setItem('sloth_roleId', roleId);
      } else if (item.indexOf('ProRoleId') === 0) {
        let index = item.indexOf('=')
        let roleID = item.substr(index + 1)
        localStorage.setItem('sloth_roleID', roleID);
      } else if (item.indexOf('jobId') === 0) {
        let index = item.indexOf('=')
        let jobId = item.substr(index + 1)
        localStorage.setItem('sloth_activetab', jobId);
      } else if (item.indexOf('jobId') === 0) {
        let index = item.indexOf('=')
        let jobId = item.substr(index + 1)
        localStorage.setItem('sloth_activetab', jobId);
      } else if (item.indexOf('userInfo') === 0) {
        console.log(item, 'userInfo!!!!!');
      }
    });
  }
  if (state === 'hidden') {
    console.log('我被隐藏了');
  }
}

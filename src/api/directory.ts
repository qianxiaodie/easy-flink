export default {
  createDirectory(data: any) {
    const { name, parentId, dirType } = data
    return {
      url: 'dirs',
      method: 'post',
      data: { name, parentId, dirType }
    }
  },
  updateDirectory(data: any) {
    const { name, dirId } = data
    return {
      url: `dirs/${dirId}`,
      method: 'put',
      data: { name }
    }
  },
  deleteDirectory(data: any) {
    // console.log(data, 'deleteDirectory')

    const { dirId } = data
    return {
      url: `dirs/${dirId}`,
      method: 'delete'
    }
  },
  getDirectoryList(data: any) {
    const { dirType } = data
    return {
      url: 'dirs',
      method: 'get',
      data: { dirType }
    }
  }
}

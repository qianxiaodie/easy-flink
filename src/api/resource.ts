export default {
  getResourceList() {
    return {
      url: 'files',
      method: 'get',
      data: {}
    };
  },
  deleteFile(data: any) {
    const { fileId } = data;
    return {
      url: `files/${fileId}`,
      method: 'delete',
      data: {}
    };
  }
};

export default {
  getTagList(data: any) {
    const { pageNo, pageSize } = data;
    return {
      url: 'tags',
      method: 'get',
      data: { pageNo, pageSize }
    };
  },
  createTag(data: any) {
    const { name, description } = data;
    return {
      url: 'tags',
      method: 'post',
      data: { name, description }
    };
  },
  updateTag(data: any) {
    const { tagId, name, description } = data;
    return {
      url: `tags/${tagId}`,
      method: 'put',
      data: { name, description }
    };
  },
  deleteTag(data: any) {
    const { tagId } = data;
    return {
      url: `tags/${tagId}`,
      method: 'delete',
      data: {}
    };
  },
  linkTag(data: any) {
    const { tagIds, objId, objType } = data;
    return {
      url: 'object/tags',
      method: 'put',
      data: { tagIds, objId, objType }
    };
  },
  isTagLinked(data: any) {
    const { tagId } = data;
    return {
      url: `tags/${tagId}/refer`,
      method: 'get',
      data: {}
    };
  }
};

export default {
  getMetadataList() {
    return {
      url: 'metas',
      method: 'get',
      data: {}
    };
  },
  createMetadata(data: any) {
    const { dataSource, catalog, db, name, metaType, rawSql, description } = data;
    return {
      url: 'metas',
      method: 'post',
      data: { dataSource, catalog, db, name, metaType, rawSql, description }
    };
  },
  updateMetadata(data: any) {
    const { dataSource, catalog, db, metaId, name, rawSql, description } = data;
    return {
      url: `metas/${metaId}`,
      method: 'put',
      data: { dataSource, catalog, db, name, rawSql, description }
    };
  },
  deleteMetadata(data: any) {
    const { metaId } = data;
    return {
      url: `metas/${metaId}`,
      method: 'delete',
      data: {}
    };
  },
  getMetadataDetail(data: any) {
    const { metaId } = data;
    return {
      url: `metas/${metaId}`,
      method: 'get',
      data: {}
    };
  }
};

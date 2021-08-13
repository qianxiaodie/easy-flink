export default {
  getTableMajorCompactTaskInfoList(data: any) {
    const { creator, userId, productId, catalog, database } = data;
    return {
      url: '/arctic/v2/tables',
      method: 'get',
      data: { creator, userId, productId, catalog, database }
    };
  },
  //获取列表
  getTablelistInfos(data: any) {
    const { productId, userId, catalog, database, creator, tableName, order, orderBy, offset, limit } = data;
    return {
      url: '/arctic/v2/tables',
      method: 'get',
      data: { productId, userId, catalog, database, creator, tableName, order, orderBy, offset, limit }
    };
  },
  //查询合并历史
  getTableMajorCompactRecord(data: any) {
    const { productId, userId, catalog, range, database, tableName, order, orderBy, offset, limit } = data;
    return {
      url: `/arctic/v2/tables/${catalog}/${database}/${tableName}/compaction/major/records`,
      method: 'get',
      data: { productId, userId, catalog, database, range, tableName, order, orderBy, offset, limit }
    }
  },
  //合并历史列表
  getTableMajorCompactRecordList(data: any) {
    const { productId, userId, catalog, range, database, tableName, order, orderBy, offset, limit, recordId } = data;
    return {
      url: `/arctic/v2/tables/${catalog}/${database}/${tableName}/compaction/major/records/${recordId}`,
      method: 'get',
      data: { productId, userId, catalog, database, range, tableName, order, orderBy, offset, limit, recordId }
    }
  },
  //查询正在合并信息，单个task
  getTableMajorCompactTaskInfo(data: any) {
    const { productId, userId, catalog, range, database, tableName, order, orderBy, offset, limit, traceId } = data;
    return {
      url: `/arctic/v2/tables/${catalog}/${database}/${tableName}/compaction/major/tasks/${traceId}`,
      method: 'get',
      data: { traceId, productId, userId, catalog, database, range, tableName, order, orderBy, offset, limit }
    }
  },
  //获取kafka
  getKafkaClusterInfos(data: any) {
    const { productId, userId } = data;
    return {
      url: `/arctic/v2/kafka/clusters`,
      method: 'get',
      data: { productId, userId }
    }
  },
  //获取hbase集群
  getHBaseClusterInfos(data: any) {
    const { productId, userId } = data;
    return {
      url: `/arctic/v2/hbase/clusters`,
      method: 'get',
      data: { productId, userId }
    }
  },
  //获取hive集群 catalog
  getHiveCatalogs(data: any) {
    const { productId, userId } = data;
    return {
      url: `/arctic/v2/hive/catalogs`,
      method: 'get',
      data: { productId, userId }
    }
  },
  //获取表基本信息（用于运行信息-基本信息界面展示
  getTableBasicInfo(data: any) {
    const { productId, userId, catalog, database, tableName, refresh } = data;
    return {
      url: `/arctic/v2/tables/${catalog}/${database}/${tableName}/basicInfo`,
      method: 'get',
      data: { refresh, productId, userId, catalog, database, tableName }
    }
  },
  //获取表名
  getTableNames(data: any) {
    const { userId, catalog, database } = data;
    return {
      url: `/arctic/v2/tables/tableNames`,
      method: 'get',
      data: { userId, catalog, database }
    }
  },
  //获取hive下的表
  getHiveTables(data: any) {
    const { userId, catalog, database } = data;
    return {
      url: `/arctic/v2/hive/tables`,
      method: 'get',
      data: { userId, catalog, database }
    }
  },
  //获取hive下的数据库
  getHiveDatabases(data: any) {
    const { userId, catalog } = data;
    return {
      url: `/arctic/v2/hive/databases`,
      method: 'get',
      data: { userId, catalog }
    }
  },
  //获取hive table info  分区字段
  getHiveTableInfo(data: any) {
    const { userId, catalog, database, tableName } = data;
    return {
      url: `/arctic/v2/hive/tables/${catalog}/${database}/${tableName}/info`,
      method: 'get',
      data: { userId, catalog, database, tableName }
    }
  },
  // 检查topic是否存在
  checkKafkaTopicExist(data: any) {
    const { userId, zkAddress, brokerList, topic } = data;
    return {
      url: `/arctic/v2/kafka/topics/${topic}/exist`,
      method: 'get',
      data: { userId, zkAddress, brokerList }
    }
  },
  //查看表的可选配置项
  getTableProperties(data: any) {
    // const { userId,catalog,database,tableName} = data;
    return {
      url: `/arctic/v2/table-properties`,
      method: 'get',
      data: {}
    }
  },

  //创建表
  createTable(data: any) {
    const { tableIdentifier, columnList, pkList, partitionColumnList, cdcMeta, indexMeta, adaptHiveMeta, properties, productId, userId, userName } = data;
    return {
      url: `arctic/v2/tables?productId=${productId}&userId=${userId}&userName=${userName}`,
      method: 'post',
      data: { tableIdentifier, columnList, pkList, partitionColumnList, cdcMeta, indexMeta, adaptHiveMeta, properties }
    };
  },
  //更新
  updateTable(data: any) {
    const { tableIdentifier, columnList, pkList, partitionColumnList, cdcMeta, indexMeta, adaptHiveMeta, properties, productId, userId, userName,catalog,database,tableName } = data;
    return {
      url: `arctic/v2/tables/${catalog}/${database}/${tableName}?productId=${productId}&userId=${userId}&userName=${userName}`,
      method: 'put',
      data: { tableIdentifier, columnList, pkList, partitionColumnList, cdcMeta, indexMeta, adaptHiveMeta, properties }
    };
  },

   //删除表
   deleteTable(data: any) {
    const { productId, userId, userName,catalog,database,tableName } = data;
    return {
      url: `/arctic/v2/tables/${catalog}/${database}/${tableName}`,
      method: 'delete',
      data: { productId, userId, userName }
    };
  },
  

  //获取表配置元数据
  getTableMeta(data: any) {
    const { catalog, database, tableName } = data;
    return {
      url: `arctic/v2/tables/${catalog}/${database}/${tableName}/meta`,
      method: 'get',
      data: { catalog, database, tableName }
    };
  },
  

};

import { IProduct, IUser } from '@utils/types';

export default {
  modifyJobStatus(data: any) {
    const { jobId, newTaskStatus } = data;
    return {
      url: `admin/jobs/${jobId}/status`,
      method: 'put',
      data: { newTaskStatus }
    };
  },
  getUserList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/users',
      method: 'get',
      onlyUser: true,
      data: { pageIndex, pageSize }
    };
  },
  addUser(data: any) {
    const { userList } = data;
    return {
      url: 'admin/users',
      method: 'post',
      onlyUser: true,
      data: { userList }
    };
  },
  removeUser(data: any) {
    const { userId } = data;
    return {
      url: 'admin/users',
      method: 'delete',
      data: { userId },
      onlyUser: true
    };
  },
  getTaskList(data: any) {
    const { pageIndex, pageSize, product } = data;
    return {
      url: 'admin/task/statistics',
      method: 'get',
      data: { pageIndex, pageSize, product },
      onlyUser: true
    };
  },
  getTaskStatistics(data: any) {
    const { product, statistic_type, from, end } = data;
    return {
      url: 'admin/task/statistics_filter',
      method: 'get',
      data: { product, statistic_type, from, end },
      onlyUser: true
    };
  },
  getDockingList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/contact_infos',
      method: 'get',
      data: { pageIndex, pageSize },
      onlyUser: true
    };
  },
  createDocking(data: any) {
    const { product, contact, receiveType } = data;
    const emails = contact.map((c: IUser) => c.email || '').filter(Boolean);
    return {
      url: 'admin/contact_info',
      method: 'post',
      data: { product, contact: emails.join(','), receiveType },
      onlyUser: true
    };
  },
  updateDocking(data: any) {
    const { id, contact, receiveType } = data;
    const emails = contact.map((c: IUser) => c.email || '').filter(Boolean);
    return {
      url: 'admin/contact_info',
      method: 'put',
      data: { id, contact: emails.join(','), receiveType },
      onlyUser: true
    };
  },
  removeDocking(data: any) {
    const { id } = data;
    return {
      url: 'admin/contact_info',
      method: 'delete',
      data: { id },
      onlyUser: true
    };
  },
  getAdminProducts() {
    return {
      url: 'admin/products',
      method: 'get',
      onlyUser: true,
      data: {}
    };
  },
  getAlarmList(data: any) {
    const { pageIndex, pageSize, product, alarmType, jobName } = data;
    return {
      url: 'admin/alarms',
      method: 'get',
      data: { pageIndex, pageSize, product, alarmType, jobName },
      onlyUser: true
    };
  },
  getAlarmTypes() {
    return {
      url: 'admin/alarm_types',
      method: 'get',
      onlyUser: true,
      data: {}
    };
  },
  createToken(data: any) {
    const { product, applier, description } = data;
    return {
      url: 'admin/openapi/apikeys',
      method: 'post',
      data: { product, applier, description },
      onlyUser: true
    };
  },
  getTokenList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/openapi/apikeys',
      method: 'get',
      data: { pageIndex, pageSize },
      onlyUser: true
    };
  },
  removeToken(data: any) {
    const { id } = data;
    return {
      url: `admin/openapi/apikeys/${id}`,
      method: 'delete',
      data: {},
      onlyUser: true
    };
  },
  getAdminClusterList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/clusters',
      method: 'get',
      onlyUser: true,
      data: { pageIndex, pageSize }
    };
  },
  createCluster(data: any) {
    const { clusterName, clusterType, flinkConfPath, clusterConfPath, checkpointPath, clusterUrlPref, clusterUrlPrefWithDomain, taskSubmitter, defaultQueue, yarnName, clusterTags, publicCluster, productList, costing, esPath, kerberosOn, clusterMasterUrl, esLogLevel, keytab, principal } = data;
    const list = productList.map((p: IProduct) => p.product);
    return {
      url: 'admin/clusters',
      method: 'post',
      onlyUser: true,
      data: { clusterName, clusterType, flinkConfPath, clusterConfPath, checkpointPath, clusterUrlPref, clusterUrlPrefWithDomain, taskSubmitter, defaultQueue, yarnName, clusterTags, publicCluster, productList: list, costing, esPath: (esPath || '').split('\n').filter(Boolean), kerberosOn, clusterMasterUrl, esLogLevel, keytab, principal }
    };
  },
  updateCluster(data: any) {
    const { clusterId, clusterName, clusterType, flinkConfPath, clusterConfPath, checkpointPath, clusterUrlPref, clusterUrlPrefWithDomain, taskSubmitter, defaultQueue, yarnName, clusterTags, publicCluster, productList, costing, esPath, kerberosOn, clusterMasterUrl, esLogLevel, keytab, principal } = data;
    const list = productList.map((p: IProduct) => p.product);
    return {
      url: `admin/clusters/${clusterId}`,
      method: 'put',
      onlyUser: true,
      data: { clusterName, clusterType, flinkConfPath, clusterConfPath, checkpointPath, clusterUrlPref, clusterUrlPrefWithDomain, taskSubmitter, defaultQueue, yarnName, clusterTags, publicCluster, productList: list, costing, esPath: (esPath || '').split('\n').filter(Boolean), kerberosOn, clusterMasterUrl, esLogLevel, keytab, principal }
    };
  },
  removeCluster(data: any) {
    const { clusterId } = data;
    return {
      url: `admin/clusters/${clusterId}`,
      method: 'delete',
      data: {},
      onlyUser: true
    };
  },
  getAdminKernelList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/kernels',
      method: 'get',
      onlyUser: true,
      data: { pageIndex, pageSize }
    };
  },
  createKernel(data: any) {
    const { kernelName, kernelType, jarPath, implName, shell, flinkPath, launchParameters, extendParameters, taskType, shellPath } = data;
    return {
      url: 'admin/kernels',
      method: 'post',
      onlyUser: true,
      data: { kernelName, kernelType, jarPath, implName, shell, flinkPath, launchParameters, extendParameters, taskType, shellPath }
    };
  },
  updateKernel(data: any) {
    const { kernelId, kernelName, kernelType, jarPath, implName, shell, flinkPath, launchParameters, extendParameters, taskType, shellPath } = data;
    return {
      url: `admin/kernels/${kernelId}`,
      method: 'put',
      onlyUser: true,
      data: { kernelName, kernelType, jarPath, implName, shell, flinkPath, launchParameters, extendParameters, taskType, shellPath }
    };
  },
  removeKernel(data: any) {
    const { kernelId } = data;
    return {
      url: `admin/kernels/${kernelId}`,
      method: 'delete',
      onlyUser: true,
      data: {}
    };
  },
  getAdminYarnList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/yarnqueues',
      method: 'get',
      onlyUser: true,
      data: { pageIndex, pageSize }
    };
  },
  createYarn(data: any) {
    const { queueName, product, description, clusterId } = data;
    return {
      url: 'admin/yarnqueues',
      method: 'post',
      data: { queueName, product, description, clusterId },
      onlyUser: true
    };
  },
  removeYarn(data: any) {
    const { id } = data;
    return {
      url: `admin/yarnqueues/${id}`,
      method: 'delete',
      onlyUser: true,
      data: {}
    };
  },
  getOperationRecordList(data: any) {
    const { product, from, end, caller, jobId, pageIndex, pageSize } = data;
    return {
      url: 'admin/audits',
      method: 'get',
      data: { product, from, end, caller, jobId, pageIndex, pageSize },
      onlyUser: true
    };
  },
  getClusterBriefList() {
    return {
      url: 'admin/clusters/brief',
      method: 'get',
      onlyUser: true,
      data: {}
    };
  },
  getSubmitterList(data: any) {
    const { clusterId } = data;
    return {
      url: `admin/clusters/${clusterId}/submitters`,
      method: 'get',
      onlyUser: true,
      data: {}
    };
  },
  createSubmitter(data: any) {
    const { clusterId, product, submitter, keytab, principal } = data;
    return {
      url: `admin/clusters/${clusterId}/submitters`,
      method: 'post',
      onlyUser: true,
      data: { product, submitter, keytab, principal }
    };
  },
  updateSubmitter(data: any) {
    const { clusterId, id, submitter, keytab, principal } = data;
    return {
      url: `admin/clusters/${clusterId}/submitters/${id}`,
      method: 'put',
      onlyUser: true,
      data: { submitter, keytab, principal }
    };
  },
  removeSubmitter(data: any) {
    const { clusterId, id } = data;
    return {
      url: `admin/clusters/${clusterId}/submitters/${id}`,
      method: 'delete',
      onlyUser: true,
      data: {}
    };
  },
  getResourceStatistics(data: any) {
    const { clusterId, orderBy, from, end } = data;
    return {
      url: 'admin/cluster/period/resources',
      method: 'get',
      data: { clusterId, orderBy, from, end },
      onlyUser: true
    };
  },
  getAdminImageList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/images',
      method: 'get',
      onlyUser: true,
      data: { pageIndex, pageSize }
    };
  },
  createImage(data: any) {
    const { imageName, image, kernelId, flinkPath } = data;
    return {
      url: 'admin/images',
      method: 'post',
      data: { imageName, image, kernelId, flinkPath },
      onlyUser: true
    };
  },
  removeImage(data: any) {
    const { id } = data;
    return {
      url: `admin/images/${id}`,
      method: 'delete',
      data: {},
      onlyUser: true
    };
  },
  getFlinkConfList(data: any) {
    const { pageIndex, pageSize } = data;
    return {
      url: 'admin/ckfcps',
      method: 'get',
      onlyUser: true,
      data: { pageIndex, pageSize }
    };
  },
  createFlinkConf(data: any) {
    const { clusterId, kernelId, imageId, flinkConfPath } = data;
    return {
      url: 'admin/ckfcps',
      method: 'post',
      data: { clusterId, kernelId, imageId, flinkConfPath },
      onlyUser: true
    };
  },
  removeFlinkConf(data: any) {
    const { id } = data;
    return {
      url: `admin/ckfcps/${id}`,
      method: 'delete',
      data: {},
      onlyUser: true
    };
  },
  getMetricList(data: any) {
    const { startTime, endTime, product } = data;
    return {
      url: 'metrics',
      method: 'get',
      data: { startTime, endTime, product },
      onlyUser: true
    };
  },
  getKafkaMetaInfos() {
    return {
      url: 'admin/kafkaMetaInfos',
      method: 'get',
      data: {}
    };
  },
  createKafkaMetaInfo(data: any) {
    const { bootstrapServers, bootstrapName } = data;
    return {
      url: 'admin/kafkaMetaInfo',
      method: 'post',
      data: { bootstrapServers, bootstrapName }
    };
  },
  updateKafkaMetaInfo(data: any) {
    const { id, bootstrapServers, bootstrapName } = data;
    return {
      url: `admin/kafkaMetaInfo?id=${id}`,
      method: 'put',
      data: { bootstrapServers, bootstrapName }
    };
  },
  removeKafkaMetaInfo(data: any) {
    const { id } = data;
    return {
      url: 'admin/kafkaMetaInfo',
      method: 'delete',
      data: { id }
    };
  }
};

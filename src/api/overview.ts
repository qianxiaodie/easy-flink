export default {
  getResourceDetail(data: any) {
    const { clusterId, queueId } = data;
    return {
      url: 'resources',
      method: 'get',
      data: { clusterId, queueId }
    };
  },
  getJobStatistics(data: any) {
    const { pageSize, pageNo, taskStatus, clusterId, tagId, taskType } = data;
    return {
      url: 'jobs/statistics',
      method: 'get',
      data: { pageSize, pageNo, taskStatus, clusterId, tagId, taskType }
    };
  },
  getKernelList() {
    return {
      url: 'kernels',
      method: 'get',
      data: {}
    };
  },
  getK8sKernelList() {
    return {
      url: 'k8s/images',
      method: 'get',
      data: {}
    };
  },
  getClusterList({ ignoreProduct = false } = {}) {
    return {
      url: 'clusters',
      method: 'get',
      data: {},
      onlyUser: ignoreProduct
    };
  },
  getQueueList(data: any) {
    const { clusterId } = data;
    return {
      url: 'yarn/queues',
      method: 'get',
      data: { clusterId }
    };
  }
};

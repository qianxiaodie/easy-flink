export default {
  // 获取安装参数
  getparameter(data: any) {
    const { projectId, jobId, action } = data
    return {
      url: 'ht/jobs/parameter/get',
      method: 'get',
      data: { projectId, action, jobId, version: '' }
    }
  },
  //获取集群参数
  getclusters(data: any) {
    const { userId, product } = data
    return {
      url: 'ht/clusters/get',
      method: 'get',
      data: { userId, product }
    }
  },

  //获取checkpoint
  getcheckpoints(data: any) {
    const { jobId } = data
    return {
      url: 'ht/checkpoints/get',
      method: 'get',
      data: { jobId }
    }
  },
 //deploy
 getdeploy(data: any) {
  const { checkpoint,clusterId,description,extRunParameter,jobId,projectId,runParameter ,userId,action ,appSpaceId,queueId} = data
  const isApply = false
  return {
    url: 'ht/operations/jobs/deploy',
    method: 'post',
    data: { checkpoint,clusterId,description,extRunParameter,jobId,projectId,runParameter ,userId ,action,appSpaceId,queueId,isApply}
  }
},
}

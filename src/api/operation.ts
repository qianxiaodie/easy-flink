export default {
  getOperationJobList(data: any) {
    // if (!data.isAdmin && data.product) {
    //   delete data.product
    // }
    return {
      url: 'operations/jobs',
      method: 'post',
      data: data,
      onlyUser: data.isAdmin
    }
  },
  getOperationJobDetail(data: any) {
    const { jobId } = data
    return {
      url: `operations/jobs/${jobId}`,
      method: 'get',
      data: {}
    }
  },
  operateJob(data: any) {
    const { jobId, op, keepState, cpkPath } = data
    return {
      url: `operations/jobs/${jobId}`,
      method: 'put',
      data: data
    }
  },
  getOperationJobLog(data: any) {
    const { lifeCycleId, eventType } = data
    return {
      url: `operations/jobs/log/${lifeCycleId}`,
      method: 'get',
      data: { eventType }
    }
  },
  getAlarmRulesMeta() {
    return {
      url: 'operations/alarm_rules_meta',
      method: 'get',
      data: {}
    }
  },
  getAlarmGroups() {
    return {
      url: `operations/product/alarmgroup`,
      method: 'get',
      data: {}
    }
  },
  getAlarmTypes() {
    return {
      url: 'operations/alarm/receiveType',
      method: 'get',
      data: {}
    }
  },
  getAlarmUsers() {
    return {
      url: `mammut/allusers`,
      method: 'get',
      data: {}
    }
  },
  getOperationJobAlarm(data: any) {
    const { jobId } = data
    return {
      url: `operations/jobs/${jobId}/alarm`,
      method: 'get',
      data: {}
    }
  },
  setOperationJobAlarm(data: any) {
    const { jobId, emails, receiveType, alarmDetail, pausingInterval, alarmGroupId, pausingEnable, alarmEnable, userNos } = data
    return {
      url: `operations/jobs/${jobId}/alarm`,
      method: 'post',
      data: { jobId, emails, userNos, receiveType, alarmDetail, pausingInterval, alarmGroupId, pausingEnable, alarmEnable }
    }
  },
  getOperationJobRecords(data: any) {
    const { jobId } = data
    return {
      url: `operations/jobs/${jobId}/lifecycle`,
      method: 'get',
      data: {}
    }
  },
  getOperationJobElkLog(data: any) {
    const { clusterId, applicationId, containerId, timeEnd, timeStart, logType, logLevel, from, size, keyword, id, sort, querySurrounding = 0 } = data
    return {
      url: `operations/logs/list/${clusterId}/${applicationId}`,
      method: 'post',
      data: { timeEnd, timeStart, logType, logLevel, from, size, keyword, containerId, id, sort, querySurrounding }
    }
  },
  getContainerIds(data: any) {
    const { clusterId, applicationId } = data
    return {
      url: `operations/logs/${clusterId}/${applicationId}`,
      method: 'get',
      data: {}
    }
  },
  getJobalarmList(data: any) {
    const { jobId, pageNo, pageSize, userId } = data
    return {
      url: `operations/jobs/${jobId}/alarmLog`,
      method: 'get',
      data: { userId, pageNo, pageSize }
    }
  },
  getJobalarmConfig(data: any) {
    const { jobId } = data
    return {
      url: `operations/jobs/${jobId}/alarmConfig`,
      method: 'get',
      data: {}
    }
  },
  getTaskName(data: any) {
    const { clusterId, applicationId } = data
    return {
      url: `operations/logs/task/${clusterId}/${applicationId}`,
      method: 'get',
      data: {}
    }
  },
  getSubTask(data: any) {
    const { clusterId, applicationId, taskName } = data
    return {
      url: `operations/logs/subTask/${clusterId}/${applicationId}`,
      method: 'post',
      data: { taskName }
    }
  },
  getJobRecordList(data: any) {
    const { jobId, caller, pageIndex, pageSize } = data
    return {
      url: `operations/jobs/${jobId}/audits`,
      method: 'get',
      data: { caller, pageIndex, pageSize }
    }
  },
  getCheckPointsList(data: any) {
    const { jobId, cpkRootPath = '', availLifecycleCnt = 5 } = data
    return {
      url: `operations/jobs/${jobId}/checkpoints`,
      method: 'get',
      data: { cpkRootPath, availLifecycleCnt }
    }
  },
  getPaasClusterQueue(data: any) {
    const { appSpaceId, userId } = data
    return {
      url: `ht/paasClusterQueue/get`,
      method: 'get',
      data: { appSpaceId, userId }
    }
  },
  getCpkRootPath(data: any) {
    const { jobId } = data
    return {
      url: `operations/jobs/${jobId}/lifecycle/last/cpkRootPath`,
      method: 'get',
      data: {}
    }
  },
  getDiagnosisModule(data: any) {
    const { jobId, diagnoseType } = data
    return {
      url: `operations/jobs/${jobId}/diagnose/${diagnoseType}/summary`,
      method: 'get',
      data: {}
    }
  },
  getDiagnosisDetail(data: any) {
    const { jobId, diagnoseType, diagnoseCategory } = data
    return {
      url: `operations/jobs/${jobId}/diagnose/detail`,
      method: 'get',
      data: { diagnoseType, diagnoseCategory }
    }
  },
  getProductUsers() {
    return {
      url: 'operations/product/users',
      method: 'get',
      data: {}
    }
  },
  getQueueName(data) {
    const { jobId } = data
    return {
      url: 'ht/jobQueue/get',
      method: 'get',
      data: { jobId }
    }
  },
  getJobDeployState(data) {
    const { jobId } = data
    return {
      url: 'ht/jobDeployState/get',
      method: 'get',
      data: { jobId }
    }
  },
  getConfigParam(data) {
    const { projectId } = data
    return {
      url: 'ht/verification/configParam/get',
      method: 'get',
      data: { projectId }
    }
  },

}

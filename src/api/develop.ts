export default {
  getJobList(data: any) {
    // const { tags, name, status, isOwner, jobType } = data
    return {
      url: `jobs`,
      method: 'get',
      data: data
    };
  },
  saveSql(data: any) {
    const { jobId, rawsql } = data;
    return {
      url: `jobs/${jobId}/rawsql`,
      method: 'put',
      data: { jobId, rawsql }
    };
  },
  createJob(data: any) {
    const { jobName, parentId, description, clusterId, kernelId, type, queueId, imageId } = data;
    return {
      url: `jobs`,
      method: 'post',
      data: { jobName, parentId, description, clusterId, kernelId, type, queueId, imageId }
    };
  },
  copyJob(data: any) {
    const { srcJobId, jobName, parentId, description, clusterId, kernelId, type, queueId, imageId } = data;
    return {
      url: `jobs/copy`,
      method: 'post',
      data: { srcJobId, jobName, parentId, description, clusterId, kernelId, type, queueId, imageId }
    };
  },
  updateJob(data: any) {
    const {
      jobId,
      mainClass,
      mainArgs,
      flinkJarPath,
      flinkJarName,
      flinkJarResId,
      flinkJarMd5,
      runParameter,
      queueId,
      kernelId,
      imageId,
      clusterId,
      rawSql,
      jobType,
      extRunParameter,
      uploader,
      uploadTime,
      resourceDesc
    } = data;
    return {
      url: `jobs/${jobId}`,
      method: 'put',
      data: {
        mainClass,
        mainArgs,
        flinkJarPath,
        flinkJarName: flinkJarResId ? '' : flinkJarName,
        flinkJarResId,
        flinkJarMd5,
        runParameter,
        queueId,
        kernelId,
        imageId,
        clusterId,
        rawSql,
        jobType,
        extRunParameter,
        uploader,
        uploadTime,
        resourceDesc
      }
    };
  },
  moveJob(data: any) {
    const { jobId, dstId } = data;
    return {
      url: `jobs/${jobId}/parentId`,
      method: 'put',
      data: { dstId }
    };
  },
  releaseJob(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}/deploy`,
      method: 'put',
      data: {}
    };
  },
  deleteJob(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}`,
      method: 'delete'
    };
  },
  getJobDetail(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}`,
      method: 'get',
      data: {}
    };
  },
  getJobExist(data: any) {
    const { jobName } = data;
    return {
      url: `jobs/exist`,
      method: 'get',
      data: { jobName }
    };
  },
  getJobSourceTables(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}/debug_tables`,
      method: 'get',
      data: {}
    };
  },
  restoreJob(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}/restore`,
      method: 'put',
      data: {}
    };
  },
  updateJobTag(data: any) {
    const { jobId, tag } = data;
    return {
      url: `jobs/${jobId}/tags`,
      method: 'put',
      data: { tag }
    };
  },
  debugSql(data: any) {
    const { jobId, rawSql, debugFileList } = data;
    return {
      url: `jobs/${jobId}/debug`,
      method: 'post',
      data: { rawSql, jobId, debugFileList }
    };
  },
  checkGrammar(data: any) {
    const { jobId, rawSql, fileList, kernelId } = data;
    return {
      url: `jobs/${jobId}/syntaxcheck`,
      method: 'post',
      data: { rawSql, fileList, kernelId }
    };
  },
  queryJob(data: any) {
    const { filter, value, pageSize, pageNo } = data;
    return {
      url: `jobs`,
      method: 'get',
      data: { filter, value, pageSize, pageNo }
    };
  },
  // 查询某个目录下的文件是否被引用
  referResourceFile(data: any) {
    const { space, product, parentId, fileName } = data;
    return {
      url: 'files/file/referby/get',
      method: 'get',
      data: { space, product, parentId, fileName }
    };
  },
  updateDependency(data: any) {
    const { jobId, fileList, mammutKyb } = data;
    return {
      url: `jobs/${jobId}/dependencies`,
      method: 'post',
      data: { fileList, mammutKyb }
    };
  },
  getJobVersion(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}/deployed_versions`,
      method: 'get',
      data: {}
    };
  },
  deleteJobVersion(data: any) {
    const { jobId, versionId } = data;
    return {
      url: `jobs/${jobId}/deployed_versions/${versionId}`,
      method: 'delete',
      data: {}
    };
  },
  downloadJar(data: any) {
    const { jobId } = data;
    return {
      url: `/jobs/${jobId}/jarfile`,
      method: 'get',
      data: {},
      isDownload: true
    };
  },
  downloadFile(data: any) {
    const { fileId } = data;
    return {
      url: `/files/${fileId}`,
      method: 'get',
      data: {},
      isDownload: true
    };
  },
  getTopologyDetail(data: any) {
    const { jobId } = data;
    return {
      url: `jobs/${jobId}/resourcedesc`,
      method: 'get',
      data: {}
    };
  },
  calcTopologySummary(data: any) {
    const { jobId, resourceDesc } = data;
    return {
      url: `jobs/${jobId}/resourcedesc/summary`,
      method: 'post',
      data: { resourceDesc }
    };
  },
  // 获取脱敏文件
  getDesensitingFile(data:any) {
    // const path = data;
    return {
      url: `jobs/getFileList`,
      method: 'post',
      data: data
    };
  },
  // 选择脱敏文件后传给后台
  uoloadDesensitingFile(data:any) {
    return {
      url: `jobs/debugger/file`,
      method: 'post',
      data: data
    };
  },
  // 获取inputJson内容
  getInputJson(data:any) {
    return {
      url: `jobs/getInputJsonContent`,
      method: 'post',
      data: data
    };
  }
};


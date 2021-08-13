export interface IHttpResponse {
  code: number
  msg: string
  result?: any
}

export interface IChange {
  recordId: number
  visibleTime: number
  commitTime: number
  planTime: number
  duration: number
  tableIdentifier: TableIdentifier[]
  compactRange: CompactRangeType[]
  totalFilesStatBeforeCompact: FilesStatistics[]
  insertFilesStatBeforeCompact: FilesStatistics[]
  deletetFilesStatBeforeCompact: FilesStatistics[]
  basetFilesStatBeforeCompact: FilesStatistics[]
  totalFilesStatAfterCompact: FilesStatistics[]
  snapshotinfo: SnapshotInfo[]
  partitionCnt: Number
  partitions: String
  baseTableMaxFileSequence: String
}


export interface IProduct {
  productId: number
  product: string
  clusterIds?: string[]
  businessLine?: string
}

export interface ICluster {
  id: number
  clusterName: string
  clusterType?: string
  esLogLevel?: ILogLevel
}

export interface ILogLevel {
  info: string[]
  error: string[]
}

export interface IDatabase {
  operationList: IJob[]
  jobCounter: object[]
}

export interface IJob {

}


export interface IBase {

}

export interface TableIdentifier {

}
export interface CompactRangeType {
  Table: String
  Partition: String
  Node: String
}
export interface FilesStatistics {
  fileCnt: Number
  totalSize: Number
  averageSize: Number
}
export interface SnapshotInfo {
  snapshotId: Number
  totalSize: Number
  addedFiles: Number
  removedFiles: Number
  addedRecords: Number
  removedRecord: Number
  addedFilesSize: Number
  removedFilesSize: Number
  totalFiles: Number
  totalRecords: Number
  operation: string
}
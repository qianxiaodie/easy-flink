export interface IHttpResponse {
  code: number
  msg: string
  result?: any
}

export interface IMenuItem {
  key: string
  label: string
  disabled?: boolean
  split?: boolean
  [propName: string]: any
}

export interface ITreeOption {
  key?: string
  label?: string
  parent?: ITreeOption | null
  children?: ITreeOption[]
  expanded?: boolean
  level?: number
  isFolder?: boolean
  disabled?: boolean
  [propName: string]: any
}

export interface IJob {
  jobId: number
  jobName: string
  product?: string
  jobStatus?: string
  jobType?: string
  startTime?: string
  clusterId: number | null
  clusterName?: string
  clusterType: string
  kernelId: number | null
  kernelName?: string
  imageId?: number | null
  imageName?: string
  queueId: number | null
  queueName?: string
  description?: string
  deployed?: boolean
  runtimeStatus?: string
  rawSql?: string
  runParameter?: any
  extRunParameter?: string
  parentId?: number
  creator?: string
  createTime?: string
  editor?: string
  updateTime?: string
  deployTime?: string
  tagIds?: number[]
  fileList?: ISimpleFile[]
  mainArgs?: string
  mainClass?: string
  flinkJarPath?: string
  flinkJarName?: string
  mammutKyb?: boolean
  applicationId?: string
  resourceDesc?: IResourceDesc
  [propName: string]: any
}

export interface IJobFolder {
  id: number
  folders: IJobFolder[]
  parentId?: number
  product?: string
  jobs: IJob[]
  leaf: boolean
  folderName: string
  createTime?: string
}

export interface IJobTreeNode extends IJob, IJobFolder {
  key?: string
  name?: string
  isFolder?: boolean
  children?: IJobTreeNode[]
}

export interface IVersion {
  jobId: number
  version: number
  fileList: ISimpleFile[]
  jobName: string
  runParameter: any
  extRunParameter: string
  updateTime: string
  editor: string
  rawSql?: string
  mainClass?: string
  mainArgs?: string
  flinkJarPath?: string
  flinkJarName?: string
  flinkJarResId?: number
  flinkJarMd5?: string
  clusterId: number
  clusterType: string
  imageId?: number
  kernelId: number
  queueId: number
  resourceDesc?: IResourceDesc
}

export interface IFile {
  key?: string
  label?: string
  isFolder?: boolean
  filename: string
  fileName?: string
  fullPath: string
  folderId: number
  id: number
  fileId?: number
  creator: string
  createTime: string
  fileSize: number
  leaf: boolean
  parentId: number
  product: string
  usage: boolean
  type: string
  description?: string
  [propName: string]: any
}

export interface ISimpleFile {
  id?: number
  name?: string
}

export interface IDebugFile {
  tableName: string
  filePath: string
}

export interface IDebugResult {
  tableName: string
  fields: string[]
  values: string[][]
}

export interface IFolder {
  id: number
  parentId: number
  folderName?: string
  product: string
  createTime: string
  leaf: boolean
  folders?: IFolder[]
  files?: IFile[]
  [propName: string]: any
}

export interface IResource extends IFolder, IFile {
  key?: string
  name?: string
  isFolder?: boolean
  children?: IResource[]
}

export interface IMetadataTable extends IFolder, IFile {
  key?: string
  name?: string
  isDb?: boolean
  isTable?: boolean
  isField?: boolean
  children?: IMetadataTable[]
}

export interface ITab {
  name: string
  label: string
  type?: string
  newicon?: boolean
}

export interface ITag {
  key?: string
  label?: string
  isFolder?: boolean
  name: string
  creator: string
  createTime: string
  product: string
  id: number
  tagIds: number[]
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

export interface IKernel {
  id: number
  kernelName?: string
  taskType: string
  imageName?: string
  kernelId?: number
}

export interface IQueue {
  id: number
  queueName: string
}

export interface IDetail {
  type: string
  info: IMetadata | ITag | IFile
}

export interface IMetadata {
  files?: any
  key?: string
  label?: string
  isFolder?: boolean
  name: string
  rawSql: string
  creator: string
  id: number
  createTime: string
  description: string
  metaType: string
  product: string
  updateTime: string
  editor: string
  tagIds: number[]
  dirType: string
  jobType: string
}

export interface IAlarmConfigMeta {
  id: number
  metricType: IAlarmConfigMetaItem
  cycle: IAlarmConfigMetaItem
  threshold: IAlarmConfigMetaItem
  evaluationType: IAlarmConfigMetaItem
  statisticsType: IAlarmConfigMetaItem
  operator: IAlarmConfigMetaItem
  alarmInterval: IAlarmConfigMetaItem
  suppressOperator: IAlarmConfigMetaItem
  suppressThreshold: IAlarmConfigMetaItem
  optional: boolean
}

export interface IAlarmConfigMetaItem {
  value: any[] | string
  unit: string
  type: string
  default: string
}

export interface IAlarmDetail {
  metricType: string
  cycleTime: string
  threshold: string
  cycleNum: string
  statisticsType: string
  operator: string
  alarmInterval: string
  suppressOperator: string
  suppressThreshold: string
}

export interface IOverviewState {
  clusterList: ICluster[]
  kernelList: IKernel[]
  queueList: IQueue[]
}

export interface IDevelopState {
  tabs: ITab[]
  activeTab: string
  jobList: IJobTreeNode[]
  jarList: IJobTreeNode[]
  tagList: ITag[]
  metadataList: any
  resourceList: IResource[]
  treeWidth: number
  leftWidth: number
  metadataTableList: IMetadataTable[]
}

export interface IJobCounter {
  normal: number
  abnormal: number
  failed: number
  stopped: number
  other: number
  total: number
}

export interface IOperationState {
  operationList: IJob[]
  jobCounter: IJobCounter
}

export interface IGlobalState {
  userId: string
  userName: string
  product: string
  developer: string
  team: string
  space: string
  roleID: string
  productId: number
  productList: IProduct[]
  token: string
  keepAliveList: string[]
  userConfig: IUserConfig
  host: any
  databaseKeepAliveList: string[]
}

export interface IUserConfig {
  env: string
  server: string
  mammutUrl: string
  database: any
}

export interface IProduct {
  productId: number
  product: string
  clusterIds?: string[]
  businessLine?: string
}

export interface IUser {
  fullName: string
  email: string
  nickName: string
}

export interface IPageInfo {
  pageIndex: number
  pageSize: number
  pageTotal: number
  objTotal: number
}

export interface IElkLog {
  containerId: string
  hostName: string
  id: string
  logLevel: string
  logType: string
  offset: number
  path: string
  timestamp: string
  message: string
  detailVisible?: boolean
  json?: string
  expanded?: boolean
  canExpand?: boolean
  indent?: boolean
}

export interface ILineChart {
  describe?: string
  chartJson: ILineChartInfo
}

export interface ILineChartInfo {
  title?: string
  unit: string
  ySeries: ILineChartSeries[]
  data: ILineChartData
}

interface ILineChartSeries {
  name: string
  label: string
}

interface ILineChartData {
  time: string
  [propName: string]: any
}

export interface IResourceDesc {
  resOverview: any
  topologyJson: ITopologyNodes
  changed: boolean
  confType: string
}

export interface ITopologyNodes {
  nodes: ITopologyNode[]
}

export interface IPosition {
  x: number
  y: number
}

export interface ITopologyNode {
  id: number
  type: string
  pact: string
  contents: string
  parallelism: number
  heap?: number | string
  'off-heap'?: number | string
  rocksdb?: number | string
  predecessors: ITopologyPredecessor[]
  level?: number
  edit?: boolean
  defaultValue?: boolean
}

export interface ITopologyPredecessor {
  id: number
  ship_strategy: string
  side: string
}

interface IDatasourceRole {
  users: string[]
  roles: string[]
}

export interface IDatasource {
  id: number
  name: string
  readable: boolean
  writeable: boolean
  operable: boolean
  status: string
  env: string
  info: any
  creator: string
  lastModify: string
  createTime: string
  updateTime: string
  createCatalog: boolean
  catalogName: string
  readAuth: IDatasourceRole
  writeAuth: IDatasourceRole
  editAuth: IDatasourceRole
  editable: boolean
  description: string
  db: string
  tag: string
  displayTag: string
  dsType: string
}

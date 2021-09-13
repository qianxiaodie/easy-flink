interface IStatistics {
  [propName: string]: IStatisticsConfig;
}

export interface IStatisticsConfig {
  title: string;
  api: string;
  options: any[];
}

export const config: IStatistics = {
  job: {
    title: '任务统计',
    api: 'getTaskStatistics',
    options: [{
      key: 'NEWTASK',
      label: '新建任务'
    }, {
      key: 'NEWRUNNINGTASK',
      label: '新运行任务'
    }, {
      key: 'TOTALTASK',
      label: '任务总数'
    }]
  }
};

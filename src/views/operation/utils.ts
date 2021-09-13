import { compare } from '@/utils';
import { cloneDeep, isArray } from 'lodash';

export const paginationSimulator = (function () {
  const includeWithKeyword = (item: any, keywordField: string[], keyword: string | string[], ignoreCase: boolean) => {
    return keywordField.some(field => {
      const msg = ignoreCase ? (item[field] && item[field].toLocaleLowerCase && item[field].toLocaleLowerCase()) || '' : item[field] || '';
      if (isArray(keyword)) {
        return msg && keyword.some(k => ignoreCase ? msg.includes(k.toLocaleLowerCase()) : msg.includes(k));
      }
      return msg && (ignoreCase ? msg.includes(keyword.toLocaleLowerCase()) : msg.includes(keyword));
    });
  };

  const includeWithFilter = (item: any, filterValue: any) => {
    const keys = Object.keys(filterValue);
    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];
      if (filterValue.hasOwnProperty(key) && filterValue[key] !== 'ALL') {
        if (key === 'tagIds') {
          const ids = item[key] || [];
          if (!ids.includes(filterValue[key])) {
            return false;
          }
        } else if (key === 'jobStatus') {
          const arr = ['RUNNING', 'STOPPED'];
          if ((filterValue[key] === 'OTHERS' && arr.includes(item[key])) || (filterValue[key] !== 'OTHERS' && filterValue[key] !== item[key])) {
            return false;
          }
        } else if (key === 'runtimeStatus') {
          const arr = ['NORMAL', 'ABNORMAL', 'FAILED'];
          if ((filterValue[key] === 'OTHERS' && arr.includes(item[key])) || (filterValue[key] !== 'OTHERS' && filterValue[key] !== item[key])) {
            return false;
          }
        } else if (filterValue[key] !== item[key]) {
          return false;
        }
      }
    }
    return true;
  };

  const filter = (item: any, filterValue: any) => {
    if (!Object.keys(filterValue).length || includeWithFilter(item, filterValue)) {
      return true;
    }
    return false;
  };

  const search = (item: any, keyword: string | string[], keywordField: string[], ignoreCase: boolean) => {
    if (!keyword || (isArray(keyword) && keyword.length === 0) || includeWithKeyword(item, keywordField, keyword, ignoreCase)) {
      return true;
    }
    return false;
  };

  const sort = (type: string, orderKey: string, list: any[]) => {
    list.sort((pre, cur) => {
      return type === 'desc' ? compare(cur[orderKey] || '', pre[orderKey] || '') : compare(pre[orderKey] || '', cur[orderKey] || '');
    });
  };

  return function (list: any[], options: any) {
    const { page, pageSize, keyword, keywordField, orderKey, orderValue, filterValue, ignoreCase = false } = Object.assign({
      page: 0,
      pageSize: 0,
      keyword: '',
      keywordField: [],
      orderKey: '',
      orderValue: {},
      filterValue: {}
    }, options);

    const cloneList = cloneDeep(list);
    let _list = cloneList.filter(item => filter(item, filterValue)).filter(item => search(item, keyword, keywordField, ignoreCase));

    if (orderKey) {
      const type = orderValue[orderKey] || '';
      if (type !== '') {
        sort(type, orderKey, _list);
      }
    }

    return {
      list: pageSize && page ? _list.slice((page - 1) * pageSize, page * pageSize) : _list,
      total: _list.length
    };
  };
}());

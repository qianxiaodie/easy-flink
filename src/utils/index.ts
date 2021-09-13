import Vue from 'vue';
import { ITreeOption, IFolder } from './types';
import { cloneDeep, isArray } from 'lodash';

export const isObject = (val: any) => {
  return Object.prototype.toString.call(val).toLowerCase() === '[object object]';
};

export const treeToArray = (data: ITreeOption[] = [], expandAll: boolean = false, expandedKeys: string[] = [], trackkey: string = 'key', parent: ITreeOption | null = null, level: number = 0): ITreeOption[] => {
  let tmp: ITreeOption[] = [];
  const cloneData: ITreeOption[] = JSON.parse(JSON.stringify(data));
  cloneData.forEach(record => {
    Vue.set(record, 'expanded', expandAll || expandedKeys.includes(record[trackkey]));
    const _level = level + 1;
    Vue.set(record, 'level', _level);
    if (parent) {
      Vue.set(record, 'parent', parent);
    }
    if (!record.isFolder && !!record.children) {
      Vue.set(record, 'isFolder', true);
    }
    tmp.push(record);
    if (record.children && record.children.length > 0) {
      const child = treeToArray(record.children, expandAll, expandedKeys, trackkey, record, _level);
      tmp = tmp.concat(child);
    }
    if (record.children && record.children.length === 0) {
      Vue.set(record, 'isEmpty', !!record.children);
    }
  });
  return tmp;
};

export const folderListToTree = (list: IFolder[], onlyFolder: boolean = false, excludeRoot: boolean = true): ITreeOption[] => {
  const func = (nodes: IFolder[] = [], pNodeName: string): ITreeOption[] => {
    let result: ITreeOption[] = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      if (!node.id) {
        continue;
      }
      const name = pNodeName ? pNodeName + node.folderName + ' / ' : node.folderName;
      const treeNode: ITreeOption = Object.assign({}, node, {
        key: node.id.toString(),
        name,
        isFolder: true,
        children: []
      });
      if (node.folders) {
        const child = func(node.folders, treeNode.name);
        treeNode.children = (treeNode.children || []).concat(child);
      }
      if (!onlyFolder && node.files && node.files.length) {
        node.files.forEach(file => {
          const n: ITreeOption = Object.assign({}, file, {
            key: (file.id || file.fileId || '').toString(),
            name: name ? name + file.fileName : file.fileName,
            folderName: file.fileName,
            isFolder: false
          });
          treeNode.children && treeNode.children.push(n);
        });
      }
      result.push(treeNode);
    }
    return result;
  };

  const tree = func(list, '/ ');
  return excludeRoot ? [{
    id: -1,
    name: '/',
    folderName: '/',
    isFolder: true,
    children: tree
  }] : tree;
};

// 筛选类型为jar的文件
export const jarfolderListToTree = (list: IFolder[], onlyFolder: boolean = false, excludeRoot: boolean = true): ITreeOption[] => {
  // 获取文件名后缀
  const fnGetExtension = (file) => {
    // 获得文件名
    let fileName = file.fileName;
    // 获得文件扩展名
    let fileExtension = fileName.split('.').pop();
    return fileExtension;
  }
  const func = (nodes: IFolder[] = [], pNodeName: string): ITreeOption[] => {
    let result: ITreeOption[] = [];
    for (let i = 0, len = nodes.length; i < len; i++) {
      const node = nodes[i];
      if (!node.id) {
        continue;
      }
      const name = pNodeName ? pNodeName + node.folderName + ' / ' : node.folderName;
      const treeNode: ITreeOption = Object.assign({}, node, {
        key: node.id.toString(),
        name,
        isFolder: true,
        children: []
      });
      if (node.folders) {
        const child = func(node.folders, treeNode.name);
        treeNode.children = (treeNode.children || []).concat(child);
      }
      if (!onlyFolder && node.files && node.files.length) {
        node.files.forEach(file => {
          const fileType = fnGetExtension(file)
          if (fileType === 'jar') {
            const n: ITreeOption = Object.assign({}, file, {
              key: (file.id || file.fileId || '').toString(),
              name: name ? name + file.fileName : file.fileName,
              folderName: file.fileName,
              isFolder: false
            });
            treeNode.children && treeNode.children.push(n);
          }
        });
      }
      result.push(treeNode);
    }
    return result;
  };

  const tree = func(list, '/ ');
  return excludeRoot ? [{
    id: -1,
    name: '/',
    folderName: '/',
    isFolder: true,
    children: tree
  }] : tree;
};

export const compare = (str1 = '', str2 = '') => {
  if (/^\d+\.?\d*$/g.test(str1) && /^\d+\.?\d*$/g.test(str2)) {
    return +str1 - +str2;
  } else {
    return ('' + str1).localeCompare(('' + str2));
  }
};

export const paginationSimulator = (function () {
  const includeWithKeyword = (item: any, keywordField: string[], keyword: string | string[]) => {
    return keywordField.some(field => {
      if (isArray(keyword)) {
        return item[field] && keyword.some(k => item[field].includes(k));
      }
      return item[field] && item[field].includes(keyword);
    });
  };

  const includeWithFilter = (item: any, filterValue: any) => {
    for (let key in filterValue) {
      if (filterValue.hasOwnProperty(key) && filterValue[key] !== 'ALL' && filterValue[key] !== item[key]) {
        return false;
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

  const search = (item: any, keyword: string | string[], keywordField: string[]) => {
    if (!keyword || (isArray(keyword) && keyword.length === 0) || includeWithKeyword(item, keywordField, keyword)) {
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
    const { page, pageSize, keyword, keywordField, orderKey, orderValue, filterValue } = Object.assign({
      page: 0,
      pageSize: 0,
      keyword: '',
      keywordField: [],
      orderKey: '',
      orderValue: {},
      filterValue: {}
    }, options);

    const cloneList = cloneDeep(list);
    let _list = cloneList.filter(item => filter(item, filterValue)).filter(item => search(item, keyword, keywordField));

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

export const isNotEmpty = (val: any) => {
  return val !== undefined && val !== null && val !== '';
};

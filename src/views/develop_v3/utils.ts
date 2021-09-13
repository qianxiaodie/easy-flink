import { cloneDeep } from 'lodash';
import SparkMD5 from 'spark-md5';
import { v1 } from 'uuid';
import { request } from '@/utils/request';

export const filterTreeNodes = (nodes: any[] = [], keywords: string, keywordLabel: string): any[] => {
  if (!keywords) {
    return nodes;
  }
  const filterNodes: any[] = [];

  const cloneNodes = cloneDeep(nodes);
  cloneNodes.forEach(node => {
    if (node[keywordLabel] && node[keywordLabel].toLowerCase().indexOf(keywords.toLowerCase()) !== -1) {
      filterNodes.push(node);
    } else {
      if (node.isFolder && node.children && node.children.length) {
        const child = filterTreeNodes(node.children, keywords, keywordLabel);
        if (child.length) {
          node.children = child;
          filterNodes.push(node);
        }
      }
    }
  });

  return filterNodes;
};

export const isTmNumberExist = (args: any) => {
  const name = (args && args.kernelName) || '';
  return args && args.clusterType && args.clusterType.toLocaleUpperCase() !== 'K8S' ? !name.includes('1.10') : true;
};

export const genFileMd5 = async (file: File, isComplete: Boolean = false): Promise<string> => {
  const fileReader = new FileReader();
  const spark = new SparkMD5();
  if (!isComplete && file.size > 1024 * 1024 * 10) {
    const newFile = file.slice(0, 1024 * 1024 * 10);
    fileReader.readAsBinaryString(newFile);
  } else {
    fileReader.readAsBinaryString(file);
  }
  return new Promise((resolve) => {
    fileReader.onload = (e) => {
      e.target && spark.appendBinary(e.target.result);
      resolve(spark.end());
    };
  });
};

export const genUUID = () => {
  return v1();
};

export const sliceFile = async (file: File, piece: number = 20 * 1024 * 1024) => {
  const totalSize = file.size;
  let start = 0;
  let end = start + piece;
  const chunks: any[] = [];
  let index = 0;
  const total = Math.ceil(totalSize / piece) || 1;
  while (start <= totalSize) {
    index++;
    const blob = file.slice(start, end); // 根据长度截取每次需要上传的数据
    const newFile = new File([blob], file.name, {
      lastModified: file.lastModified
    });
    const partMd5 = await genFileMd5(newFile, true);
    chunks.push({
      file: newFile,
      name: newFile.name,
      size: newFile.size,
      partMd5,
      index: index,
      total: total
    });
    start = end;
    end = start + piece;
  }
  return chunks;
};

export const getBlockMeta = async (md5: string, file: File): Promise<number[]> => {
  const meta: any = await request('getBlockMeta', {
    md5,
    fileName: file.name
  });
  return meta.blocksDone || [];
};

export const uploadBlock = async (md5: string, blocksDone: number[], file: File): Promise<any> => {
  const sliceFiles = await sliceFile(file);
  const blockFiles = sliceFiles.filter(f => !blocksDone.includes(f.index));
  const uuid = genUUID();
  if (blockFiles.length) {
    const promiseArr = blockFiles.map(f => {
      f.uuid = uuid;
      f.md5 = md5;
      return request('uploadBlock', f);
    });
    await Promise.all(promiseArr);
  }
  return {
    uuid,
    totalBlock: sliceFiles.length ? sliceFiles[0].total : 0
  };
};

export const notifyBlock = async (data: any, index: number = 1) => {
  try {
    return await request('notifyBlock', data);
  } catch (e) {
    if (index >= 3) {
      throw new Error('通知服务端合并文件失败');
    }
    await sleep(5000);
    return notifyBlock(data, ++index);
  }
};

export const sleep = async (time: number) => {
  return new Promise((resolve) => setTimeout(resolve, time));
};


export const STFormat = function(fmt = 'yyyy年MM月dd日 hh时mm分ss秒') {
  const thisa = new Date()
  const o = {
    'M+': thisa.getMonth() + 1,
    'd+': thisa.getDate(),
    'h+': thisa.getHours(),
    'm+': thisa.getMinutes(),
    's+': thisa.getSeconds(),
    'q+': Math.floor((thisa.getMonth() + 3) / 3),
    S: thisa.getMilliseconds(),
  };
  if (/(y+)/.test(fmt))
    fmt = fmt.replace(RegExp.$1, `${thisa.getFullYear()}`.substr(4 - RegExp.$1.length));
  for (const k in o)
    if (new RegExp(`(${k})`).test(fmt))
      fmt = fmt.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? o[k] : `00${o[k]}`.substr(`${o[k]}`.length)
      );
  return fmt;
};

import store from '@/store';

// const isDevelop = process.env.NODE_ENV === 'development';
const isDevelop = false;

const insertUserInfo = (formData: FormData) => {
  const userId = JSON.parse(<string>localStorage.getItem('userInfo')).ivUser
  const state = store.state as any;
  const { product } = state.global;
  formData.append('userId', userId);
  formData.append('product', product);
};

const DEFAULT_CONFIG = {
  headers: { 'Content-Type': 'multipart/form-data' },
  isFile: true,
  method: 'post'
};

export default {
  uploadDebugFile(data: any) {
    const { jobId, sourceFile, tableName } = data;
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('sourceFile', sourceFile);
    formData.append('tableName', tableName);
    insertUserInfo(formData);
    return Object.assign({}, DEFAULT_CONFIG, {
      url: isDevelop ? `jobs/${jobId}/debug/debug_data?isDevelop=true` : `jobs/${jobId}/debug/debug_data`,
      data: formData
    });
  },
  uploadJarFile(data: any) {
    const { jobId, file } = data;
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('file', file);
    insertUserInfo(formData);
    return Object.assign({}, DEFAULT_CONFIG, {
      url: isDevelop ? `jobs/${jobId}/jarfile?isDevelop=true` : `jobs/${jobId}/jarfile`,
      data: formData
    });
  },
  uploadResourceFile(data: any) {
    const { resFile, parentId, description } = data;
    const formData = new FormData();
    formData.append('resFile', resFile);
    formData.append('parentId', parentId);
    formData.append('description', description);
    insertUserInfo(formData);
    return Object.assign({}, DEFAULT_CONFIG, {
      url: isDevelop ? 'files?isDevelop=true' : 'files',
      data: formData
    });
  },
  getBlockMeta(data: any) {
    const { md5, fileName, blockSize = 20 * 1024 * 1024 } = data;
    return {
      url: 'blockfiles/blockMeta',
      method: 'get',
      data: { md5, fileName, blockSize }
    };
  },
  uploadBlock(data: any) {
    const { md5, uuid, file, size, name, index, total, partMd5 } = data;
    const formData = new FormData();
    formData.append('md5', md5);
    formData.append('uuId', uuid);
    formData.append('file', file);
    formData.append('size', size);
    formData.append('name', name);
    formData.append('index', index);
    formData.append('total', total);
    formData.append('partMd5', partMd5);
    insertUserInfo(formData);
    return Object.assign({}, DEFAULT_CONFIG, {
      url: isDevelop ? 'blockfiles/block?isDevelop=true' : 'blockfiles/block',
      data: formData
    });
  },
  notifyBlock(data: any) {
    const { md5, fileName, blockSize = 20 * 1024 * 1024, totalBlock, uuid } = data;
    return {
      url: `blockfiles/${md5}/finish`,
      method: 'get',
      data: { blockSize, totalBlock, uuid, fileName }
    };
  },
  addRecord(data: any) {
    const { fileName, filePath, fileSize, md5, description, parentId, parentName, overwrite } = data;
    return {
      url: 'files/file',
      method: 'post',
      data: { fileName, filePath, fileSize, md5, description, parentId, parentName, overwrite }
    };
  }
};

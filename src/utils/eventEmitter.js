/*
 * @Author: zhufeiyang
 * @Date: 2019-06-19 16:23:25
 * @Last Modified by: zhufeiyang
 * @Last Modified time: 2019-06-19 09:39:42
 * 事件处理封装
 */

import CustomEvent from 'custom-event';

const eventEmitter = {
  on: (event, callback) => {
    window.addEventListener(event, callback);
  },
  off: (event, callback) => {
    window.removeEventListener(event, callback);
  },
  emit: (event, detail) => {
    window.dispatchEvent(new CustomEvent(event, { detail }));
  }
};

export default eventEmitter;

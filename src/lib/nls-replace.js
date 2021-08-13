/* ---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *-------------------------------------------------------------------------------------------- */

import LOCALE_DATA from './zh-cn';

const _format = (message, args) => {
  let result;
  if (args.length === 0) {
    result = message;
  } else {
    result = String(message).replace(/\{(\d+)\}/g, function (match, rest) {
      const index = rest[0];
      return typeof args[index] !== 'undefined' ? args[index] : match;
    });
  }
  return result;
};

export const localize = (data, defaultMessage) => {
  const key = typeof data === 'object' ? data.key : data;
  const message = LOCALE_DATA[key] || defaultMessage || '';
  const args = [];
  for (let i = 3; i < arguments.length; i++) {
    args[i - 3] = arguments[i];
  }
  return _format(message, args);
};

export const loadMessageBundle = (file) => {
  return localize;
};

export const config = (opt) => {
  return loadMessageBundle;
};

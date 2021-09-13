import Vue from 'vue';

import { forIn, isString, isArray } from 'lodash';
import { MYSQL_RESERVE_WORD } from './constant';

import VeeValidate, { Validator } from 'vee-validate';
import zhCN from 'vee-validate/dist/locale/zh_CN';

Validator.localize(zhCN);

const config = {
  locale: 'zh_CN',
  events: 'input|blur',
  fieldsBagName: 'fieldBags',
};

Vue.use(VeeValidate, config);

const dictionary = {
  zh_CN: {
    messages: {
      required: (field: any, [name]: string[]) => (name || '') + '不能为空'
    }
  }
};

Validator.localize(dictionary);

interface ValidatorOption {
  text: any;
  option?: object;
  validator: Function;
  detect?: string;
}

interface ValidatorRule {
  [propName: string]: ValidatorOption;
}

/**
 * 自定义校验规则
 */
const validateMap: ValidatorRule = {
  gtThan0: {
    text: '大于0的整数',
    validator(val: string) {
      return !val || (parseInt(val) === +val && +val > 0);
    }
  },
  gtThanN1: {
    text: '-1或大于0的整数组成',
    validator(val: string) {
      return !val || (+val === -1 || (parseInt(val) === +val && +val > 0));
    }
  },
  gtThanWith0: {
    text: '大于等于0的整数',
    validator(val: string) {
      return !val || (parseInt(val) === +val && +val >= 0);
    }
  },
  beginWithLetter: {
    text: '以字母开头',
    validator(val: string) {
      return !val || /^[a-zA-Z]/.test(val);
    }
  },
  endWithLetterAndNumber: {
    text: '以字母或数字结尾',
    detect: 'blur',
    validator(val: string) {
      return !val || /[a-zA-Z0-9]$/.test(val);
    }
  },
  withoutMysql: {
    text: '不得使用MySQL保留字',
    detect: 'blur',
    validator(val: string) {
      return !MYSQL_RESERVE_WORD.includes(val.toUpperCase());
    }
  },
  includeWithWords: {
    text: '以字母、数字或下划线组成',
    validator(val: string) {
      return !val || /^[a-zA-Z0-9_]*$/.test(val);
    }
  },
  phoneNumber: {
    text: '手机号码为11位数字',
    validator(val: string) {
      return /^\d{11}$/.test(val);
    }
  },
  emailValidator: {
    text: '请输入正确的邮箱地址',
    validator(val: string) {
      return /^[a-zA-Z0-9_-]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]{2,})+$/.test(val);
    }
  },
  timeValidator: {
    text: '请输入正确格式的时间表达式',
    validator(val: string) {
      return /^[^\s]+\s[^\s]+\s[^\s]+\s[^\s]+\s[^\s]+\s[^\s]+$/.test(val);
    }
  },
  nameValidator: {
    text: '此字段只能包含中文、字母、数字、-、_',
    validator(val: string) {
      return /^[\u4e00-\u9fa5a-zA-Z0-9_-]*$/.test(val);
    }
  },
  strLengthValidator: {
    text: '字段长度不能过长',
    validator(val: string) {
      const r = /^[\u4E00-\u9FA5]{0,}$/;
      let getValue = () => {
        let position;
        let perFifty = 0;
        let wordsLength = 0;
        for (let i = 0; i < val.length; i++) {
          if (r.test(val[i])) {
            if (perFifty < 51) {
              perFifty += 3;
              position = i;
            }
            wordsLength += 1;
          } else if (perFifty < 51) {
            perFifty += 1;
            position = i;
          }
        }
        return [wordsLength, position];
      };
      return val.length < 50 && val.length - getValue()[0] + getValue()[0] * 3 < 50;
    }
  },
  diffWithOthers: {
    text: (name: string, { label }: any) => `${label}已存在`,
    validator(val: string, { key, arr }: any) {
      return !arr.some((item: any) => key ? item[key] === val : item === val);
    }
  },
  twoDecimalValidator: {
    text: '只支持两位小数',
    validator(val: string = '') {
      val = '' + val;
      const arr = val.split('.');
      return arr.length <= 1 || arr[1].length <= 2;
    }
  },
  moreThan0: {
    text: '请输入大于 0 的数值',
    validator(val: string) {
      return !val || +val > 0;
    }
  }
};

forIn(validateMap, ({ text, option, validator, detect }, key) => {
  Validator.extend(key, {
    getMessage: isString(text) ? () => text : text,
    validate(val, args: any) {
      if (detect === 'blur') {
        const name = isArray(args) ? args[0] : args && args.name;
        const elm = document.activeElement as any;
        if (elm && elm.name === name) {
          return true;
        }
      }
      return validator(val, args);
    }
  }, {
    ...(option || {})
  });
});

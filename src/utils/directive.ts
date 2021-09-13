import Vue from 'vue';

// 超过长度限制输入 中文作为三个字符
Vue.directive('maxlength', {
  bind(el, binding, vnode, oldVnode): void {
    const { value } = binding;
    if (!value) {
      return;
    }
    const { context } = oldVnode;
    const id = +new Date();
    const elm = el as HTMLInputElement;
    console.log(elm,"elm")
    const r = /^[\u4E00-\u9FA5]{0,}$/;
    let getValue = () => {
      let position;
      let perFifty = 0;
      let wordsLength = 0;
      for (let i = 0; i < elm.value.length; i++) {
        if (r.test(elm.value[i])) {
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
    let listener = () => {
      if (elm.value.length > value || elm.value.length - getValue()[0] + getValue()[0] * 3 > value) {
        if (getValue()[0] === 0) {
          elm.value = elm.value.slice(0, value);
        } else {
          elm.value = elm.value.slice(0, getValue()[1]);
        }
        (<any>window).InputEvent && el.dispatchEvent(new (<any>window).InputEvent('input'));
        context && context.errors.add({
          field: elm.getAttribute('name'),
          msg: `不得超过${value}个字符`
        });
      } else {
        context && context.errors.removeById(id.toString());
      }
    };
    elm.addEventListener('keyup', listener);
    elm.addEventListener('blur', () => {
      context && context.errors.removeById(id);
    });
  }
});

// 只能输入整数
Vue.directive('number', {
  bind(el, binding, vnode): void {
    const { max, min, decimal } = binding.value || {} as any;
    const elm = el as HTMLInputElement;
    vnode.inputNumberHandler = () => {
      let value = elm.value;

      if (value === undefined || value === null || value === '') {
        return;
      }

      if (decimal) {
        value = elm.value.replace(/[^\d^.]/g, '');
      } else {
        value = elm.value.replace(/[^\d^-]/g, '');
      }
      if (max && +elm.value > max) {
        value = max;
      }
      if (min && +elm.value < min) {
        value = min;
      }

      if (elm.value !== value) {
        elm.value = value;
        (<any>window).InputEvent && el.dispatchEvent(new (<any>window).InputEvent('input'));
      }
    };

    el.addEventListener('input', vnode.inputNumberHandler);
  },
  unbind(el, binding, vnode): void {
    el.removeEventListener('input', vnode.inputNumberHandler);
  }
});

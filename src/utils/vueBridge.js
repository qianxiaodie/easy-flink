import waitElement from './waitElement';

const defaultOpts = {
  // required opts
  Vue: null,
  appOptions: null,
  template: null
};

export default function singleSpaVue(userOpts) {
  if (typeof userOpts !== 'object') {
    throw new Error(`single-spa-vue requires a configuration object`);
  }

  const opts = {
    ...defaultOpts,
    ...userOpts
  };

  if (!opts.Vue) {
    throw new Error('single-spa-vuejs must be passed opts.Vue');
  }

  if (!opts.appOptions) {
    throw new Error('single-spa-vuejs must be passed opts.appOptions');
  }

  // Just a shared object to store the mounted object state
  let mountedInstances = {};

  return {
    bootstrap: bootstrap.bind(null, opts, mountedInstances),
    mount: mount.bind(null, opts, mountedInstances),
    unmount: unmount.bind(null, opts, mountedInstances),
    update: update.bind(null, opts, mountedInstances)
  };
}

function getRootDomEl(domElementGetter, _ref) {
  var _ref$maxWaitingTime = _ref.maxWaitingTime;
  var maxWaitingTime = _ref$maxWaitingTime === void 0 ? 3000 : _ref$maxWaitingTime;
  var el = domElementGetter();

  if (!el) {
    throw new Error("".concat(ERROR_PREFIX, ": domElementGetter function did not return a valid dom element"));
  } else if (typeof el === 'string') {
    // 允许直接写selector
    return waitElement(el, maxWaitingTime);
  }
  return el;
}

function chooseDomElementGetter(opts, props) {
  var finalProps = props && props.customProps ? props.customProps : props;

  if (props.domElement) {
    return function () {
      return finalProps.domElement;
    };
  } else if (finalProps.domElementGetter) {
    return finalProps.domElementGetter;
  }

  return opts.domElementGetter;
}

function isPromise(p) {
  return p && typeof p.then === 'function';
}

// single-spa-vue@>=2 always REPLACES the `el` instead of appending to it.
// We want domEl to stick around and not be replaced. So we tell Vue to mount
// into a container div inside of the main domEl
function addMountElem(rootEle, appOptions, elemId) {
  if (!rootEle.querySelector('.single-spa-container')) {
    const singleSpaContainer = document.createElement('div');
    singleSpaContainer.className = 'single-spa-container';
    rootEle.appendChild(singleSpaContainer);
  }
  appOptions.el = `${elemId} .single-spa-container`;
}

// render vue instance
function rederVueInstance(opts, mountedInstances, props, appOptions) {
  if (!appOptions.render && !appOptions.template && opts.rootComponent) {
    appOptions.render = (h) => h(opts.rootComponent);
  }

  if (!appOptions.data) {
    appOptions.data = {};
  }

  appOptions.data = { ...appOptions.data, ...props };
  mountedInstances.instance = new opts.Vue(appOptions);
  if (mountedInstances.instance.bind) {
    mountedInstances.instance = mountedInstances.instance.bind(mountedInstances.instance);
  }
}

function bootstrap(opts) {
  if (opts.loadRootComponent) {
    return opts.loadRootComponent().then(root => opts.rootComponent = root);
  } else {
    return Promise.resolve();
  }
}

function mount(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    let appOptions = { ...opts.appOptions };
    const domElementGetter = chooseDomElementGetter(opts, props);
    if (!domElementGetter) {
      throw new Error("Cannot mount vue application '".concat(props.appName || props.name, "' without a domElementGetter provided in either opts or props"));
    }
    const elemId = domElementGetter();
    const domElement = getRootDomEl(domElementGetter, {
      maxWaitingTime: props.maxWaitingTime
    });

    if (isPromise(domElement)) {
      domElement.then(function(elem) {
        if (elem) {
          addMountElem(elem, appOptions, elemId);
          mountedInstances.domEl = elem;
          rederVueInstance(opts, mountedInstances, props, appOptions);
        }
      });
    } else {
      addMountElem(elem, appOptions, elemId);
      mountedInstances.domEl = elem;
      rederVueInstance(opts, mountedInstances, props, appOptions);
    }
  });
}

function update(opts, mountedInstances, props) {
  return Promise.resolve().then(() => {
    const data = {
      ...(opts.appOptions.data || {}),
      ...props
    };
    for (let prop in data) {
      mountedInstances.instance[prop] = data[prop];
    }
  });
}

function unmount(opts, mountedInstances) {
  return Promise
    .resolve()
    .then(() => {
      mountedInstances.instance.$destroy();
      mountedInstances.instance.$el.innerHTML = '';
      delete mountedInstances.instance;

      if (mountedInstances.domEl) {
        mountedInstances.domEl.innerHTML = '';
        delete mountedInstances.domEl;
      }
    });
}

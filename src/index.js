const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const debounce = (fn, ms = 0) => ((timeoutId = 0) => (...args) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => fn(...args), ms);
})();

const createStateManager = lastState => cb => (state) => {
  if (!state) {
    return cb(lastState);
  }
  lastState = state;
  return cb(state);
};

const createChilds = (childs = {}) => ({
  add: (name, value) => {
    childs[name] = value;
  },
  map: cb => Object.keys(childs).reduce((memo, key) => {
    memo[key] = cb(childs[key], key);
    return memo;
  }, {}),
  delete: (key) => {
    delete childs[key];
  },
  clear: () => {
    childs = {};
  },
  update: (newChilds = {}) => {
    childs = newChilds;
  },
});

const createNext = childs => (state, forceUnmount = false) => {
  const listShowChilds = [];
  const newChild = childs.map(([child, options = { show: false }]) => {
    const { manifest, extraArgument } = child;

    if (forceUnmount) {
      options.show = !forceUnmount;
    }

    if (child.isShow(state) && !options.show) {
      listShowChilds.push(child);
      return [child, { show: true }];
    }

    if (!child.isShow(state) && options.show) {
      manifest.unmount(state, extraArgument);
      return [child, { show: false }];
    }

    return [child, { show: options.show }];
  });

  listShowChilds.forEach((child) => {
    const { manifest, extraArgument } = child;
    compose(
      manifest.mount,
      // memoization,
      manifest.default,
    )(state, extraArgument);
  });

  childs.update(newChild);
  return newChild;
};

export default (observer) => {
  const childs = createChilds();

  const next = compose(
    createStateManager(),
    debounce,
    createNext,
  )(childs);

  const observerResult = observer(next);

  const embla = (cb = () => {}) => {
    cb(observerResult);
    next(void 0, true);
    childs.clear();
  };

  embla.child = (name, manifest, isShow, extraArgument) => next(void childs.add(name, [{ manifest, isShow, extraArgument }]));
  embla.removeChild = childs.delete;

  return embla;
};

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

const createChilds = (children = {}) => ({
  add: (name, value) => {
    children[name] = value;
  },
  map: cb => Object.keys(children).reduce((memo, key) => {
    memo[key] = cb(children[key], key);
    return memo;
  }, {}),
  clear: () => {
    children = {};
  },
  update: (newChildren = {}) => {
    children = newChildren;
  },
});

const createNext = children => (state, forceUnmount = false) => {
  const listShowChildren = [];
  const newChild = children.map(([child, options = { show: false, disable: false }]) => {
    const { manifest, extraArgument } = child;

    if (forceUnmount) {
      options.show = !forceUnmount;
    }

    if (!options.disable && child.isShow(state) && !options.show) {
      listShowChildren.push(child);
      return [child, { show: true }];
    }

    if (!options.disable && !child.isShow(state) && options.show) {
      manifest.unmount(state, extraArgument);
      return [child, { show: false }];
    }

    return [child, { show: options.show }];
  });

  listShowChildren.forEach((child) => {
    const { manifest, extraArgument } = child;
    compose(
      manifest.mount,
      // memoization,
      manifest.default,
    )(state, extraArgument);
  });

  children.update(newChild);
  return newChild;
};

export default (observer) => {
  const children = createChilds();

  const next = compose(
    createStateManager(),
    debounce,
    createNext,
  )(children);

  const observerResult = observer(next);

  const embla = (cb = () => {}) => {
    cb(observerResult);
    next(void 0, true);
    children.clear();
  };

  embla.child = (name, manifest, isShow, extraArgument) => next(void children.add(name, [{ manifest, isShow, extraArgument }]));

  return embla;
};

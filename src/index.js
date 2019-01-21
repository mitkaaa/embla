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

const createChilds = (children = []) => ({
  add: (value) => {
    children = [...children, value];
  },
  map: cb => children.map(cb),
  clear: () => {
    children = [];
  },
  update: (newChildren = []) => {
    children = newChildren;
  },
});

const createNext = children => (state) => {
  const listShowChildren = [];
  const newChild = children.map(([child, options = { show: false }]) => {
    const { manifest, extraArgument } = child;

    if (child.isShow(state) && !options.show) {
      listShowChildren.push(child);
      return [child, { show: true }];
    }

    if (!child.isShow(state) && options.show) {
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
    children.clear();
  };

  embla.child = (manifest, isShow, extraArgument) => next(void children.add([{ manifest, isShow, extraArgument }]));

  return embla;
};

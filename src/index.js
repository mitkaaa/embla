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
  get: key => children[key],
  set: (key, value) => {
    children[key] = value;
  },
});

const mount = state => children => children.map(([child, options]) => {
  const { manifest, extraArgument } = child;

  if (options.mount) {
    compose(
      manifest.mount,
      manifest.default,
    )(state, extraArgument);
    return [
      child,
      {
        ...options,
        mount: false,
      },
    ];
  }

  return [child, options];
});

const unmount = state => children => children.map(([child, options]) => {
  const { manifest, extraArgument } = child;

  if (options.unmount) {
    manifest.unmount(state, extraArgument);
    return [
      child,
      {
        ...options,
        unmount: false,
      },
    ];
  }

  return [child, options];
});

const prepareChildren = (next, state) => children => children.map(
  (
    [
      child,
      options = {
        show: false,
        mount: false,
        unmount: false,
      },
    ],
    key,
  ) => {
    if (typeof child.manifest === 'function') {
      child.manifest = child.manifest(
        child.extraArgument,
      );
      if (typeof child.manifest.then === 'function') {
        child.manifest.then((manifest) => {
          const updateChild = {
            manifest,
            isShow: child.isShow,
          };
          children.set(key, [updateChild, options]);
          next();
        });
        return [child, options];
      }
    }

    if (!child.isShow(state) && options.show) {
      return [
        child,
        { ...options, show: false, unmount: true },
      ];
    }

    if (child.isShow(state) && !options.show) {
      return [
        child,
        { ...options, show: true, mount: true },
      ];
    }

    return [child, options];
  },
);

const createNext = next => children => state => compose(
  children.update,
  mount(state),
  unmount(state),
  prepareChildren(next, state),
)(children);

export default (observer) => {
  const children = createChilds();

  const next = compose(
    createStateManager(),
    debounce,
    createNext(() => next()),
  )(children);

  const observerResult = observer(next);

  const embla = (cb = () => {}) => {
    cb(observerResult);
    children.clear();
  };

  embla.child = (manifest, isShow, extraArgument) => next(
    void children.add([
      {
        manifest,
        isShow,
        extraArgument,
      },
    ]),
  );

  return embla;
};

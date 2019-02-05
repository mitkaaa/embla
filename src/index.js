const compose = (...fns) => fns.reduce((f, g) => (...args) => f(g(...args)));
const debounce = (fn, ms = 0) =>
  ((timeoutId = 0) => (...args) => {
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

const createChilds = (children = []) => {
  const childrenInstance = {
    add: (value) => {
      children = [...children, value];
    },
    withMutations: cb => childrenInstance.update(cb(children)),
    clear: () => {
      children = [];
    },
    update: (newChildren = []) => {
      children = [...newChildren];
      return childrenInstance;
    },
    get: key => children[key],
    set: (key, value) => {
      children[key] = value;
      return childrenInstance.update(children);
    }
  };
  return childrenInstance;
};

const mount = (state, next) => childrenInstance =>
  childrenInstance.withMutations(children =>
    children.map(([child, options], key) => {
      const { extraArgument } = child;
      let { manifest } = child;

      if (typeof manifest === 'function' && options.mount) {
        manifest = manifest(extraArgument);
      }

      if (typeof manifest.then === 'function') {
        manifest.then((childManifest) => {
          const updateChild = {
            manifest: childManifest,
            isShow: child.isShow,
            extraArgument
          };
          childrenInstance.set(key, [updateChild, options]);
          next();
        });

        return [child, options];
      }

      if (!manifest.mount || !manifest.default || !options.mount) {
        return [child, options];
      }

      manifest.mount(manifest.default(state, extraArgument), extraArgument);

      return [
        child,
        {
          ...options,
          mount: false
        }
      ];
    }));

const unmount = state => childrenInstance =>
  childrenInstance.withMutations(children =>
    children.map(([child, options]) => {
      const { manifest, extraArgument } = child;

      if (typeof manifest.unmount === 'function' && options.unmount) {
        manifest.unmount(state, extraArgument);
        return [
          child,
          {
            ...options,
            unmount: false
          }
        ];
      }

      return [child, options];
    }));

const prepareChildren = (next, state) => childrenInstance =>
  childrenInstance.withMutations(children =>
    children.map(([child, options = { show: false, mount: false, unmount: false }]) => {
      if (!child.isShow(state) && options.show) {
        return [
          child,
          {
            ...options,
            show: false,
            unmount: true
          }
        ];
      }

      if (child.isShow(state) && !options.show) {
        return [
          child,
          {
            ...options,
            show: true,
            mount: true
          }
        ];
      }

      return [child, options];
    }));

const createNext = next => children => state =>
  compose(
    mount(state, next),
    unmount(state),
    prepareChildren(next, state)
  )(children);

export default (observer) => {
  if (typeof observer !== 'function') {
    throw new Error(
      'When creating an instance, the state change function is not defined. createEmbla(cb => {...})'
    );
  }
  const children = createChilds();

  const next = compose(
    createStateManager(),
    debounce,
    createNext(() => next())
  )(children);

  const observerResult = observer(next);

  const embla = (cb = () => {}) => {
    cb(observerResult);
    children.clear();
  };

  embla.child = (manifest, isShow, extraArgument) =>
    next(
      void children.add([
        {
          manifest,
          isShow,
          extraArgument
        }
      ])
    );

  return embla;
};

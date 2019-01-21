(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.embla = factory());
}(this, (function () { 'use strict';

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

  var index = (observer) => {
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

    embla.child = (manifest, isShow, extraArgument) => next(void children.add([{ manifest, isShow, extraArgument }]));

    return embla;
  };

  return index;

})));

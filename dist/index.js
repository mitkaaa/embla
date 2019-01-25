(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.embla = factory());
}(this, (function () { 'use strict';

  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value: value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }

    return obj;
  }

  function _objectSpread(target) {
    for (var i = 1; i < arguments.length; i++) {
      var source = arguments[i] != null ? arguments[i] : {};
      var ownKeys = Object.keys(source);

      if (typeof Object.getOwnPropertySymbols === 'function') {
        ownKeys = ownKeys.concat(Object.getOwnPropertySymbols(source).filter(function (sym) {
          return Object.getOwnPropertyDescriptor(source, sym).enumerable;
        }));
      }

      ownKeys.forEach(function (key) {
        _defineProperty(target, key, source[key]);
      });
    }

    return target;
  }

  function _slicedToArray(arr, i) {
    return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest();
  }

  function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
  }

  function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = new Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    }
  }

  function _arrayWithHoles(arr) {
    if (Array.isArray(arr)) return arr;
  }

  function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
  }

  function _iterableToArrayLimit(arr, i) {
    var _arr = [];
    var _n = true;
    var _d = false;
    var _e = undefined;

    try {
      for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) {
        _arr.push(_s.value);

        if (i && _arr.length === i) break;
      }
    } catch (err) {
      _d = true;
      _e = err;
    } finally {
      try {
        if (!_n && _i["return"] != null) _i["return"]();
      } finally {
        if (_d) throw _e;
      }
    }

    return _arr;
  }

  function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
  }

  function _nonIterableRest() {
    throw new TypeError("Invalid attempt to destructure non-iterable instance");
  }

  var compose = function compose() {
    for (var _len = arguments.length, fns = new Array(_len), _key = 0; _key < _len; _key++) {
      fns[_key] = arguments[_key];
    }

    return fns.reduce(function (f, g) {
      return function () {
        return f(g.apply(void 0, arguments));
      };
    });
  };

  var debounce = function debounce(fn) {
    var ms = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
    return function () {
      var timeoutId = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      return function () {
        for (var _len2 = arguments.length, args = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
          args[_key2] = arguments[_key2];
        }

        clearTimeout(timeoutId);
        timeoutId = setTimeout(function () {
          return fn.apply(void 0, args);
        }, ms);
      };
    }();
  };

  var createStateManager = function createStateManager(lastState) {
    return function (cb) {
      return function (state) {
        if (!state) {
          return cb(lastState);
        }

        lastState = state;
        return cb(state);
      };
    };
  };

  var createChilds = function createChilds() {
    var children = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
    return {
      add: function add(value) {
        children = [].concat(_toConsumableArray(children), [value]);
      },
      map: function map(cb) {
        return children.map(cb);
      },
      clear: function clear() {
        children = [];
      },
      update: function update() {
        var newChildren = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : [];
        children = newChildren;
      },
      get: function get(key) {
        return children[key];
      },
      set: function set(key, value) {
        children[key] = value;
      }
    };
  };

  var mount = function mount(state) {
    return function (children) {
      return children.map(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2),
            child = _ref2[0],
            options = _ref2[1];

        var manifest = child.manifest,
            extraArgument = child.extraArgument;

        if (options.mount) {
          compose(manifest.mount, manifest.default)(state, extraArgument);
          return [child, _objectSpread({}, options, {
            mount: false
          })];
        }

        return [child, options];
      });
    };
  };

  var unmount = function unmount(state) {
    return function (children) {
      return children.map(function (_ref3) {
        var _ref4 = _slicedToArray(_ref3, 2),
            child = _ref4[0],
            options = _ref4[1];

        var manifest = child.manifest,
            extraArgument = child.extraArgument;

        if (options.unmount) {
          manifest.unmount(state, extraArgument);
          return [child, _objectSpread({}, options, {
            unmount: false
          })];
        }

        return [child, options];
      });
    };
  };

  var prepareChildren = function prepareChildren(next, state) {
    return function (children) {
      return children.map(function (_ref5, key) {
        var _ref6 = _slicedToArray(_ref5, 2),
            child = _ref6[0],
            _ref6$ = _ref6[1],
            options = _ref6$ === void 0 ? {
          show: false,
          mount: false,
          unmount: false
        } : _ref6$;

        if (typeof child.manifest === 'function') {
          child.manifest = child.manifest(child.extraArgument);

          if (typeof child.manifest.then === 'function') {
            child.manifest.then(function (manifest) {
              var updateChild = {
                manifest: manifest,
                isShow: child.isShow
              };
              children.set(key, [updateChild, options]);
              next();
            });
            return [child, options];
          }
        }

        if (!child.isShow(state) && options.show) {
          return [child, _objectSpread({}, options, {
            show: false,
            unmount: true
          })];
        }

        if (child.isShow(state) && !options.show) {
          return [child, _objectSpread({}, options, {
            show: true,
            mount: true
          })];
        }

        return [child, options];
      });
    };
  };

  var createNext = function createNext(next) {
    return function (children) {
      return function (state) {
        return compose(children.update, mount(state), unmount(state), prepareChildren(next, state))(children);
      };
    };
  };

  var index = (function (observer) {
    var children = createChilds();
    var next = compose(createStateManager(), debounce, createNext(function () {
      return next();
    }))(children);
    var observerResult = observer(next);

    var embla = function embla() {
      var cb = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : function () {};
      cb(observerResult);
      children.clear();
    };

    embla.child = function (manifest, isShow, extraArgument) {
      return next(void children.add([{
        manifest: manifest,
        isShow: isShow,
        extraArgument: extraArgument
      }]));
    };

    return embla;
  });

  return index;

})));

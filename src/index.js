const debounce = (fn, ms = 0) => ((timeoutId = 0) => (...args) => {
  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => fn(args), ms);
})();

export default () => {
  const childs = new Map();

  const caller = debounce(() => {
    console.log('wow', { childs });
    // childs.forEach((name) => {});
  });

  return {
    child: (name, callback, isShow, extraArgument) => caller(childs.set(name, { callback, isShow, extraArgument })),
    removeChild: name => childs.delete(name),
  };
};

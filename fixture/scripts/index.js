// Observer!
const getHashLocation = (hash = '') => {
  const path = hash.match(/#(.*)/);
  if (path) {
    return path[1];
  }
  return void 0;
};
const embla = window.embla((next) => {
  next(getHashLocation(window.location.hash) || 'home');
  window.addEventListener('popstate', () => next(getHashLocation(window.location.hash)));
});

// UTILS
const clearNode = (element) => {
  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
};
const mountingElement = document.getElementById('app');
const mountingMenuElement = document.getElementById('menu');
const mount = mElement => element => mElement.appendChild(element);
const unmount = mElement => () => clearNode(mElement);
// UTILS END

embla.child(
  {
    mount: mount(mountingElement),
    unmount: unmount(mountingElement),
    default: (path) => {
      const div = document.createElement('div');
      div.innerHTML = `<h1>About</h1> hash: #${path}`;
      return div;
    }
  },
  hash => hash === 'about'
);

embla.child(
  {
    mount: mount(mountingMenuElement),
    unmount: unmount(mountingMenuElement),
    default: () => {
      const div = document.createElement('div');
      div.innerHTML = '<a href="#home">Home</a> | <a href="#about">About</a>';
      return div;
    }
  },
  () => true
);

embla.child(
  {
    mount: mount(mountingElement),
    unmount: unmount(mountingElement),
    default: (path) => {
      const div = document.createElement('div');
      div.innerHTML = `<h1>Home</h1> hash: #${path}`;
      return div;
    }
  },
  hash => hash === 'home'
);

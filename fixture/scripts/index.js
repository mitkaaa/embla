const embla = window.embla();

embla.child(
  'menu',
  () => {
    const div = document.createElement('div');
    div.text = 'Menu';
    document.getElementById('menu').appendChild(div);
  },
  () => true,
);

embla.child(
  'app',
  () => {
    const div = document.createElement('div');
    div.text = 'App';
    document.getElementById('app').appendChild(div);
  },
  () => true,
);

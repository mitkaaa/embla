const server = require('rollup-plugin-server');

const basisConfig = require('./basis');

module.exports = {
  ...basisConfig,

  plugins: [server(['fixture', 'dist'])],
};

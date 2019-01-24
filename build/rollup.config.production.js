const { uglify } = require('rollup-plugin-uglify');

const basisConfig = require('./basis');

const plugins = basisConfig.plugins || [];

module.exports = {
  ...basisConfig,
  plugins: [uglify()],
};

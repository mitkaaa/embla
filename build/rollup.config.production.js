// const { uglify } = require('rollup-plugin-uglify');
const babel = require('rollup-plugin-babel');

const basisConfig = require('./basis');

const plugins = basisConfig.plugins || [];

module.exports = {
  ...basisConfig,
  plugins: [
    ...plugins,
    babel({ exclude: 'node_modules/**' }),
    // uglify(),
  ],
};

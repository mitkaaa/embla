module.exports = process.env.NODE_ENV === 'production'
  ? require('./rollup.config.production')
  : require('./rollup.config.dev');

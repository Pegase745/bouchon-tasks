// bouchon-tasks/all.fixture.js

require('babel-core/register');
require('babel-polyfill');

module.exports = {
  default: [
    require('./tasks').default,
  ],
};

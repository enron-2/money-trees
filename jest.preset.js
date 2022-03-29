const nxPreset = require('@nrwl/jest/preset');

module.exports = {
  ...nxPreset,
  coverageReporters: [...nxPreset.coverageReporters, 'clover', 'json', 'lcov'],
};

export default {
  transform: {},
  moduleNameMapper: {
    '^(\\.{1,2}/.*)\\.js$': '$1',
  },
  testEnvironment: 'node',
  testMatch: ['**/tests/unit/**/*.test.js'],
  moduleFileExtensions: ['js', 'mjs'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
};

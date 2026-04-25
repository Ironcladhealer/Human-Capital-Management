module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  // Add this block to ignore configuration files
  coveragePathIgnorePatterns: [
    '/node_modules/',
    '.*\\.module\\.ts$',
    'main\\.ts$',
    '.*\\.entity\\.ts$'
  ],
};
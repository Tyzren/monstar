const { _moduleAliases } = require('./package.json');

/**
 * Converts aliases into Jest regex
 *
 * E.g., "@models" -> "^@models/(.*)$" -> "<rootDir>/models/$1"
 */
const makeModuleNameMapper = (aliases) => {
  const mapper = {};

  for (const alias in aliases) {
    const path = aliases[alias];

    const aliasRegex = `^${alias}/(.*)$`;

    const pathPattern = `<rootDir>/${path.replace(/^\.\//, '')}/$1`;

    mapper[aliasRegex] = pathPattern;
  }
  return mapper;
};

module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  moduleNameMapper: makeModuleNameMapper(_moduleAliases),
  setupFilesAfterEnv: ['<rootDir>/tests/jest.setup.js'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
    '^.+\\.js$': 'ts-jest',
  },
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
  testMatch: ['**/tests/**/*.test.[jt]s'],
  globals: {
    'ts-jest': {
      tsconfig: {
        allowJs: true,
        checkJs: false,
      },
    },
  },
};

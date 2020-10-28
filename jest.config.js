const { pathsToModuleNameMapper } = require('ts-jest/utils')
// In the following statement, replace `./tsconfig` with the path to your `tsconfig` file
// which contains the path mapping (ie the `compilerOptions.paths` option):
const { compilerOptions } = require('./tsconfig.test')

module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    modulePathIgnorePatterns: ['dist'],
    testPathIgnorePatterns: ['node_modules', 'dist'],
    globals: {
        'ts-jest': {
            tsconfig: 'tsconfig.test.json',
        },
    },
    moduleNameMapper: pathsToModuleNameMapper(
        {
            '@etrigan/core': ['./packages/core'],
            '@etrigan/config': ['./packages/config'],
            '@etrigan/feature-toggles-client': ['./packages/feature-toggles-client'],
        },
        { prefix: '<rootDir>/' },
    ),
}

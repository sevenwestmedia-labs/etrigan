# @etrigan/config-driver-ssm

## 2.0.1

### Patch Changes

- 0776e7f: # Fix breaking change to the key names returned

  Version 2.0.0 included a breaking change to the key names returned by `@etrigan/config-driver-ssm`.

  This version reverts the change, so it's now the same as the values returned by 1.0.0

## 2.0.0

### Major Changes

- 4610882: Changed use of getparamsbypath to getparams to allow a higher number of calls to parameter store

## 1.0.0

### Major Changes

- e83f6e0: Upgraded tslib to next major, requires TypeScript >3.9

## 0.2.0

### Minor Changes

- c066efb: Remove leading / when specifying SSM path (breaking)

## 0.1.1

### Patch Changes

- 4538db2: Exclude tsconfig from npm packages which cause consumption issues

## 0.1.0

### Minor Changes

- b049990: Initial release

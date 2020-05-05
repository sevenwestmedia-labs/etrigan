# @etrigan/logging

## 2.0.1

### Patch Changes

- a047984: Removed deprecation warning from deep import of uuid

## 2.0.0

### Major Changes

- 3c11373: Removed createLogger helper, should use pino directly

  It added unnecessary obfuscation

### Minor Changes

- 3c11373: Upgraded dependencies

## 1.0.1

### Patch Changes

- 2b894ef: Fixed log sampling

## 1.0.0

### Major Changes

- 27073cd: Express logging middleware now will escalate log levels when a warn or an error occurs

  It will _buffer_ log messages of a request, when the request is complete it will set an appropriate log level before flushing the logs to the logger.

  This means you can set the level to warn or error by default, then if a warn gets logged at the end of the request info level logs will also be logged. On error debug level logs will be logged.

  - Breaking: Removed log scrubbing test helpers, pino can be configured to not log the random information which is more reliable than scrubbing after the fact
  - Note: Due to buffering log messages, requests may use slightly more memory

### Minor Changes

- 27073cd: Add request log sampling option to express middleware

## 0.3.0

### Minor Changes

- 3a6777b: use express-serve-static-core typings for exported type definitions

## 0.2.0

### Minor Changes

- 8f737c8: Allow pino options to be passed to the createLogger function

## 0.1.2

### Patch Changes

- 0545eaf: Split logging packages into 2, one only supports logging to std out, the other supports multi-stream

## 0.1.1

### Patch Changes

- 4538db2: Exclude tsconfig from npm packages which cause consumption issues

## 0.1.0

### Minor Changes

- 13e0e6e: Initial release

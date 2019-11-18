# Etrigan Logging

This project is the same as `@etrigan/logging` except it supports logging to multiple streams (console and file for instance). This is not the recommended pino way, but we need to do this for legacy reasons.

## Usage

#### Logger

```ts
import logging from 'etrigan/logging-multi'

// If a logfile is specified pino-multi-stream is configured
// otherwise it will use plain pino for speed reasons
const log = logging.createLogger({
    name: 'MyService',
    logfile: process.env.LOG_FILE,
})
```

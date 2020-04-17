# Etrigan Logging

Opinionated helpers for production logging using express and pino.

Has the following features

-   Express middleware: logs request begin/end messages, log sampling and more.
-   Log escalator: buffers request logs, enabling debug/info level logs to be written only when warn/error messages are also logged ensuring you do not miss valuable context before a error occurs.
-   Pino serialisers: for express requests

See below for more information on these features

## Express request logging middleware

Will automatically log 'begin request' at debug level then close or finish at info level.

### Features

#### Enable debug logs query string

Sometimes it's useful to get debug level logs in production, by default adding `?debug_log` as a query string on the request will automatically set the log level for the request to debug.

#### Log sampling

You can specify what % of logs to log at debug and what level at info. This helps reduce overall log volumes while still giving you debug and info level logs to gather metrics and other useful information from.

The log escalator, explained below will ensure that contextual info or debug level logs are also logged when warns or errors are logged.

#### Log

### Usage

```ts
import { expressRequestLoggingMiddleware } from '@etrigan/logging'

// On your express server
app.use(expressRequestLoggingMiddleware(log))
```

### Options

You can also add `?debug_log` to any API call to increase the log level for that request to debug. Setting the env variable `DISABLE_DEBUG_LOG_QS` will turn this feature off.

## Log escalalator

When sampling logs only warns and above will be logged by default. This is problematic when errors occur because they may not occur on a sampled log.

The log escalator solves this problem. It will ensure when a warn or error is logged that the debug and info level logs which preceeded the error will also be logged.

### How it works

-   It buffers the log messages for a request
-   When a warn is logged, the request logger will be set to `info` level
-   When a error is logged, the request logger will be set to `error` level
-   Once the request finishes, errors or gets closed the buffered logs will get written to the logger
-   It will automatically time out after 10 seconds and flush the buffered logs regardless.

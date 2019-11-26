# Etrigan Logging

## Logging middleware

Will automatically log begin request (at debug level) then close or finish at info level.

You can also add `?debug_log` to any API call to increase the log level for that request to debug. Setting the env variable `DISABLE_DEBUG_LOG_QS` will turn this feature off.

## Usage

#### Logger

```ts
import logging from '@etrigan/logging'

// If a logfile is specified pino-multi-stream is configured
// otherwise it will use plain pino for speed reasons
const log = logging.createLogger({ name: 'MyService' })
```

#### Express request logging middleware

Will log debug and a final info level message when the request finishes with core request info

```ts
import { expressRequestLoggingMiddleware, WithLoggingInfo } from '@etrigan/logging'

// On your express server
app.use(expressRequestLoggingMiddleware(log))

// On other middlewares:

app.get('/test', (req: Express.Request & WithLoggingInfo, response: Response) => {
    // Have a logger, a request id and startTime timestamp on the req
    req.log.info(`${req.id} started at ${new DateTime(req.startTime)}`)
})
```

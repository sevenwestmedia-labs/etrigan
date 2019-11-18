import express from 'express'
import uuidv4 from 'uuid/v4'
import { Logger } from 'typescript-log'
import { WithLoggingInfo } from '.'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        export interface Request extends WithLoggingInfo {}
        export interface Response {
            endTime: number
        }
    }
}

export function expressRequestLoggingMiddleware(logger: Logger): express.RequestHandler {
    return loggingMiddleware

    function onResFinished(this: express.Response, err?: Error) {
        this.removeListener('finish', onResFinished)
        this.removeListener('close', onResClose)
        this.removeListener('error', onResFinished)
        const req = this.req!

        this.endTime = Date.now()
        const responseTime = this.endTime - req.startTime

        if (err) {
            req.log.error({ res: this, err, responseTime }, 'request errored')
            return
        }

        req.log.info({ req, res: this, responseTime }, 'end request')
    }

    function onResClose(this: express.Response) {
        this.removeListener('finish', onResFinished)
        this.removeListener('close', onResClose)
        this.removeListener('error', onResFinished)

        this.endTime = Date.now()
        const responseTime = this.endTime - this.req!.startTime

        this.req!.log.info(
            { req: this.req!, res: this, responseTime },
            'end request - connection closed',
        )
    }
    function loggingMiddleware(
        req: express.Request,
        res: express.Response,
        next: express.NextFunction,
    ) {
        req.requestId = req.header('x-request-id') || uuidv4()
        const childOptions = { requestId: req.requestId }
        if ('debug_log' in req.query && !process.env.DISABLE_DEBUG_LOG_QS) {
            ;(childOptions as any).level = 'debug'
        }

        req.log = logger.child(childOptions)
        req.log.debug({ req }, 'begin request')
        req.startTime = Date.now()
        res.req = req

        res.on('finish', onResFinished)
        res.on('close', onResClose)
        res.on('error', onResFinished)

        if (next) {
            next()
        }
    }
}

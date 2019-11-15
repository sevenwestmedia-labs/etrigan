import express from 'express'

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Etrigan {
        export interface Config {
            [key: string]: any
        }
    }
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        export interface Request extends WithConfig {}
    }
}

export interface WithConfig {
    config: Etrigan.Config
}

export function expressConfigMiddleware<T extends Etrigan.Config>(config: () => T) {
    return function configMiddleware(
        req: express.Request & WithConfig,
        _res: express.Response,
        next: express.NextFunction,
    ) {
        // Config is a function so we can reload the config outside the middleware but
        // config is atomic for each request
        req.config = config()

        if (next) {
            next()
        }
    }
}

import pino from 'pino'
import express from 'express'

import { LogObject, Logger } from 'typescript-log'

export interface WithLoggingInfo {
    requestId: string
    log: Logger
    startTime: number
}

export type Levels = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

export interface Options {
    name?: string

    enabled?: boolean

    logLevel: Levels
    pretty?: boolean
    pinoOptions?: pino.LoggerOptions
}

/** Lightweight wrapper for pino */
export function createLogger(opts: Options) {
    const level = opts.logLevel
    const pinoOptions: pino.LoggerOptions = {
        ...opts.pinoOptions,
        name: opts.name,
        // This has to be lower than console and log file, chance to optimise later
        level,
        enabled: opts.enabled !== false,
        serializers: {
            req: asReqValue,
            res: asResValue,
            err: pino.stdSerializers.err,
        },
    }

    const usePretty = opts.pretty || process.env.NODE_ENV === 'development'
    return pino({
        ...pinoOptions,
        prettyPrint: usePretty,
    })
}

function asResValue(res: express.Response & { endTime: number }) {
    return {
        statusCode: res.statusCode,
        endTime: res.endTime,
    }
}

function asReqValue(req: express.Request & WithLoggingInfo) {
    const logObj: LogObject = {
        id: req.requestId,
        method: req.method,
        url: req.originalUrl,
        startTime: req.startTime,
        headers: {
            // Our custom API client identifying headers
            'x-request-id': req.get('x-request-id'),
            Caller: req.get('Caller') || 'Not Specified',
        },
    }
    if (req.originalUrl !== req.url) {
        logObj.finalUrl = req.url
    }
    return logObj
}

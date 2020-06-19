import pino from 'pino'
import pinoms from 'pino-multi-stream'
import consoleStream from 'console-stream'
import express from 'express-serve-static-core'
import fs from 'fs'

import { Logger, LogObject } from 'typescript-log'

export interface WithLoggingInfo {
    requestId: string
    log: Logger
    startTime: number
}

export type Levels = 'fatal' | 'error' | 'warn' | 'info' | 'debug' | 'trace'

export type Options = {
    name?: string
    logfile?: string

    enabled?: boolean

    logLevel: Levels
    pretty?: boolean

    pinoOptions?: pino.LoggerOptions

    additionalStreams?: Array<{
        stream: NodeJS.WritableStream
    }>
}

export function createLogger(opts: Options): pino.Logger {
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
    const hasAdditionalStreams = opts.additionalStreams && opts.additionalStreams.length > 0
    // Fast path without pinoms when just logging to the console
    if (!opts.logfile && !hasAdditionalStreams) {
        return pino({
            ...pinoOptions,
            prettyPrint: usePretty,
        })
    }

    const streams: pinoms.Streams = [
        {
            level,
            stream: consoleStream(),
        },
    ]

    if (opts.logfile) {
        streams.push({
            level,
            stream: fs.createWriteStream(opts.logfile, { flags: 'a' }),
        })
    }
    if (opts.additionalStreams) {
        streams.push(...opts.additionalStreams.map(stream => ({ stream: stream.stream, level })))
    }

    return pinoms({
        name: opts.name,
        ...pinoOptions,
        streams,
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

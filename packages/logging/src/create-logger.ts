import pino from 'pino'

import { Logger } from 'typescript-log'
import { serialisers } from './serialisers'

export interface WithLoggingInfo {
    requestId: string
    caller?: string
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
            ...pino.stdSerializers,
            ...serialisers,
        },
    }

    const usePretty = opts.pretty || process.env.NODE_ENV === 'development'
    return pino({
        ...pinoOptions,
        prettyPrint: usePretty,
    })
}

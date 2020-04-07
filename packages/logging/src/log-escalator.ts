import { Logger } from 'typescript-log'

export interface EscalatingLog extends Logger {
    /** Emits any buffered logs then stops buffering */
    emitAndStopBuffering(): void
}

export function logEscalator(
    log: Logger,
    {
        setTimeout: setTimeoutOption,
        clearTimeout: clearTimeoutOption,
        timeout = 10000,
    }: {
        setTimeout?: (cb: () => void, timeout: number) => NodeJS.Timeout
        clearTimeout?: (timeout: NodeJS.Timeout) => void
        timeout?: number
    } = {},
): EscalatingLog {
    let isDone = false
    const logBuffer: Array<{ logMethod: string; args: any[] }> = []
    const timedOut: NodeJS.Timeout = (setTimeoutOption || (setTimeout as any))(
        emitAndStopBuffering,
        timeout,
    )
    timedOut.unref()

    return {
        child() {
            throw new Error(
                'Log escalator does not support creating child loggers, the log escalator is designed to wrap a child logger',
            )
        },
        trace(...args: any[]) {
            if (isDone) {
                ;(log as any).trace(...args)
                return
            }
            logBuffer.push({ logMethod: 'trace', args })
        },
        debug(...args: any[]) {
            if (isDone) {
                ;(log as any).debug(...args)
                return
            }
            logBuffer.push({ logMethod: 'debug', args })
        },
        info(...args: any[]) {
            if (isDone) {
                ;(log as any).info(...args)
                return
            }
            logBuffer.push({ logMethod: 'info', args })
        },
        warn(...args: any[]) {
            if (isDone) {
                ;(log as any).warn(...args)
                return
            }
            if ((log as any).levelVal > 30) {
                ;(log as any).level = 'info'
            }
            logBuffer.push({ logMethod: 'warn', args })
        },
        error(...args: any[]) {
            if (isDone) {
                ;(log as any).error(...args)
                return
            }
            if ((log as any).levelVal > 20) {
                ;(log as any).level = 'debug'
            }
            logBuffer.push({ logMethod: 'error', args })
            emitAndStopBuffering()
        },
        fatal(...args: any[]) {
            if (isDone) {
                ;(log as any).fatal(...args)
                return
            }
            if ((log as any).levelVal > 20) {
                ;(log as any).level = 'debug'
            }
            logBuffer.push({ logMethod: 'fatal', args })
            emitAndStopBuffering()
        },
        emitAndStopBuffering,
    }

    function emitAndStopBuffering() {
        if (isDone) {
            return
        }
        for (const logMsg of logBuffer) {
            ;(log as any)[logMsg.logMethod](...logMsg.args)
        }
        logBuffer.length = 0
        isDone = true
        ;(clearTimeoutOption || clearTimeout)(timedOut)
    }
}

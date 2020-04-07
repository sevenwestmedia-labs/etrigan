import pino from 'pino'
import { logEscalator } from './log-escalator'

it('does not write logs until done is called', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'info' },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')

    expect(logs).toEqual([])
})

it('wraps a logger', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'trace', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')
    wrappedLog.error('error msg')
    wrappedLog.fatal('fatal msg')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":10,"msg":"trace msg","v":1}
`,
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":40,"msg":"warn msg","v":1}
`,
        `{"level":50,"msg":"error msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
})

it('done clears buffer', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'trace', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.done()
    // second done call is to ensure that the buffer was cleared,
    // if it wasn't the logs would be written to the log again
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":10,"msg":"trace msg","v":1}
`,
    ])
})

it('does not support creating a child logger', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'info' },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    expect(() => wrappedLog.child({})).toThrowError('')
})

it('on warn write info', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'warn', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":40,"msg":"warn msg","v":1}
`,
    ])
})

it('on error write debug, without calling done', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'warn', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.error('error msg')
    wrappedLog.fatal('fatal msg')

    expect(logs).toEqual([
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":50,"msg":"error msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
})

it('on fatal write debug, without calling done', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'warn', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.fatal('fatal msg')

    expect(logs).toEqual([
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
})

it('on warn after error, debug logs are still written', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'warn', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')
    wrappedLog.error('error msg')
    wrappedLog.fatal('fatal msg')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":40,"msg":"warn msg","v":1}
`,
        `{"level":50,"msg":"error msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
})

it('on fatal write debug', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'warn', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')
    wrappedLog.error('error msg')
    wrappedLog.fatal('fatal msg')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":40,"msg":"warn msg","v":1}
`,
        `{"level":50,"msg":"error msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
})

it('once done, does not buffer', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'trace', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )

    const wrappedLog = logEscalator(log)

    wrappedLog.done()
    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')
    wrappedLog.error('error msg')
    wrappedLog.fatal('fatal msg')

    expect(logs).toEqual([
        `{"level":10,"msg":"trace msg","v":1}
`,
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":40,"msg":"warn msg","v":1}
`,
        `{"level":50,"msg":"error msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
})

it('done times out if not called within timeout', () => {
    const logs: string[] = []
    const log = pino(
        { level: 'trace', timestamp: false, base: {} },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )
    let callback: () => void
    let timeoutVal = 0
    const wrappedLog = logEscalator(log, {
        setTimeout: (cb, timeout) => {
            callback = cb
            timeoutVal = timeout
            // eslint-disable-next-line @typescript-eslint/no-empty-function
            return { unref() {} } as any
        },
    })

    wrappedLog.trace('trace msg')
    wrappedLog.debug('debug msg')
    wrappedLog.info('info msg')
    wrappedLog.warn('warn msg')
    wrappedLog.error('error msg')
    wrappedLog.fatal('fatal msg')
    callback!()

    expect(logs).toEqual([
        `{"level":10,"msg":"trace msg","v":1}
`,
        `{"level":20,"msg":"debug msg","v":1}
`,
        `{"level":30,"msg":"info msg","v":1}
`,
        `{"level":40,"msg":"warn msg","v":1}
`,
        `{"level":50,"msg":"error msg","v":1}
`,
        `{"level":60,"msg":"fatal msg","v":1}
`,
    ])
    expect(timeoutVal).toBe(10000)
})

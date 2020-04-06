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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.fatal('Test')

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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.fatal('Test')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":10,"msg":"Test","v":1}
`,
        `{"level":20,"msg":"Test","v":1}
`,
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
        `{"level":50,"msg":"Test","v":1}
`,
        `{"level":60,"msg":"Test","v":1}
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

    wrappedLog.trace('Test')
    wrappedLog.done()
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":10,"msg":"Test","v":1}
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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
    ])
})

it('on error write debug', () => {
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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":20,"msg":"Test","v":1}
`,
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
        `{"level":50,"msg":"Test","v":1}
`,
    ])
})

it('on warn after error error write debug', () => {
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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.warn('Test')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":20,"msg":"Test","v":1}
`,
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
        `{"level":50,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.done()

    expect(logs).toEqual([
        `{"level":20,"msg":"Test","v":1}
`,
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
        `{"level":50,"msg":"Test","v":1}
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
    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.fatal('Test')

    expect(logs).toEqual([
        `{"level":10,"msg":"Test","v":1}
`,
        `{"level":20,"msg":"Test","v":1}
`,
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
        `{"level":50,"msg":"Test","v":1}
`,
        `{"level":60,"msg":"Test","v":1}
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

    wrappedLog.trace('Test')
    wrappedLog.debug('Test')
    wrappedLog.info('Test')
    wrappedLog.warn('Test')
    wrappedLog.error('Test')
    wrappedLog.fatal('Test')
    callback!()

    expect(logs).toEqual([
        `{"level":10,"msg":"Test","v":1}
`,
        `{"level":20,"msg":"Test","v":1}
`,
        `{"level":30,"msg":"Test","v":1}
`,
        `{"level":40,"msg":"Test","v":1}
`,
        `{"level":50,"msg":"Test","v":1}
`,
        `{"level":60,"msg":"Test","v":1}
`,
    ])
    expect(timeoutVal).toBe(10000)
})

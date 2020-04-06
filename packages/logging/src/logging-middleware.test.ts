import pino from 'pino'

import { expressRequestLoggingMiddleware, createLogger } from './'

it('logs requests', async () => {
    const logs: string[] = []
    const events: { [event: string]: Function } = {}
    const log = pino(
        {
            level: 'debug',
            timestamp: false,
            base: {},
        },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )
    const middleware = expressRequestLoggingMiddleware(log, {
        createRequestId() {
            return '<requestid>'
        },
        now() {
            return 12345
        },
    })
    const res = {
        on(event: string, cb: Function) {
            events[event] = cb.bind(res)
        },
        removeListener(event: string) {
            delete events[event]
        },
    }
    middleware(
        {
            header() {
                return undefined
            },
            query: {},
        } as any,
        res as any,
        () => {},
    )
    events.finish()

    expect(logs).toMatchSnapshot()
    expect(Object.keys(events).length).toBe(0)
})

it('logs API caller headers', async () => {
    const logs: string[] = []
    const events: { [event: string]: Function } = {}
    const log = pino(
        {
            level: 'debug',
            timestamp: false,
            base: {},
        },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )
    const middleware = expressRequestLoggingMiddleware(log, {
        createRequestId() {
            return '<requestid>'
        },
        now() {
            return 12345
        },
    })
    const res = {
        on(event: string, cb: Function) {
            events[event] = cb.bind(res)
        },
        removeListener(event: string) {
            delete events[event]
        },
    }
    middleware(
        {
            header(name: string) {
                if (name === 'x-request-id') {
                    return 'testRequest1'
                }
                if (name === 'Caller') {
                    return 'custom API caller'
                }
                return undefined
            },
            query: {},
        } as any,
        res as any,
        () => {},
    )
    events.finish()

    expect(logs).toMatchSnapshot()
    expect(Object.keys(events).length).toBe(0)
})

it('logs failed', async () => {
    const logs: string[] = []
    const events: { [event: string]: Function } = {}
    const log = pino(
        {
            level: 'debug',
            timestamp: false,
            base: {},
        },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )
    const middleware = expressRequestLoggingMiddleware(log, {
        createRequestId() {
            return '<requestid>'
        },
        now() {
            return 12345
        },
    })
    const res = {
        on(event: string, cb: Function) {
            events[event] = cb.bind(res)
        },
        removeListener(event: string) {
            delete events[event]
        },
    }
    middleware(
        {
            header() {
                return undefined
            },
            query: {},
        } as any,
        res as any,
        () => {},
    )
    events.error()

    expect(logs).toMatchSnapshot()
    expect(Object.keys(events).length).toBe(0)
})

it('logs close', async () => {
    const logs: string[] = []
    const events: { [event: string]: Function } = {}
    const log = pino(
        {
            level: 'debug',
            timestamp: false,
            base: {},
        },
        {
            write(msg) {
                logs.push(msg)
            },
        },
    )
    const middleware = expressRequestLoggingMiddleware(log, {
        createRequestId() {
            return '<requestid>'
        },
        now() {
            return 12345
        },
    })
    const res = {
        on(event: string, cb: Function) {
            events[event] = cb.bind(res)
        },
        removeListener(event: string) {
            delete events[event]
        },
    }
    middleware(
        {
            header() {
                return undefined
            },
            query: {},
        } as any,
        res as any,
        () => {},
    )
    events.close()

    expect(logs).toMatchSnapshot()
    expect(Object.keys(events).length).toBe(0)
})

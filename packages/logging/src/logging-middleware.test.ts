import express from 'express'
import supertest from 'supertest'

import { expressRequestLoggingMiddleware, createLogger, TestStream, scrubJsonLogs } from './'

it('logs requests', async () => {
    const logs: string[] = []
    const log = createLogger({
        logLevel: 'debug',
        additionalStreams: [
            {
                stream: new TestStream(msg => logs.push(msg)),
            },
        ],
    })
    const middleware = expressRequestLoggingMiddleware(log)
    const app = express()

    app.use(middleware)

    app.get('/', (_req, res) => res.send('Hi'))

    const res = await supertest(app)
        .get('/')
        .expect(200)
    expect(res.text).toBe('Hi')
    expect(scrubJsonLogs(logs)).toMatchSnapshot()
})

it('logs API caller headers', async () => {
    const logs: string[] = []
    const log = createLogger({
        logLevel: 'debug',
        additionalStreams: [
            {
                stream: new TestStream(msg => logs.push(msg)),
            },
        ],
    })
    const middleware = expressRequestLoggingMiddleware(log)
    const app = express()

    app.use(middleware)

    app.get('/', (_req, res) => res.send('Hi'))

    const res = await supertest(app)
        .get('/')
        .set('Caller', 'custom API caller')
        .set('x-request-id', 'testRequest1')
        .expect(200)
    expect(res.text).toBe('Hi')
    expect(scrubJsonLogs(logs)).toMatchSnapshot()
})

it('logs failed', async () => {
    const logs: string[] = []
    const log = createLogger({
        logLevel: 'debug',
        additionalStreams: [
            {
                stream: new TestStream(msg => logs.push(msg)),
            },
        ],
    })
    const middleware = expressRequestLoggingMiddleware(log)
    const app = express()

    app.use(middleware)

    app.get('/', (_req, res) => res.status(500).send('Oops'))

    const res = await supertest(app)
        .get('/')
        .expect(500)
    expect(res.text).toBe('Oops')
    expect(scrubJsonLogs(logs)).toMatchSnapshot()
})

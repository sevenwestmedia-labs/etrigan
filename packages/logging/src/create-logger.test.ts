import { createLogger, scrubJsonLogs } from './'
import { TestStream } from './test-helpers/test-stream'

it('can create logger', () => {
    const logs: string[] = []
    const log = createLogger({
        name: 'named',
        logLevel: 'debug',
        additionalStreams: [{ stream: new TestStream(msg => logs.push(msg)) }]
    })

    log.info('Test')

    expect(scrubJsonLogs(logs)).toMatchSnapshot()
})

import { createLogger, scrubJsonLogs } from './'

it('can create logger', () => {
    const logs: string[] = []
    const originalStdoutWrite = process.stdout.write.bind(process.stdout)
    ;(process.stdout as any).write = (chunk: any, encoding: any, callback: any) => {
        if (typeof chunk === 'string') {
            logs.push(chunk)
        }

        return originalStdoutWrite(chunk, encoding, callback)
    }
    const log = createLogger({
        name: 'named',
        logLevel: 'debug',
    })

    log.info('Test')

    expect(scrubJsonLogs(logs)).toMatchSnapshot()
})

import { EtriganError } from './errors'

it('allows inner errors', () => {
    const original = createOriginal()

    const wrapped = createWrapped(original)

    expect(wrapped.message).toEqual('Wrapped error --> Error: Inner')

    // Stack should contain both
    expect(wrapped.stack).toContain(`at createWrapped`)
    expect(wrapped.stack).toContain(`at createOriginal`)
})

class TestError extends EtriganError {
    constructor(message: string, innerError?: Error | undefined) {
        super('TestError', message, innerError)
    }
}
function createWrapped(error: Error) {
    return new TestError('Wrapped error', error)
}

function createOriginal() {
    return new Error('Inner')
}

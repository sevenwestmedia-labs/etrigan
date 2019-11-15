import { environmentConfigDriver } from './env-driver'

it('can read env config', async () => {
    process.env.TEST_ENV = 'TestVal'
    const envDriver = await environmentConfigDriver.read<{ testEnv: string }>({
        testEnv: 'TEST_ENV',
    })

    expect(envDriver.testEnv).toBe('TestVal')
})

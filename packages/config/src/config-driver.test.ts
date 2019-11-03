import { createDriver } from './config-driver'
import { writeFileSync, unlinkSync } from 'fs'
import { resolve } from 'path'

describe('env driver', () => {
    it('can load variables from environment', async () => {
        process.env.TEST_ENV = 'TestVal'
        const envDriver = await createDriver('env://TEST_ENV')

        expect(envDriver.TEST_ENV).toBe('TestVal')
    })

    it('can alias env variables', async () => {
        process.env.TEST_ENV = 'TestVal'
        const envDriver = await createDriver('env://TEST_ENV:testEnv')

        expect(envDriver.testEnv).toBe('TestVal')
    })
})

describe('json driver', () => {
    it('can load variables from json file', async () => {
        const configFile = resolve(`/tmp/test_config${Date.now()}${Math.random()}.json`)
        try {
            writeFileSync(configFile, JSON.stringify({ testEnv: 'TestVal' }))

            const jsonDriver = await createDriver(`json://${configFile}`)

            expect(jsonDriver.testEnv).toBe('TestVal')
        } finally {
            unlinkSync(configFile)
        }
    })
})

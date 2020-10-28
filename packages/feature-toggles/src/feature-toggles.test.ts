jest.mock('fs')
jest.mock('cluster')

import { RawFeatureValues } from '@etrigan/feature-toggles-client'
import { consoleLogger } from 'typescript-log'
import { createFeatureUpdater } from './create-feature-updater'

it('can initialise client', async () => {
    await createFeatureUpdater({
        log: consoleLogger(),
        getFeatures() {
            return Promise.resolve({
                'test-feature': true,
            })
        },
        featureStateFile: './test-features.json',
    })
})

it('can receive feature updates', async () => {
    let updateToggles: (rawFeatures: RawFeatureValues) => void
    await createFeatureUpdater({
        log: consoleLogger(),
        getFeatures() {
            return Promise.resolve({
                'test-feature': true,
            })
        },
        featureStateFile: './test-features.json',
        subscribeToChanges(update) {
            updateToggles = update
        },
    })
    const message = new Promise(resolve => {
        process.on('message', msg => resolve(msg))
    })

    updateToggles!({ 'test-feature': false })

    expect(await message).toEqual({
        type: 'feature-message',
        features: { ['test-feature']: false },
    })
})

jest.mock('launchdarkly-node-server-sdk')
jest.mock('fs')
jest.mock('cluster')

import { consoleLogger } from 'typescript-log'
import { __setupToggles, __updateToggles } from 'launchdarkly-node-server-sdk'
import { createFeatureUpdater } from './create-feature-updater'

it('can initialise client', async () => {
    __setupToggles({
        'test-feature': true,
    })

    await createFeatureUpdater(consoleLogger(), {
        featureStateFile: './test-features.json',
        launchDarklySdkKey: 'SDK-KEY',
    })
})

it('can receive feature updates', async () => {
    __setupToggles({
        'test-feature': true,
    })

    await createFeatureUpdater(consoleLogger(), {
        featureStateFile: './test-features.json',
        launchDarklySdkKey: 'SDK-KEY',
    })
    const message = new Promise(resolve => {
        process.on('message', msg => resolve(msg))
    })

    __updateToggles({ 'test-feature': false })

    expect(await message).toEqual({
        type: 'feature-message',
        features: { ['test-feature']: { enabled: false } },
    })
})

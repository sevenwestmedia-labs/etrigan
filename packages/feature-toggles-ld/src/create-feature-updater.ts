import { LDClient, LDFeatureStore } from 'launchdarkly-node-server-sdk'
import {
    initialiseLaunchDarklyClient,
    allToggles,
    getLaunchDarklyClientWithRetry,
} from './launch-darkly/client'
import { FeatureStore } from './launch-darkly/feature-store'
import { Logger } from 'typescript-log'
import { createFeatureUpdater, FeatureUpdater } from '@etrigan/feature-toggles'
import { RawFeatureValues } from '@etrigan/feature-toggles-client'

export interface LaunchDarklyFeatureUpdaterConfig {
    featureStateFile: string
    launchDarklySdkKey: string
}

/** Initialises feature toggles in the master */
export async function createLaunchDarklyFeatureUpdater(
    log: Logger,
    config: LaunchDarklyFeatureUpdaterConfig,
): Promise<FeatureUpdater> {
    const featureStore = new FeatureStore()
    let ldClient: LDClient | undefined
    let updatedHandler: (newFeatures?: RawFeatureValues) => void

    try {
        ldClient = await initialiseLaunchDarklyClient(
            config.launchDarklySdkKey,
            log,
            featureStore as LDFeatureStore,
        )
    } catch (err) {
        launchDarklyFailedToInitialise(log, config, featureStore).then(async client => {
            ldClient = client
            if (updatedHandler) {
                updatedHandler()
            }
        })
    }

    const featureUpdater = await createFeatureUpdater({
        log,
        featureStateFile: config.featureStateFile,
        getFeatures() {
            if (!ldClient) {
                throw new Error('LDClient not initialised')
            }

            return allToggles(ldClient, log)
        },
        subscribeToChanges(update) {
            updatedHandler = update
        },
    })

    // Finally subscribe to store updates
    featureStore.on(featureStore.TOGGLES_UPDATED_EVENT, () => updatedHandler())

    return featureUpdater
}

async function launchDarklyFailedToInitialise(
    logger: Logger,
    config: {
        featureStateFile: string
        launchDarklySdkKey: string
    },
    featureStore: FeatureStore,
) {
    // Launch darkly has failed to initialise, lets keep trying in the background
    return await getLaunchDarklyClientWithRetry(
        config.launchDarklySdkKey,
        logger,
        featureStore as LDFeatureStore,
    )
}

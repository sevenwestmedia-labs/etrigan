import { LDClient, LDFeatureStore } from 'launchdarkly-node-server-sdk'
import {
    initialiseClient,
    allToggles,
    getLaunchDarklyClientWithRetry,
} from './launch-darkly/client'
import { FeatureStore } from './launch-darkly/feature-store'
import {
    writeFeatureFile,
    featureStateFileExists,
    featureFilePath,
    readFeatureFile,
    FeatureUpdater,
} from '.'
import { FeatureState } from './universal'
import { Logger } from 'typescript-log'

export interface FeatureUpdaterConfig {
    featureStateFile: string
    launchDarklySdkKey?: string
}

/** Initialises feature toggles in the master */
export const createFeatureUpdater = async (
    logger: Logger,
    config: FeatureUpdaterConfig,
): Promise<FeatureUpdater> => {
    const featureStore = new FeatureStore()
    let ldClient: LDClient | undefined
    let initialFeatureState: FeatureState | undefined

    try {
        ldClient = await initialiseClient(
            config.launchDarklySdkKey,
            logger,
            featureStore as LDFeatureStore,
        )

        if (ldClient) {
            initialFeatureState = await allToggles(ldClient, logger)
        }
    } catch (err) {
        logger.warn(
            { err },
            'Error initialising launch darkly client, falling back to feature file',
        )
    }

    if (initialFeatureState) {
        await writeFeatureFile(config.featureStateFile, initialFeatureState, logger)
    }

    const featureStateFileExistsResult = await featureStateFileExists(config.featureStateFile)
    // We want to read the state from the file to ensure it works.
    if (!featureStateFileExistsResult) {
        throw new Error(
            `Expecting feature state file to exist at ${featureFilePath(config.featureStateFile)}`,
        )
    }

    initialFeatureState = await readFeatureFile(config.featureStateFile, logger)
    const featureUpdater = new FeatureUpdater(initialFeatureState, featureStore, ldClient, logger)
    if (!ldClient && config.launchDarklySdkKey) {
        launchDarklyFailedToInitialise(logger, config, featureStore, featureUpdater)
    }

    // Finally subscribe to store updates
    featureStore.on(featureStore.TOGGLES_UPDATED_EVENT, () =>
        updatedHandler(config, ldClient, logger),
    )

    return featureUpdater
}

async function updatedHandler(
    config: FeatureUpdaterConfig,
    ldClient: LDClient | undefined,
    logger: Logger,
) {
    try {
        if (!ldClient) {
            throw new Error('Feature store should not change without a launch darkly client')
        }
        const initialToggles = await allToggles(ldClient, logger)
        await writeFeatureFile(config.featureStateFile, initialToggles, logger)
    } catch (err) {
        logger.error({ err }, 'Failed to write feature file')
    }
}

async function launchDarklyFailedToInitialise(
    logger: Logger,
    config: {
        featureStateFile: string
        launchDarklySdkKey?: string
    },
    featureStore: FeatureStore,
    featureUpdater: FeatureUpdater,
) {
    // Launch darkly has failed to initialise, lets keep trying in the background
    const client = await getLaunchDarklyClientWithRetry(
        config.launchDarklySdkKey,
        logger,
        featureStore as LDFeatureStore,
    )
    if (client) {
        const initialToggles = await allToggles(client, logger)
        await writeFeatureFile(config.featureStateFile, initialToggles, logger)
        featureUpdater.setLdClient(client)
    }
}

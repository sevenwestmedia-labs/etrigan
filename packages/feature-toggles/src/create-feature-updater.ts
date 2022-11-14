import { RawFeatureValues } from '@etrigan/feature-toggles-client'
import { raw } from 'express'
import { Logger, noopLogger } from 'typescript-log'
import { FeatureUpdater } from './feature-updater'
import {
    featureFilePath,
    featureStateFileExists,
    readFeatureFile,
    writeFeatureFile,
} from './features-state-file'

export interface FeatureUpdaterOptions {
    /**
     * A file to write the current state to in the event
     * the service restarts and cannot reach the feature toggle service
     * or to read from when worker processes restart
     **/
    featureStateFile: string

    log?: Logger

    /** @returns null when unable to fetch features, will just use values from feature state file if it exists */
    getFeatures(log: Logger): Promise<RawFeatureValues | null>

    /**
     * If specified, will subscribe to changes and notify workers when the toggles change
     * @param togglesChanged notify of a change, optionally with the new toggles (otherwise they will be fetched)
     **/
    subscribeToChanges?(togglesChanged: (features?: RawFeatureValues) => void): void
}

/** Initialises feature toggles in the master worker */
export async function createFeatureUpdater(
    options: FeatureUpdaterOptions,
): Promise<FeatureUpdater> {
    const { log = noopLogger(), featureStateFile, getFeatures, subscribeToChanges } = options
    let initialFeatureState: RawFeatureValues | undefined | null
    try {
        initialFeatureState = await getFeatures(log)
    } catch (err) {
        const error = err instanceof Error ? err : new Error(err ? err.toString() : 'Unknown error')
        log.error({ err: error }, 'Error fetching toggles')
    }

    if (initialFeatureState) {
        await writeFeatureFile(featureStateFile, initialFeatureState, log)
    }

    const featureStateFileExistsResult = await featureStateFileExists(featureStateFile)
    // We want to read the state from the file to ensure it works.
    if (!featureStateFileExistsResult) {
        throw new Error(
            `Expecting feature state file to exist at ${featureFilePath(featureStateFile!)}`,
        )
    }

    initialFeatureState = await readFeatureFile(featureStateFile, log)
    const featureUpdater = new FeatureUpdater(initialFeatureState, log)
    // Simple queueing mechanism, just append .then() to the end and it will run
    // once the other promises have completed
    let currentProcessingChange: Promise<any> = Promise.resolve()

    if (subscribeToChanges) {
        subscribeToChanges(newFeatures => {
            currentProcessingChange = currentProcessingChange.then(() => {
                return updatedHandler(options, log, newFeatures, featureUpdater)
            })
        })
    }

    return featureUpdater
}

async function updatedHandler(
    options: FeatureUpdaterOptions,
    log: Logger,
    newFeatures: RawFeatureValues | undefined,
    featureUpdater: FeatureUpdater,
) {
    log.debug(`Processing features changed notification`)
    let rawFeatureValues: RawFeatureValues | null | undefined
    try {
        if (newFeatures) {
            rawFeatureValues = newFeatures
        } else {
            log.debug(`Fetching new features state`)
            rawFeatureValues = await options.getFeatures(log)
        }
    } catch (err) {
        const error = err instanceof Error ? err : new Error(err ? err.toString() : 'Unknown error')

        log.error({ err: error }, 'Failed to fetch new features')
        return
    }

    if (rawFeatureValues) {
        log.debug(
            { featureStateFile: options.featureStateFile },
            `Writing new feature state to feature state file`,
        )
        try {
            await writeFeatureFile(options.featureStateFile, rawFeatureValues, log)
        } catch (err) {
            const error = err instanceof Error ? err : new Error(err ? err.toString() : 'Unknown error')

            log.error({ err: error }, 'Failed to write feature file')
        }

        await featureUpdater.updateToggleState(rawFeatureValues)
    }
}

import * as cluster from 'cluster'
import { LDClient } from 'launchdarkly-node-server-sdk'
import { Logger } from 'typescript-log'
import { allToggles } from './launch-darkly/client'
import { FeatureStore } from './launch-darkly/feature-store'
import { FeatureState } from './universal'
import { EventEmitter } from 'events'

export interface FeatureMessage {
    type: 'feature-message'
    features: FeatureState
}

export enum FeatureUpdaterEvents {
    FeaturesUpdated = 'features-updated',
}

export class FeatureUpdater extends EventEmitter {
    featureState: FeatureState

    constructor(
        initialFeatureState: FeatureState,
        private featureStore: FeatureStore,
        private ldClient: LDClient | undefined,
        private logger: Logger,
    ) {
        super()
        this.featureState = initialFeatureState
        this.featureStore.on(this.featureStore.TOGGLES_UPDATED_EVENT, this.featuresUpdated)
    }

    featuresUpdated = async () => {
        this.logger.debug(`Features updated, trying to notify workers`)
        await this.updateToggleState()
    }

    updateToggleState = async () => {
        if (this.ldClient) {
            this.featureState = await allToggles(this.ldClient, this.logger)
            this.logger.debug(
                { featureState: this.featureState },
                `New feature set received from launch darkly`,
            )
            this.emit(FeatureUpdaterEvents.FeaturesUpdated)
            this.sendUpdate(undefined)
        }
    }

    setLdClient = (ldClient: LDClient) => {
        this.ldClient = ldClient
        this.logger.debug(`Launch Darkly client resolved, updating workers of latest state`)
        this.updateToggleState()
    }

    private sendUpdate(workerId: number | undefined) {
        const message: FeatureMessage = {
            type: 'feature-message',
            features: this.featureState,
        }

        if (workerId) {
            this.logger.debug(`Sending features to worker ${workerId}`)
            const worker = cluster.workers[workerId]
            if (worker) {
                worker.send(message)
            }
            return
        }

        for (const id in cluster.workers) {
            if (cluster.workers.hasOwnProperty(id)) {
                this.logger.debug(`Sending features to worker ${id}`)
                const worker = cluster.workers[id]
                if (worker) {
                    worker.send(message)
                }
            }
        }
    }
}

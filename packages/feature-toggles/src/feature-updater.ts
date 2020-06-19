import * as cluster from 'cluster'
import { Logger } from 'typescript-log'
import { EventEmitter } from 'events'
import { RawFeatureValues } from './create-feature-updater'

export interface FeatureMessage {
    type: 'feature-message'
    features: RawFeatureValues
}

export const enum FeatureUpdaterEvents {
    FeaturesUpdated = 'features-updated',
}

export class FeatureUpdater extends EventEmitter {
    featureValues: RawFeatureValues

    constructor(initialFeatureState: RawFeatureValues, private log: Logger) {
        super()
        this.featureValues = initialFeatureState
    }

    async updateToggleState(featureValues: RawFeatureValues): Promise<void> {
        this.featureValues = featureValues
        this.log.debug({ featureValues: this.featureValues }, `New feature set received`)
        this.emit(FeatureUpdaterEvents.FeaturesUpdated)
        this.sendUpdate(undefined)
    }

    private sendUpdate(workerId: number | undefined) {
        const message: FeatureMessage = {
            type: 'feature-message',
            features: this.featureValues,
        }

        if (workerId) {
            this.log.debug(`Sending features to worker ${workerId}`)
            const worker = cluster.workers[workerId]
            if (worker) {
                worker.send(message)
            }
            return
        }

        for (const id in cluster.workers) {
            if (cluster.workers.hasOwnProperty(id)) {
                this.log.debug(`Sending features to worker ${id}`)
                const worker = cluster.workers[id]
                if (worker) {
                    worker.send(message)
                }
            }
        }
    }
}

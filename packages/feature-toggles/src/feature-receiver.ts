import { Logger } from 'typescript-log'
import { RawFeatureValues } from '@etrigan/feature-toggles-client'
import { FeatureMessage } from './feature-updater'

export class FeatureReceiver {
    constructor(private logger: Logger, public featureState: RawFeatureValues) {
        process.on('message', this.featuresChanged.bind(this))
    }

    featuresChanged(message: FeatureMessage): void {
        if (message.type === 'feature-message') {
            this.logger.debug('Received features from master')
            this.featureState = message.features
        }
    }
}

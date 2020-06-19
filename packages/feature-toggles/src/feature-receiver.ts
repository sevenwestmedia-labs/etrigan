import { Logger } from 'typescript-log'
import { FeatureMessage } from '.'
import { RawFeatureValues } from './create-feature-updater'

export class FeatureReceiver {
    constructor(private logger: Logger, public featureState: RawFeatureValues) {
        process.on('message', this.featuresChanged)
    }

    featuresChanged(message: FeatureMessage): void {
        if (message.type === 'feature-message') {
            this.logger.debug('Received features from master')
            this.featureState = message.features
        }
    }
}

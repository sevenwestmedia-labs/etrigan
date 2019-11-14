import { Logger } from 'typescript-log'
import { FeatureMessage } from '.'
import { FeatureState } from './universal'

export class FeatureReceiver {
    constructor(private logger: Logger, public featureState: FeatureState) {
        process.on('message', this.featuresChanged)
    }

    featuresChanged = (message: FeatureMessage) => {
        if (message.type === 'feature-message') {
            this.logger.debug('Received features from master')
            this.featureState = message.features
        }
    }
}

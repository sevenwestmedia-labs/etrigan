import { FeatureReceiver } from './feature-receiver'
import { readFeatureFile } from './features-state-file'
import { Logger } from 'typescript-log'

export const createFeatureReceiver = async (logger: Logger, featureStateFile: string) => {
    const featuresFromFeatureFile = await readFeatureFile(featureStateFile, logger)
    return new FeatureReceiver(logger, featuresFromFeatureFile)
}

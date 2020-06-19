import { FeatureReceiver } from './feature-receiver'
import { readFeatureFile } from './features-state-file'
import { Logger } from 'typescript-log'

export async function createFeatureReceiver(
    log: Logger,
    featureStateFile: string,
): Promise<FeatureReceiver> {
    const featuresFromFeatureFile = await readFeatureFile(featureStateFile, log)
    return new FeatureReceiver(log, featuresFromFeatureFile)
}

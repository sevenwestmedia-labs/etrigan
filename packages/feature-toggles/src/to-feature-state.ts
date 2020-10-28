import { FeatureState } from '@etrigan/feature-toggles-client'
import { RawFeatureValues } from './create-feature-updater'

export function toFeatureState(rawFeatures: RawFeatureValues): FeatureState {
    return Object.keys(rawFeatures).reduce<FeatureState>((features, featureKey) => {
        const rawValue = rawFeatures[featureKey]
        features[featureKey] = {
            // TODO The user should be able to specify this, just putting the shape in for now
            canUserOverride: false,
            value: {
                raw: rawValue,
                boolean() {
                    if (rawValue === undefined) {
                        throw new Error(`${featureKey} is undefined`)
                    }
                    if (
                        rawValue === true ||
                        rawValue === 'true' ||
                        rawValue === '1' ||
                        rawValue === 1
                    ) {
                        return true
                    }
                    if (
                        rawValue === false ||
                        rawValue === 'false' ||
                        rawValue === '0' ||
                        rawValue === 0
                    ) {
                        return false
                    }
                    throw new Error(`${featureKey} value is not a boolean: ${rawValue}`)
                },
                string() {
                    if (rawValue === undefined) {
                        throw new Error(`${featureKey} is undefined`)
                    }
                    if (typeof rawValue !== 'string') {
                        throw new Error(`${featureKey} value is not a string: ${rawValue}`)
                    }
                    return rawValue
                },
            },
        }
        return features
    }, {})
}

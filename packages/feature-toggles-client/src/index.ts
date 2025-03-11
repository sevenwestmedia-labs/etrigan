export interface FeatureValue<TValue = any> {
    raw: TValue
    string(): string
    boolean(): boolean
}

/**
 * Augment this interface at a global-level to improve the typing of returned features.
 * https://www.typescriptlang.org/docs/handbook/declaration-merging.html#module-augmentation
 */
export interface RawFeatureValues {
    [feature: string]: unknown
}

/**
 * Current state of the feature toggles
 */
export type FeatureState = {
    [key in keyof RawFeatureValues]:
        | {
              value: FeatureValue<RawFeatureValues[key]>

              /** User overridable */
              canUserOverride: boolean

              userOverride?: FeatureValue<RawFeatureValues[key]>
          }
        | undefined
}

export function isFeatureEnabled<TKey extends keyof RawFeatureValues>(
    toggles: FeatureState,
    feature: TKey,
    fallback = false,
): boolean {
    const featureState = toggles[feature]
    if (!featureState) {
        return fallback
    }

    return featureState.userOverride?.boolean() ?? featureState.value.boolean()
}

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

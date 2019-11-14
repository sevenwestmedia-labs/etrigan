export type StringStringMap = { [name: string]: string | undefined }
export type StringBooleanMap = { [name: string]: boolean | undefined }
export type StringAnyMap = { [feature: string]: any | undefined }

/**
 * Current state of the feature toggles
 */
export type FeatureState = {
    [feature: string]:
        | {
              enabled: boolean
          }
        | undefined
}

export function isFeatureEnabled<Features extends string>(
    toggles: FeatureState,
    feature: Features,
    fallback = false
): boolean {
    const server = toggles[feature]
    if (!server) {
        return fallback
    }

    return server.enabled
}

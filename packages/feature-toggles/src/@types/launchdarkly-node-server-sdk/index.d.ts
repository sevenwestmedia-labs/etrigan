declare module 'launchdarkly-node-server-sdk' {
    export function __setupToggles(newToggles: { [feature: string]: any | undefined }): void
    export function __updateToggles(newToggles: { [feature: string]: any | undefined }): void
}

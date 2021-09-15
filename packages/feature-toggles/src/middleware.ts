import express from 'express-serve-static-core'

import { FeatureState, toFeatureState } from '@etrigan/feature-toggles-client'
import { FeatureReceiver } from './feature-receiver'
import { FeatureUpdater } from './feature-updater'

export interface WithFeatures {
    features: FeatureState
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        export interface Request extends WithFeatures {}
    }
}

export function createFeatureStateMiddleware(
    featureManager: FeatureReceiver | FeatureUpdater,
): express.Handler {
    return feaureStateMiddleware

    function feaureStateMiddleware(
        req: express.Request & WithFeatures,
        _res: express.Response,
        next: express.NextFunction,
    ) {
        req.features = toFeatureState(featureManager.featureState)

        next()
    }
}

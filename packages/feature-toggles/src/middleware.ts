import express from 'express-serve-static-core'

import { FeatureReceiver } from '.'
import { RawFeatureValues } from './create-feature-updater'

export interface WithFeatures {
    features: RawFeatureValues
}

declare global {
    // eslint-disable-next-line @typescript-eslint/no-namespace
    namespace Express {
        // eslint-disable-next-line @typescript-eslint/no-empty-interface
        export interface Request extends WithFeatures {}
    }
}

export function createFeatureStateMiddleware(featureReceiver: FeatureReceiver): express.Handler {
    return feaureStateMiddleware

    function feaureStateMiddleware(
        req: express.Request & WithFeatures,
        _res: express.Response,
        next: express.NextFunction,
    ) {
        req.features = featureReceiver.featureState

        next()
    }
}

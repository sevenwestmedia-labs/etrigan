import express from 'express-serve-static-core'

import { FeatureReceiver } from '.'
import { FeatureState, isFeatureEnabled } from './universal'

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

export function createFeatureStateMiddleware(featureReceiver: FeatureReceiver) {
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

export function featureToggledRoute<Features extends string>(features: Features) {
    return (
        req: express.Request & WithFeatures,
        res: express.Response,
        next: express.NextFunction,
    ) => {
        const isPathEnabled = isFeatureEnabled(req.features, features)
        isPathEnabled ? next() : res.sendStatus(404)
    }
}

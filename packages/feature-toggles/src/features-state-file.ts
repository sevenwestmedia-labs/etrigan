import fs from 'fs'
import path from 'path'

import { promisify } from 'util'
import { Logger } from 'typescript-log'
import { FeatureState } from './universal'

export const featureFilePath = (featureStateFile: string) =>
    path.isAbsolute(featureStateFile)
        ? featureStateFile
        : path.join(process.cwd(), featureStateFile)

export const writeFeatureFile = (
    featureStateFile: string,
    featureState: FeatureState,
    logger: Logger,
) => {
    const filePath = featureFilePath(featureStateFile)
    logger.debug(`Writing feature state file to ${filePath}`)

    return promisify(fs.writeFile)(filePath, JSON.stringify(featureState, null, 4))
}
export const readFeatureFile = async (
    featureStateFile: string,
    logger: Logger,
): Promise<FeatureState> => {
    const filePath = featureFilePath(featureStateFile)
    logger.debug(`Reading features from ${filePath}`)

    const data = await promisify(fs.readFile)(filePath)
    if (!data) {
        throw new Error(`Configuration read from ${filePath}, but data is empty`)
    }
    return JSON.parse(data.toString())
}

export const featureStateFileExists = (featureStateFile: string) => {
    const filePath = featureFilePath(featureStateFile)
    return promisify(fs.exists)(filePath)
}

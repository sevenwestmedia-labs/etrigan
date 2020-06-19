import fs from 'fs'
import path from 'path'

import { promisify } from 'util'
import { Logger } from 'typescript-log'
import { RawFeatureValues } from './create-feature-updater'

export function featureFilePath(featureStateFile: string): string {
    return path.isAbsolute(featureStateFile)
        ? featureStateFile
        : path.join(process.cwd(), featureStateFile)
}

export function writeFeatureFile(
    featureStateFile: string,
    featureState: RawFeatureValues,
    logger: Logger,
): Promise<void> {
    const filePath = featureFilePath(featureStateFile)
    logger.debug(`Writing feature state file to ${filePath}`)

    return promisify(fs.writeFile)(filePath, JSON.stringify(featureState, null, 4))
}
export async function readFeatureFile(
    featureStateFile: string,
    logger: Logger,
): Promise<RawFeatureValues> {
    const filePath = featureFilePath(featureStateFile)
    logger.debug(`Reading features from ${filePath}`)

    const data = await promisify(fs.readFile)(filePath)
    if (!data) {
        throw new Error(`Configuration read from ${filePath}, but data is empty`)
    }
    return JSON.parse(data.toString())
}

export function featureStateFileExists(featureStateFile: string | undefined): Promise<boolean> {
    if (!featureStateFile) {
        return Promise.resolve(false)
    }

    const filePath = featureFilePath(featureStateFile)
    return promisify(fs.exists)(filePath)
}

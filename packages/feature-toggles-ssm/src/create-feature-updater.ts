import { Logger } from 'typescript-log'
import { createFeatureUpdater, FeatureUpdater } from '@etrigan/feature-toggles'
import { EtriganError } from '@etrigan/core'

import SSM from 'aws-sdk/clients/ssm'
import KMS from 'aws-sdk/clients/kms'
import { RawFeatureValues } from '@etrigan/feature-toggles-client'

export class ParameterStoreError extends EtriganError {
    constructor(message: string, innerError?: Error) {
        super('ParameterStoreError', message, innerError)
    }
}

export interface SsmFeatureUpdaterConfig {
    featureStateFile: string
    parameterStorePath: string

    region: string
}

/** Initialises feature toggles in the master */
export async function createSSMFeatureUpdater(
    log: Logger,
    config: SsmFeatureUpdaterConfig,
): Promise<FeatureUpdater> {
    const featureUpdater = createFeatureUpdater({
        log,
        featureStateFile: config.featureStateFile,
        async getFeatures() {
            const ssmConfig: SSM.ClientConfiguration = {}
            const kmsConfig: KMS.ClientConfiguration = {}
            ssmConfig.region = config.region
            kmsConfig.region = config.region

            const output: RawFeatureValues = {}
            let nextToken: string | undefined
            do {
                log.debug(
                    `Fetching configuration from AWS Parameter Store: ${config.parameterStorePath}`,
                )

                const result = await new Promise<SSM.GetParametersByPathResult>(
                    (resolve, reject) => {
                        const client = new SSM(ssmConfig)
                        client.getParametersByPath(
                            {
                                Path: config.parameterStorePath,
                                WithDecryption: true,
                                NextToken: nextToken,
                            },
                            (err, data) => {
                                if (err) {
                                    reject(
                                        new ParameterStoreError(
                                            `Cannot get parameters by path`,
                                            err,
                                        ),
                                    )
                                } else {
                                    resolve(data)
                                }
                            },
                        )
                    },
                )
                if (!result.Parameters) {
                    break
                }
                nextToken = result.NextToken
                log.debug(
                    `Retrieved ${result.Parameters.length} parameters from AWS Parameter Store`,
                )

                for (const param of result.Parameters) {
                    if (param.Name && param.Value) {
                        const key = param.Name.substr(config.parameterStorePath.length)
                        switch (param.Type) {
                            case 'String':
                            case 'StringList':
                                output[key] = param.Value
                                log.debug(`Loaded ${key} = "${param.Value}"`)
                                break

                            case 'SecureString':
                                output[key] = param.Value
                                // obscure secrets unless undefined or empty:
                                log.debug(
                                    `Loaded ${key} = "${param.Value ? '**********' : param.Value}"`,
                                )
                                break

                            default:
                                throw new ParameterStoreError(
                                    `Unrecognized parameter data type: ${param.Type}`,
                                )
                        }
                    }
                }
            } while (nextToken)
            log.debug(`No more parameters`)
            return output
        },
        subscribeToChanges(togglesChanged) {},
    })
    return featureUpdater
}

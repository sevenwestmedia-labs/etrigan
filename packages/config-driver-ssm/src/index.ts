import { EtriganError } from '@etrigan/core'
import { ConfigMap } from '@etrigan/config'
import { Logger, noopLogger } from 'typescript-log'

import SSM from 'aws-sdk/clients/ssm'
import KMS from 'aws-sdk/clients/kms'

export class ParameterStoreError extends EtriganError {
    constructor(message: string, innerError?: Error) {
        super('ParameterStoreError', message, innerError)
    }
}

/**
 * Creates a config driver for AWS SSM Parameter Store
 *
 * Driver connection string format:
 * ssm://<path> region=<region>
 */
export const parameterStoreConfigDriver = {
    protocol: 'ssm',
    async read<T>(path: string, region: string | undefined, logger: Logger = noopLogger()) {
        const ssmConfig: SSM.ClientConfiguration = {}
        const kmsConfig: KMS.ClientConfiguration = {}
        ssmConfig.region = region
        kmsConfig.region = region

        const output: ConfigMap = {}
        let nextToken: string | undefined
        do {
            logger.debug(`Fetching configuration from AWS Parameter Store: ${path}`)
            const result = await new Promise<SSM.GetParametersByPathResult>((resolve, reject) => {
                const client = new SSM(ssmConfig)
                client.getParametersByPath(
                    {
                        Path: path,
                        WithDecryption: true,
                        NextToken: nextToken,
                    },
                    (err, data) => {
                        if (err) {
                            reject(new ParameterStoreError(`Cannot get parameters by path`, err))
                        } else {
                            resolve(data)
                        }
                    },
                )
            })
            if (!result.Parameters) {
                break
            }
            nextToken = result.NextToken
            logger.debug(
                `Retrieved ${result.Parameters.length} parameters from AWS Parameter Store`,
            )

            for (const param of result.Parameters) {
                if (param.Name && param.Value) {
                    const key = param.Name.substr(path.length)
                    switch (param.Type) {
                        case 'String':
                        case 'StringList':
                            output[key] = param.Value
                            logger.debug(`Loaded ${key} = "${param.Value}"`)
                            break

                        case 'SecureString':
                            output[key] = param.Value
                            // obscure secrets unless undefined or empty:
                            logger.debug(
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
        logger.debug(`No more parameters`)
        return output
    },
    async fromConnectionString(config: string) {
        const directives = config.split(' ')
        const path = '/' + directives.shift()
        let region: string | undefined = undefined
        directives.forEach(directive => {
            const [key, val] = directive.split('=')
            switch (key) {
                case 'region':
                    region = val
                    break

                default:
                    throw new ParameterStoreError(`Invalid configuration key: ${key}`)
            }
        })

        return await parameterStoreConfigDriver.read(path, region)
    },
}

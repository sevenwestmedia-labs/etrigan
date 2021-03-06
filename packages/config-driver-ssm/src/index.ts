import { EtriganError } from '@etrigan/core'
import { ConfigMap } from '@etrigan/config'
import { Logger, noopLogger } from 'typescript-log'

import SSM from 'aws-sdk/clients/ssm'

export class ParameterStoreError extends EtriganError {
    constructor(message: string, innerError?: Error) {
        super('ParameterStoreError', message, innerError)
    }
}

/**
 * Creates a config driver for AWS SSM Parameter Store
 *
 * Driver connection string format:
 * ssm://<csv of param keys> region=<region>
 */
export const parameterStoreConfigDriver = {
    protocol: 'ssm',
    async read<T>(
        path: string,
        params: string[],
        region: string | undefined,
        logger: Logger = noopLogger(),
    ): Promise<Record<string, any>> {

        const output: ConfigMap = {}
        const client = new SSM({
            region,
        })

        const { Parameters } = await client.getParameters({
            Names: params.map(p => `${path.replace(/\/$/, '')}/${p}`),
            WithDecryption: true,
        }).promise()

        for (const Parameter of Parameters || []) {
            const paramName = Parameter.Name?.replace(new RegExp(`^${path}/?`), '')

            if (!paramName) {
                continue
            }

            switch (Parameter.Type) {
                case 'String':
                case 'StringList':
                    output[paramName] = Parameter.Value
                    logger.debug(`Loaded ${paramName} = "${Parameter.Value}"`)
                    break

                case 'SecureString':
                    output[paramName] = Parameter.Value
                    // obscure secrets unless undefined or empty:
                    logger.debug(
                        `Loaded ${paramName} = "${
                            Parameter.Value ? '**********' : Parameter.Value
                        }"`,
                    )
                    break

                default:
                    throw new ParameterStoreError(
                        `Unrecognized parameter data type: ${Parameter.Type}`,
                    )
            }
        }

        return output
    },
    async fromConnectionString(config: string): Promise<Record<string, any>> {
        const directives = config.split(' ')
        const path = directives.shift() || ''
        const paramsList = directives.shift() || ''
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

        return await parameterStoreConfigDriver.read(path, paramsList.split(','), region)
    },
}

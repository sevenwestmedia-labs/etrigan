import { createEnvVariableDriver } from './drivers/env-driver'
import { createJsonFileVariableDriver } from './drivers/json-file-driver'
import { EtriganError } from '@etrigan/core'

export interface ConfigDriver {
    [key: string]: string | undefined
}

export class ConfigDriverError extends EtriganError {
    static isInstance(error: Error) {
        return error.name === 'ConfigDriverError'
    }

    constructor(message: string, innerError?: Error) {
        super('ConfigDriverError', message, innerError)
    }
}

/**
 * Creates a config driver
 *
 * Driver connection string format:
 * env://ENV_NAME;ALIASED_ENV_NAME:aliasedName
 *
 * json:///absolute/path/to/file.json
 * json://relative/path/toconfig.json
 */
export const createDriver = (configConnectionString: string) => {
    if (!configConnectionString) {
        throw new ConfigDriverError('No configuration string provided')
    }
    const split = configConnectionString.split('://')
    if (split.length !== 2) {
        throw new ConfigDriverError(
            `Cannot parse config connection string: ${configConnectionString}`,
        )
    }

    const [driver, driverConfig] = split
    try {
        switch (driver) {
            case 'env': {
                return createEnvVariableDriver(driverConfig)
            }

            case 'json':
                return createJsonFileVariableDriver(driverConfig)

            case 'ssm':
                return require('./drivers/aws-ssm-driver').createParameterStoreDriver(driverConfig)

            default:
                return unsupportedDriver(driver)
        }
    } catch (err) {
        if (ConfigDriverError.isInstance(err)) {
            throw err
        }
        throw new ConfigDriverError(`Cannot load ${driver} driver`, err)
    }
}

function unsupportedDriver(driver: string): never {
    throw new ConfigDriverError('Unsupported driver: ' + driver)
}

import { environmentConfigDriver } from './drivers/env-driver'
import { jsonFileConfigDriver } from './drivers/json-file-driver'
import { EtriganError } from '@etrigan/core'
import { ConfigMap } from './load-config'

export interface ConfigDriver {
    protocol: string
    fromConnectionString(connectionString: string): Promise<ConfigMap>
}

export class ConfigDriverError extends EtriganError {
    static isInstance(error: Error): boolean {
        return error.name === 'ConfigDriverError'
    }

    constructor(message: string, innerError?: Error) {
        super('ConfigDriverError', message, innerError)
    }
}

const configDrivers: ConfigDriver[] =
    (global as any)['additional_config_drivers'] ||
    ((global as any)['additional_config_drivers'] = [environmentConfigDriver, jsonFileConfigDriver])

export function registerDriver(configDriver: ConfigDriver): void {
    configDrivers.push(configDriver)
}

/**
 * Gets config for a config connection string
 *
 * Driver connection string format:
 * env://ENV_NAME;ALIASED_ENV_NAME:aliasedName
 *
 * json:///absolute/path/to/file.json
 * json://relative/path/toconfig.json
 */
export async function getConfigRecords(
    configConnectionString: string,
): Promise<Record<string, any>> {
    if (!configConnectionString) {
        throw new ConfigDriverError('No configuration string provided')
    }
    const split = configConnectionString.split('://')
    if (split.length !== 2) {
        throw new ConfigDriverError(
            `Cannot parse config connection string: ${configConnectionString}`,
        )
    }

    const [driverProtocol, driverConfig] = split
    try {
        const driver = configDrivers.find(driver => driver.protocol === driverProtocol)
        if (!driver) {
            return unsupportedDriver(driverProtocol)
        }
        const values = await driver.fromConnectionString(driverConfig)
        return values
    } catch (err) {
        if (ConfigDriverError.isInstance(err)) {
            throw err
        }
        throw new ConfigDriverError(`Cannot load ${driverProtocol} driver`, err)
    }
}

function unsupportedDriver(driver: string): never {
    throw new ConfigDriverError('Unsupported driver: ' + driver)
}

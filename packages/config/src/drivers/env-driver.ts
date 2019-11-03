import { ConfigDriver } from '../'
import { ConfigMap } from '../load-config'

/**
 * Useful to create a default connection string which reads from the environment
 * @param variableNames a lookup from the config variable to the env variable name
 */
export function createEnvDriverConnectionString<T extends ConfigMap>(
    variableNames: Record<keyof T, string>
) {
    const envKeys = Object.keys(variableNames) as Array<keyof typeof variableNames>
    return `env://${envKeys.reduce((acc, val) => {
        if (acc !== '') {
            acc += ';'
        }
        return acc + `${variableNames[val]}:${val}`
    }, '')}`
}

export function createEnvVariableDriver(config: string): ConfigDriver {
    const variables = config.split(';')
    return variables.reduce<ConfigDriver>((acc, val) => {
        const aliasSplit = val.split(':')

        if (aliasSplit.length === 1) {
            const envValue = process.env[val]
            if (envValue !== undefined) {
                acc[val] = envValue
            }
        } else if (aliasSplit.length === 2) {
            const envValue = process.env[aliasSplit[0]]
            if (envValue !== undefined) {
                acc[aliasSplit[1]] = envValue
            }
        } else {
            throw new Error(`Cannot parse env variable config: ${val}`)
        }

        return acc
    }, {})
}

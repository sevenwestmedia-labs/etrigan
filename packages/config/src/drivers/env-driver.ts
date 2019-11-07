import { ConfigMap } from '../load-config'

/**
 * Useful to create a default connection string which reads from the environment
 * @param variableNames a lookup from the config variable to the env variable name
 */
export function createEnvDriverConnectionString<T extends ConfigMap>(
    variableNames: Record<keyof T, string>,
) {
    const envKeys = Object.keys(variableNames) as Array<keyof typeof variableNames>
    return `env://${envKeys.reduce((acc, val) => {
        if (acc !== '') {
            acc += ';'
        }
        return acc + `${variableNames[val]}:${val}`
    }, '')}`
}

export const environmentConfigDriver = {
    protocol: 'env',
    /**
     * Map between the config keys and the environmental variables they come from
     * @example
     * environmentConfigDriver.read({
     *     value: 'FROM_THIS_ENV_VAR'
     * })
     */
    async read<T>(variableNames: Record<keyof T, string>) {
        const connectionString = createEnvDriverConnectionString(variableNames)
        return await environmentConfigDriver.fromConnectionString(connectionString)
    },
    async fromConnectionString(config: string) {
        const variables = config.split(';')
        return variables.reduce<Record<string, string | undefined>>((acc, val) => {
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
    },
}

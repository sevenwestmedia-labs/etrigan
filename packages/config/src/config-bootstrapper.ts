import { loadConfig, createDriver, ConfigDriver } from './'
export { ConfigDriver }

/**
 * Often we want to have a single environmental variable which specifies where to load config from
 *
 * This bootstrap function sets that up, returning the result from the driver specified in the CONFIG_DRIVER env variable
 */
export async function bootstrapConfig(defaultConfigConnectionString?: string) {
    const driver = await createDriver('env://CONFIG_DRIVER:configDriver')

    const bootstrapperConfig = loadConfig<{ configDriver: string }>({
        driver,
        defaults: { configDriver: defaultConfigConnectionString },
        validateConfig: { configDriver: 'required-string' }
    })

    return createDriver(bootstrapperConfig.configDriver)
}

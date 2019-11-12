# Etrigan Config

A plugable config management library for your NodeJS applications.

## Why

Config management is one of those things which sometimes you don't realise how important it is until you are using it. Some of the reasons to use a config library like Etrigan config is:

-   Eager validation
    -   Validate the type and shape of your config on application startup, preventing hard to debug crashes at runtime
    -   Very useful for automatic rollback on failed deployment
-   Config heirachy
    -   Want to have defaults -> config file -> environmental variables -> command line param heirachy, no problems
-   Easily change config source
    -   Want to move some of your config into a config file included in deployment? This is safe and easy using a config management library

## Usage

```ts
import { environmentConfigDriver, jsonFileConfigDriver, loadConfig } from '@etrigan/config'

// Read raw config values from env variables
const envValues = environmentConfigDriver.read({
    testConfig: 'TEST_CONFIG',
})

// Read raw config values from json file
const fileValues = jsonFileConfigDriver.read('./config.json')

interface MyConfig {
    testItem?: string
    testItem2: string
}

// The load your config from the raw values
const config = loadConfig<MyConfig>({
    // Merge the raw values in the order
    values: { ...fileValues, ...envValues },
    defaults: {
        testItem2: 'some value',
    },
    // Specify validation rules for
    validateConfig: {
        testItem: 'optional-string',
        testItem2: 'required-string',
    },
})
```

### Drivers

The above example loads config directly in code, drivers allow you to load config based on other config values. The two included drivers are quite basic, drivers can be more advanced, loading from APIs.

Example:

```ts
const config = loadConfig<MyConfig>({
    // Merge the raw values in the order
    values: getConfigRecords('json://./config.dev.json'),
    defaults: {
        testItem2: 'some value',
    },
    // Specify validation rules for
    validateConfig: {
        testItem: 'optional-string',
        testItem2: 'required-string',
    },
})
```

You can also register your own drivers, for example:

```ts
import {
    environmentConfigDriver,
    loadConfig,
    getConfigRecords,
    registerDriver,
} from '@etrigan/config'
import { parameterStoreConfigDriver } from '@etrigan/config-driver-ssm'

const bootstrapConfig = loadConfig({
    values: await environmentConfigDriver.read({
        configDriver: 'CONFIG_DRIVER',
    }),
    validateConfig: {
        configDriver: 'required-string',
    },
})

registerDriver(parameterStoreConfigDriver)

// CONFIG_DRIVER=ssm://my-app/dev/ region=ap-southeast-2
const config = loadConfig<Config>({
    values: await getConfigRecords(bootstrapConfig.configDriver),
    validateConfig: {
        val: 'required-string',
        secret: 'required-string',
    },
})
```

The above ensure we have a value for configDriver from an environmental variable `CONFIG_DRIVER`. It will then load the parameter store driver, getting all config values for the path `/my-app/dev` and making them available as raw values.

This driver will automatically decode Secure-String values too if KMS is setup.

### Config Validation

There are a few built in config validations. They are:

-   required-boolean
-   optional-boolean
-   required-string
-   optional-string
-   non-empty-string
-   optional-int
-   required-int

#### Custom validations

If the above config validations are not enough, you can specify a function instead.

```ts
const config = loadConfig<Config>({
    values,
    validateConfig: {
        // We want validate a required JS object
        val: value => {
            // Some drivers support objects, so we need to handle both
            if (value !== null && typeof value === 'object') {
                return {
                    valid: true,
                    parsedValue: value,
                }
            }

            // If it's a string, assume it's a stringified object and parse it
            if (typeof value === 'string') {
                try {
                    return {
                        valid: true,
                        parsedValue: JSON.parse(value),
                    }
                } catch {}
            }

            return {
                valid: false,
            }
        },
    },
})
```

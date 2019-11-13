import { EtriganError } from '@etrigan/core'

export class ConfigValidationError extends EtriganError {
    constructor(message: string, innerError?: Error) {
        super('ConfigValidationError', message, innerError)
    }
}

export type ValidateConfigItem = (
    value: any,
) =>
    | {
          valid: false
      }
    | { valid: true; parsedValue: any }

export type SupportedValidations = {
    'required-boolean': ValidateConfigItem
    'optional-boolean': ValidateConfigItem
    'required-string': ValidateConfigItem
    'optional-string': ValidateConfigItem
    'non-empty-string': ValidateConfigItem
    'optional-int': ValidateConfigItem
    'required-int': ValidateConfigItem
}

const validationItems: SupportedValidations = {
    'non-empty-string': value => {
        if (typeof value === 'string' && value !== '') {
            return {
                valid: true,
                parsedValue: value,
            }
        }

        return { valid: false }
    },
    'optional-boolean': value => {
        if (value === 'true' || value === true) {
            return {
                valid: true,
                parsedValue: true,
            }
        }

        if (value !== '' && (value === 'false' || !value)) {
            return {
                valid: true,
                parsedValue: false,
            }
        }

        return { valid: false }
    },
    'optional-string': value => {
        return {
            valid: true,
            parsedValue: value ? value.toString() : undefined,
        }
    },
    'required-boolean': value => {
        if (value === 'true' || value === true) {
            return {
                valid: true,
                parsedValue: true,
            }
        }

        if (value === 'false' || value === false) {
            return {
                valid: true,
                parsedValue: false,
            }
        }

        return { valid: false }
    },
    'required-string': value => {
        if (typeof value === 'string') {
            return {
                valid: true,
                parsedValue: value,
            }
        }

        return { valid: false }
    },
    'optional-int': value => {
        if (value === undefined) {
            return { valid: true, parsedValue: undefined }
        }
        if (typeof value === 'number') {
            return {
                valid: true,
                parsedValue: Math.floor(value),
            }
        }

        const parsed = parseInt(value, 10)
        if (!isNaN(parsed)) {
            return {
                valid: true,
                parsedValue: parsed,
            }
        }

        return { valid: false }
    },
    'required-int': value => {
        if (typeof value === 'number') {
            return {
                valid: true,
                parsedValue: Math.floor(value),
            }
        }

        const parsed = parseInt(value, 10)
        if (!isNaN(parsed)) {
            return {
                valid: true,
                parsedValue: parsed,
            }
        }

        return { valid: false }
    },
}

export type ValidationType = ValidateConfigItem | keyof SupportedValidations

export type ConfigMap = Record<string, any>

export function loadConfig<TConfig extends ConfigMap>(options: {
    values: ConfigMap
    defaults?: Partial<TConfig>
    /**
     * Validates the resulting config *after* defaults applied
     *
     * Also can parse the value into the correct runtime type
     */
    validateConfig: { [key in keyof Required<TConfig>]: ValidationType }
}): TConfig {
    // any is due to typescript spread of generic limitations
    const config: TConfig = {
        ...((options.defaults as any) || {}),
        ...options.values,
    }

    // validateConfig requires all keys to be defined
    Object.keys(options.validateConfig).forEach((key: keyof typeof options.validateConfig) => {
        const validationType: ValidationType = options.validateConfig[key]
        const validationFunction: ValidateConfigItem =
            typeof validationType === 'function' ? validationType : validationItems[validationType]

        if (!validationFunction) {
            throw new ConfigValidationError(`${key} is not a supported validation type`)
        }

        const validationResult = validationFunction(config[key])

        if (!validationResult.valid) {
            throw new ConfigValidationError(`${key} has invalid value of: '${config[key]}'`)
        }

        // We assign parsed value to ensure the value is the right type at runtime
        config[key] = validationResult.parsedValue
    })

    return config
}

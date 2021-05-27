# Etrigan AWS SSM Parameter Store Config Driver

Allows Etrigan config to load values from AWS Parameter store

## Example

```ts
import { loadConfig, getConfigRecords, registerDriver } from '@etrigan/config'
import { parameterStoreConfigDriver } from '@etrigan/config-driver-ssm'

registerDriver(parameterStoreConfigDriver)

const config = loadConfig<Config>({
    values: await getConfigRecords(
        'ssm:///my-app/dev/param1,/my-app/dev/param2 region=ap-southeast-2',
    ),
    validateConfig: {
        val: 'required-string',
        secret: 'required-string',
    },
})
```

## Creating keys

Configuration parameters for all environments and applications can be managed using the EC2 Management Console, Systems Manager Console, aws ssm CLI interface.

All parameters have a forward-slash separated prefix followed by a key name. We use the prefix to denote environment and application name, and the key name is interpreted by the application.

E.g. /<environment>/<application>/<configKey>

The key name should be in lower-camel case, as per typical Javascript naming.

## Loading keys

When an application starts, it should use the Etrigan library to connect to the Parameter Store and read all configuration keys for a given prefix. Etrigan can be configured to read the desired prefix with the following environment variable:

`CONFIG_DRIVER="ssm:///<environment>/<application>/ region=ap-southeast-2"`

## IAM Policies

Permissions to keys are assigned using string matching against the full key name (including prefix).

## Encryption via KMS

Configuration secrets (such as service account passwords) can be encrypted at rest using [KMS Encryption Keys](https://console.aws.amazon.com/iam/home?region=ap-southeast-2#/encryptionKeys/ap-southeast-2).

### Validating values

Keys can be fetched from SSM using `aws ssm get parameters-by-path`:

#### Result

`aws ssm get-parameters-by-path --path '/dev/app-name/' --region ap-southeast-2`

```json
{
  "Parameters": [
    {
      "Version": 1,
      "Type": "String",
      "Name": "/dev/app-name/someConfigKey",
      "Value": "Config value"
    },
    {
      "Version": 1,
      "Type": "String",
      "Name": "/dev/the-west/anotherConfigKey",
      "Value": "Config value 2"
    },
    [...]
  ]
}
```

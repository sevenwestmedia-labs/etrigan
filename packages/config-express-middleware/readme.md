# Etrigan Config express middleware

Express middleware to make config available on your request

## Usage

```ts
import { expressConfigMiddleware } from '@etrigan/config-express-middleware'

let config: MyConfig

express.use(expressConfigMiddleware(() => config))
```

## Updating config

The config will be fetched for each request. Config should never be mutated, instead set a new value for the `config` variable above, then the next request will get the new config. In flight requests will keep their old config until completion.

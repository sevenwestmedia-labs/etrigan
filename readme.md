# Etrigan

Etrigan (the daemon) is a opinionated collection of modules to solve common problems encountered when running Node.js as a service in production.

![Etrigan the Demon](./assets/etrigan.jpg)

Credit: Wikipedia

## Packages

**Check out the readme's for each package as most of the information about each library will be in there!**

### [etrigan/config](./packages/config)

A plugable config management library for your NodeJS applications.

### [@etrigan/config-drvier-ssm](./packages/config-drvier-ssm)

AWS SSM Parameter Store support for Etrigan Config

### [@etrigan/config-express-middleware](./packages/config-express-middleware)

Express middlware for making config available to the current request

### [@etrigan/feature-toggles](./packages/feature-toggles)

Productionised feature toggling, with master/worker messaging, last known good state startup, express integration and other features.

Uses the LaunchDarkly node SDK, though the toggle provider could be pulled into a separate package if needed.

### [@etrigan/core](./packages/core)

Error handling and common building blocks.

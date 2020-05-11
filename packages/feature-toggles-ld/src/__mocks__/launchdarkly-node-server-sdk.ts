import { EventEmitter } from 'events'
import { FeatureStore } from '../launch-darkly/feature-store'
import { LDFlagSet, LDFlagsState } from 'launchdarkly-node-server-sdk'

let toggles: LDFlagSet = {}

type Events = { type: 'identify'; user: string }
const events: Events[] = []

class MockClient extends EventEmitter {
    private kind = { namespace: 'features' }

    constructor(public featureStore: FeatureStore) {
        super()

        this.__updateFeatures(toggles)

        setTimeout(() => {
            this.emit('ready')
        })
    }

    __updateFeatures(newToggles: LDFlagSet) {
        // tslint:disable-next-line:forin
        for (const key in newToggles) {
            this.featureStore.get(this.kind, key, res => {
                if (res === null || newToggles[key] !== res.value) {
                    const toggleData = {
                        key,
                        version: res && res.version !== undefined ? res.version + 1 : 0,
                        value: newToggles[key],
                    }
                    this.featureStore.upsert(this.kind, toggleData)
                }
            })
        }
    }

    identify(user: string) {
        events.push({
            type: 'identify',
            user,
        })
    }

    allFlagsState() // user: string,
    // options: LDFlagsStateOptions | undefined
    {
        return new Promise(resolve => {
            this.featureStore.all(this.kind, res => {
                const selectedValues = Object.keys(res).reduce<any>((acc, val) => {
                    acc[val] = res[val].value
                    return acc
                }, {})

                const result: LDFlagsState = {
                    valid: true,
                    getFlagValue: (key: string) => selectedValues[key],
                    // eslint-disable-next-line @typescript-eslint/no-unused-vars
                    getFlagReason: (_key: string) => ({ kind: 'ERROR' }),
                    allValues: () => selectedValues,
                    toJSON: () => selectedValues,
                }

                setTimeout(() => resolve(result))
            })
        })
    }
}

let mockClient: MockClient

module.exports = {
    __events() {
        return events
    },

    __setupToggles(newToggles: LDFlagSet) {
        toggles = newToggles
    },

    __updateToggles(newToggles: LDFlagSet) {
        mockClient.__updateFeatures(newToggles)
    },

    init(_sdkKey: string, options: { featureStore: FeatureStore }) {
        mockClient = new MockClient(options.featureStore)
        return mockClient
    },
}

import { LDFlagSet, LDFlagValue } from 'launchdarkly-node-server-sdk'
import { EventEmitter } from 'events'

// Full set of launch darkly data
export interface LDDataMap {
    [key: string]: LDFlagSet
}

const noop = () => {}

export class FeatureStore extends EventEmitter {
    TOGGLES_UPDATED_EVENT = 'updated'

    private allData: LDDataMap = {}
    private initCalled = false

    get(kind: { namespace: string }, key: string, callback: (res: LDFlagValue) => void = noop) {
        const items = this.allData[kind.namespace] || {}
        if (items.hasOwnProperty(key)) {
            const item = items[key]

            if (!item || item.deleted) {
                callback(null)
            } else {
                callback(this.clone(item))
            }
        } else {
            callback(null)
        }
    }

    all(kind: { namespace: string }, callback: (res: LDFlagSet) => void = noop) {
        const results: LDFlagSet = {}
        const items = this.allData[kind.namespace] || {}

        for (const key in items) {
            if (items.hasOwnProperty(key)) {
                const flag = items[key]
                if (flag && !flag.deleted) {
                    results[key] = this.clone(flag)
                }
            }
        }

        callback(results)
    }

    init(store: LDDataMap, callback: () => void = noop) {
        this.allData = store
        this.initCalled = true

        callback()
    }

    delete(kind: { namespace: string }, key: string, version: string, callback: () => void = noop) {
        let items = this.allData[kind.namespace] || {}
        if (!items) {
            items = {}
            this.allData[kind.namespace] = items
        }

        const deletedItem = { version, deleted: true }
        if (items.hasOwnProperty(key)) {
            const old = items[key]
            if (!old || old.version < version) {
                items[key] = deletedItem
            }
        } else {
            items[key] = deletedItem
        }

        callback()
    }

    upsert(kind: { namespace: string }, data: LDFlagValue, callback: () => void = noop) {
        const key = data.key
        let items = this.allData[kind.namespace]
        if (!items) {
            items = {}
            this.allData[kind.namespace] = items
        }

        if (items.hasOwnProperty(key)) {
            const old = items[key]
            // version will be available on data
            if (old && old.version < data.version) {
                items[key] = data
            }
        } else {
            items[key] = data
        }

        callback()
        this.emit(this.TOGGLES_UPDATED_EVENT)
    }

    initialized(callback: (isInitialized: boolean) => void): void {
        callback(this.initCalled === true)
    }

    close(): void {
        // Close on the in-memory store is a no-op
    }

    private clone(obj: any) {
        return JSON.parse(JSON.stringify(obj))
    }
}

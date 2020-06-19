import { readFile } from 'fs'
import { resolve } from 'path'
import { promisify } from 'util'

export const jsonFileConfigDriver = {
    protocol: 'json',
    async read<T>(file: string): Promise<any> {
        return await jsonFileConfigDriver.fromConnectionString(file)
    },
    async fromConnectionString(config: string): Promise<any> {
        const file = await promisify(readFile)(resolve(config))
        const fileContents = file.toString()
        return JSON.parse(fileContents)
    },
}

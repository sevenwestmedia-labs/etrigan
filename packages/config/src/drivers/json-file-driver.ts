import { ConfigDriver } from '../'
import { readFile } from 'fs'
import { resolve } from 'path'

export async function createJsonFileVariableDriver(path: string): Promise<ConfigDriver> {
    const file = await new Promise<Buffer>((yea, reject) =>
        readFile(resolve(path), (err, data) => {
            if (err) {
                reject(err)
            } else {
                yea(data)
            }
        }),
    )
    const fileContents = file.toString()

    return JSON.parse(fileContents)
}

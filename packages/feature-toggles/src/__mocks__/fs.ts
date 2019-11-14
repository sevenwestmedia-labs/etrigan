import * as path from 'path'
import * as fsNamespace from 'fs'

type MockFiles = { [file: string]: string }
interface SetupMock {
    __setMockFiles(files: MockFiles): void
}

const fs = jest.genMockFromModule<typeof fsNamespace & SetupMock>('fs')

let directories: { [directory: string]: string[] } = {}
let files: MockFiles = {}

function __setMockFiles(newMockFiles: MockFiles) {
    directories = {}
    files = newMockFiles
    // tslint:disable-next-line:forin
    for (const file in newMockFiles) {
        const dir = path.dirname(file)

        if (!directories[dir]) {
            directories[dir] = []
        }
        directories[dir].push(path.basename(file))
    }
}

// A custom version of `readdirSync` that reads from the special mocked out
// file list set via __setMockFiles
function readdirSync(directoryPath: string) {
    return directories[directoryPath] || []
}

function readFile(file: string, cb: (err: Error | undefined, file?: string) => void) {
    setTimeout(() => {
        const fileContents = files[file]
        if (fileContents) {
            cb(undefined, fileContents)
        } else {
            cb(new Error(`FileNotFound ${file}`))
        }
    })
}

function writeFile(file: string, contents: string, cb: (err: Error | undefined) => void) {
    setTimeout(() => {
        const dir = path.dirname(file)

        if (!directories[dir]) {
            directories[dir] = []
        }
        directories[dir].push(path.basename(file))
        files[file] = contents
        cb(undefined)
    })
}

function existsSync(file: string) {
    return !!files[file]
}

function exists(file: string, cb: (err: Error | undefined, exists?: boolean) => void) {
    setTimeout(() => {
        return cb(undefined, !!files[file])
    })
}

fs.__setMockFiles = __setMockFiles
fs.readdirSync = readdirSync as any
fs.readFile = readFile as any
fs.writeFile = writeFile as any
fs.existsSync = existsSync as any
fs.exists = exists as any

module.exports = fs

import { Writable } from 'stream'

export class TestStream extends Writable {
    constructor(private onWrite: (msg: string) => void) {
        super()

        const newWrite: Writable['_write'] = (chunk, _encoding, callback) => {
            this.onWrite(chunk.toString())
            callback()
        }
        this._write = newWrite
    }
}

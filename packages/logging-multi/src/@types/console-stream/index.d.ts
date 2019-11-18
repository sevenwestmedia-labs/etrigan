declare module 'console-stream' {
    import stream = require('stream')

    namespace consoleStream {

    }

    function consoleStream(): stream.Writable

    export = consoleStream
}

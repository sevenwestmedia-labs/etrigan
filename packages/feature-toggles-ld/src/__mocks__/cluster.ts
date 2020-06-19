module.exports = {
    // Pretend we are a worker
    workers: {
        1: {
            send(msg: any) {
                process.emit('message', msg, '')
            },
        },
    },
}

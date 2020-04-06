export function scrubPrettyLogs(msg: string): string
export function scrubPrettyLogs(msg: string[]): string[]
export function scrubPrettyLogs(msg: string | string[]) {
    if (typeof msg === 'string') {
        return msg
            .replace(/\((.*?\/)?\d{3,5} on .*?\)/, '($100000 on <hostname>)')
            .replace(/\w{8}-\w{4}-\w{4}-\w{4}-\w{12}"/g, '00000000-0000-0000-0000-000000000000')
            .replace(/ \d{13}/gm, ' 0000000000000')
            .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g, '0000-00-00T00:00:00.000Z')
            .replace(/responseTime: \d+/g, 'responseTime: 000')
            .replace(/127.0.0.1:\d+/g, '127.0.0.1:<port>')
    }

    return msg.map(m => scrubPrettyLogs(m))
}

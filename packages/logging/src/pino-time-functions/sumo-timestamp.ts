/**
 * A custom timestamp function for use by pino.
 * 
 * By default, pino uses pino.stdTimeFunctions.epochTime to
 * generate a timestamp and add it to the `time` field.
 * 
 * This function generates the same timestamp, but adds it to
 * the `timestamp` field instead, as a string instead of a
 * number.
 * 
 * This matches the format in sumologic's documentation.
 * 
 * ```ts
 * import { sumoTimestamp } from '@etrigan/logging'
 * pino({
 *   timestamp: sumoTimestamp,
 * })
 * ```
 */
 export function sumoTimestamp(): string {
    return `,"timestamp":"${Date.now()}"`
}

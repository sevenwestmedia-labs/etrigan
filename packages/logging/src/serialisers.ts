import express from 'express'
import { WithLoggingInfo } from '.'
import { LogObject } from 'typescript-log'

function asResValue(
    res: express.Response & { endTime: number },
): { statusCode: number; endTime: number } {
    return {
        statusCode: res.statusCode,
        endTime: res.endTime,
    }
}

function asReqValue(req: express.Request & WithLoggingInfo): LogObject {
    const logObj: LogObject = {
        id: req.requestId,
        method: req.method,
        url: req.originalUrl,
        startTime: req.startTime,
        headers: {
            // Our custom API client identifying headers
            'x-request-id': req.get('x-request-id'),
            Caller: req.get('Caller') || 'Not Specified',
        },
    }
    if (req.originalUrl !== req.url) {
        logObj.finalUrl = req.url
    }
    return logObj
}

export const serialisers = {
    req: asReqValue,
    res: asResValue,
}

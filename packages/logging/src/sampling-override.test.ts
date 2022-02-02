import express from "express"
import pino from "pino"
import { agent } from "supertest"
import { expressRequestLoggingMiddleware } from "./logging-middleware"

describe('Tests for samplingOverride', () => {
    const app = express()
    
    const log = pino(
        {
            level: 'debug',
            timestamp: false,
            base: {},
        },
    )

    const middleware = expressRequestLoggingMiddleware(log, {
        loggerSamplingOverride: {
            'app-login': {
                debugPercentage: 0,
                infoPercentage: 100,
            }
        },
        sampling: {
            infoPercentage: 1,
            debugPercentage: 1
        }
    })


    beforeAll(() => {
        app.use(middleware)

        app.get('/app-login', (req, res) => {
            const testLogs = ['Did you ever hear the tragedy of Darth Plagueis The Wise?', 'No.', 'I thought not - it\'s not a story that the Jedi would tell you.', 'It\'s a Sith legend.", "Darth Plageuis was a Dark Lord of the Sith, so powerful and wise...']
    
            req.log.info({
                log1: testLogs[0]
            }, 'Log 1')
    
            req.log.debug({
                log2: testLogs[1]
            }, 'Log 2')
    
            req.log.debug({
                log3: testLogs[2]
            }, 'Log 3')
    
            req.log.info({
                log4: testLogs[3]
            }, 'Log 4')
    
            return res.status(200).json({})
        })
    })

    it('Successfully overrides the default sampling percentage when an appropriate route is hit', async () => {
        await agent(app).get('/app-login')

        expect(true)
    })
})
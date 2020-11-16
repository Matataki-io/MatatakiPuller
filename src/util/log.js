// Dependencies
const log4js = require("log4js")

let SysTime = new Date()
let logTime = SysTime.getFullYear() + "-" + ("0" + (SysTime.getMonth() + 1)).slice(-2) + "-" + ("0" + SysTime.getDate()).slice(-2)
const coreLogFileName = `./logs/MatatakiPuller-${logTime}.log`

log4js.configure({
    appenders: {
        Core: { type: "file", filename: coreLogFileName },
        console: { type: "console" }
    },
    categories: {
        MatatakiPuller: { appenders: ["console", "Core"], level: "trace" },
        default: { appenders: ["console"], level: "trace" }
    }
})

let MatatakiPullerLogger = log4js.getLogger("MatatakiPuller")

function info(log) {
    MatatakiPullerLogger.info(log)
}

function trace(log) {
    MatatakiPullerLogger.trace(log)
}

function debug(log) {
    MatatakiPullerLogger.debug(log)
}

function warning(log) {
    MatatakiPullerLogger.warn(log)
}

function fatal(log) {
    MatatakiPullerLogger.fatal(log)
}

function level(lev) {
    MatatakiPullerLogger.level = lev
}

module.exports = {
    info,
    trace,
    debug,
    warning,
    fatal,
    level
}
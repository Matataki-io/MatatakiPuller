// Dependencies
const log4js = require('log4js')

const SysTime = new Date()
const logTime = SysTime.getFullYear() + '-' + ('0' + (SysTime.getMonth() + 1)).slice(-2) + '-' + ('0' + SysTime.getDate()).slice(-2)
const coreLogFileName = `./logs/MatatakiPuller-${logTime}.log`

log4js.configure({
  appenders: {
    Core: { type: 'file', filename: coreLogFileName },
    console: { type: 'console' }
  },
  categories: {
    MatatakiPuller: { appenders: ['console', 'Core'], level: 'trace' },
    default: { appenders: ['console'], level: 'trace' }
  }
})

const MatatakiPullerLogger = log4js.getLogger('MatatakiPuller')

/**
 * 信息/基本的 Log 日志输出
 * @param {any} log - 输出的内容
 */
function info (log) {
  MatatakiPullerLogger.info(log)
}

/**
 * 追踪/一些请求的信息和内容的 Log 日志输出
 * @param {any} log - 输出的内容
 */
function trace (log) {
  MatatakiPullerLogger.trace(log)
}

/**
 * 调试/断点使用的 Log 日志输出
 * @param {any} log - 输出的内容
 */
function debug (log) {
  MatatakiPullerLogger.debug(log)
}

/**
 * 警告/需要注意的 Log 日志输出
 * @param {any} log - 输出的内容
 */
function warning (log) {
  MatatakiPullerLogger.warn(log)
}

/**
 * 异常/错误抛出的 Log 日志输出
 * @param {any} log - 输出的内容
 */
function error (log) {
  MatatakiPullerLogger.error(log)
}

/**
 * 更改当前日志记录器的记录和输出等级
 * @param {String} lev - 可选参数是 info, trace, debug, warning, error
 */
function level (lev) {
  MatatakiPullerLogger.level = lev
}

module.exports = {
  info,
  trace,
  debug,
  warning,
  error,
  level
}

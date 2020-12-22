const { ReportErrorService } = require('../services/reportError')

class ReportErrorController {
  static async postError (ctx) {
    const body = JSON.parse(JSON.stringify(ctx.request.body))
    const res = await ReportErrorService.record(body.message)
    ctx.body = res
  }
}

module.exports = ReportErrorController

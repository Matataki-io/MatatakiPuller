const KoaRouter = require('koa-router')

const config = require('../../config/config')

const reportRouters = new KoaRouter()
const ReportErrorController = require('../controllers/reportError')

reportRouters.use(async (ctx, next) => {
  if (!ctx.request.headers.authorization) {
    ctx.status = 403
    return
  } else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
    ctx.status = 403
    return
  }
  await next()
})

reportRouters.post('/error', ReportErrorController.postError)

module.exports = reportRouters

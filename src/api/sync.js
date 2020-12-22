const KoaRouter = require('koa-router')

const config = require('../../config/config')

const syncRouters = new KoaRouter()
const SyncPostController = require('../controllers/syncPost')

syncRouters.use(async (ctx, next) => {
  if (!ctx.request.headers.authorization) {
    ctx.status = 403
    return
  } else if (ctx.request.headers.authorization.replace(/^Bearer./, '') !== config.apiToken) {
    ctx.status = 403
    return
  }
  await next()
})

syncRouters.post('/post/add', SyncPostController.postSyncPostAdd)
syncRouters.post('/post/delete', SyncPostController.postSyncPostDelete)

module.exports = syncRouters

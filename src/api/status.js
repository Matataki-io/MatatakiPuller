const KoaRouter = require('koa-router')
const StatusController = require('../controllers/status')
const { disassemble } = require('../util/cookie')

const status = new KoaRouter()

status.use(async (ctx, next) => {
  const accessToken = ctx.request.headers['x-access-token']
  if (accessToken) {
    ctx.user = disassemble(accessToken)
  }
  await next()
})

status.get('/timeline', StatusController.getStatus)

status.get('/subscriptions', StatusController.getStatusSubscriptionList)

status.get('/user-timeline/bilibili/:id', StatusController.getUserBilibiliTimeline)

module.exports = status

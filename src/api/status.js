const KoaRouter = require('koa-router')
const StatusController = require('../controllers/status')
const { disassemble } = require('../util/cookie')
const Log = require('../util/log')

const status = new KoaRouter()

status.use(async (ctx, next) => {
  const accessToken = ctx.request.headers['x-access-token']
  if (accessToken) {
    ctx.user = disassemble(accessToken)
  }
  try {
    await next()
  } catch (e) {
    e.name = 'Status API error ' + e.name
    Log.error(e)
    ctx.body = { code: 1, error: e.message }
  }
})

status.get('/timeline', StatusController.getStatus)

status.get('/all-timeline', StatusController.getAllStatus)

status.get('/user/timeline/:id', StatusController.getUserStatus)

status.get('/subscriptions', StatusController.getStatusSubscriptionList)

status.get('/user-timeline/:platform/:id', StatusController.getUserTimeline)

status.post('/interactive/:type', StatusController.createInteractiveEvent)

module.exports = status

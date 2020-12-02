const KoaRouter = require('koa-router')
const StatusController = require('../controllers/status')
const { disassemble } = require('../util/cookie')

let status = new KoaRouter()

status.use(async (ctx, next) => {
    const accessToken = ctx.request.headers['x-access-token']
    if (accessToken) {
        ctx.user = disassemble(accessToken)
    }
    await next()
})

status.get('/timeline', async (ctx, next) => {
    if (ctx.request.query.network === 'test') {
        const res = await StatusController.getStatusTest(ctx, next)
        ctx.body = res
    }
    else {
        const res = await StatusController.getStatus(ctx, next)
        ctx.body = res
    }
})

status.get('/subscriptions', async (ctx, next) => {
    if (ctx.request.query.network === 'test') {
        const res = await StatusController.getStatusSubscriptionListTest(ctx, next)
        ctx.body = res
    }
    else {
        const res = await StatusController.getStatusSubscriptionList(ctx, next)
        ctx.body = res
    }
})

module.exports = status
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

status.get('/timeline', StatusController.getStatus)

module.exports = status
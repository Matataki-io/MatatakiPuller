const KoaRouter = require('koa-router')

const routers = new KoaRouter()

const app = require('../api/app')

const status = require('../api/status')

routers.use('/app', app.routes(), app.allowedMethods())

routers.use('/status', status.routes(), status.allowedMethods())

module.exports = routers

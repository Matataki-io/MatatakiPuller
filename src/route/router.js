const KoaRouter = require('koa-router')

const routers = new KoaRouter()

const app = require('../api/app')

const status = require('../api/status')

const sync = require('../api/sync')

const report = require('../api/report')

routers.use('/app', app.routes(), app.allowedMethods())

routers.use('/status', status.routes(), status.allowedMethods())

routers.use('/sync', sync.routes(), sync.allowedMethods())

routers.use('/report', report.routes(), report.allowedMethods())

module.exports = routers

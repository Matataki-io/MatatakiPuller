const KoaRouter = require('koa-router')

let routers = new KoaRouter()

let app = require('../api/app')

let status = require('../api/status')

routers.use("/app", app.routes(), app.allowedMethods())

routers.use("/status", status.routes(), status.allowedMethods())

module.exports = routers

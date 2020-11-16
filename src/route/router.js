const KoaRouter = require('koa-router')

let routers = new KoaRouter()

let app = require('../api/app')

routers.use("/app", app.routes(), app.allowedMethods())

module.exports = routers
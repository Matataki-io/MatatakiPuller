// Init
let inTest = false
if (process.argv[2] === '--test') {
    inTest = true
    setTimeout(() => {
        process.exitCode = 0
        process.exit()
    }, 5000)
}

// Dependencies
const Koa = require('koa')
const KoaStatic = require('koa-static')
const KoaRouter = require('koa-router')
const koaBody = require('koa-body')

// Local Packages
const Log = require('./src/util/log')
const Global = require('./src/util/global')

let config = undefined
try {
    config = require('./config/config')
} 
catch(e) {
    Log.fatal(e)
    let err = new Error('请先根据 config.js.example 创建 config.js 文件')
    err.name = 'Configuration Error'
    throw err
}

let app = new Koa()
app.proxy = true

app.use(koaBody({ multipart: true }));

Global.Add('config', config)
const routers = require('./src/route/router.js')

// to Log
app.use(async (ctx, next) => {
    ctx.globalConfig = config
    await next();
    const rt = ctx.response.get('X-Response-Time');
    Log.info(`${ctx.request.ips} ${ctx.method} ${ctx.url} - ${rt}`);
});

app.use(async (ctx, next) => {
    ctx.set("Access-Control-Allow-Origin", ctx.headers['origin']);
    ctx.set("Access-Control-Allow-Credentials", true);
    ctx.set("Access-Control-Request-Method", "PUT,POST,GET,DELETE,OPTIONS");
    ctx.set(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, cc"
    );
    if (ctx.method === "OPTIONS") {
        ctx.status = 204;
        return;
    }
    await next();
});

let test = new KoaRouter()
test.get('/ping', async (ctx, next) => {
    ctx.body = "pong!"
    await next()
})
// x-response-time
app.use(async (ctx, next) => {
    const start = Date.now();
    await next();
    const ms = Date.now() - start;
    ctx.set('X-Response-Time', `${ms}ms`);
});

// Merge all routes
app.use(test.routes()).use(test.allowedMethods())
app.use(routers.routes()).use(routers.allowedMethods())

const { Bilibili } = require('./src/schedule/bilibili')
const { Twitter } = require('./src/schedule/twitter')

Bilibili()
Twitter()

app.use(KoaStatic('./public'))

app.listen(config.app.port)
Log.info("App 已经开始运行在 http://127.0.0.1:" + config.app.port)
if (inTest) Log.info("App 运行正常，测试成功")

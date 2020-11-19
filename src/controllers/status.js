const TimelineService = require('../services/timeline')

class StatusController {
    constructor() {}

    static async getStatus (ctx) {
        if (!ctx.user || !ctx.user.id) {
            ctx.status = 403
            return
        }
        const { page = 1, pagesize = 20 } = ctx.request.query
        console.log('请求的用户：', ctx.user)
        const res = await TimelineService.getSubscribedTimeline(ctx.user.id, parseInt(page), parseInt(pagesize))
        ctx.body = {
            code: 0,
            data: res
        }
    }
}

module.exports = StatusController
const { TimelineService } = require('../services/timeline')

class StatusController {
  static async getStatus (ctx) {
    if (!ctx.user || !ctx.user.id) {
      ctx.status = 403
      return
    }
    let { page = 1, pagesize = 20, filters } = ctx.request.query
    filters = filters ? JSON.parse(filters) : undefined
    console.log('请求的用户：', ctx.user)
    console.log('userId: ', ctx.user.id)
    const res = await TimelineService.getSubscribedTimeline(ctx.user.id, parseInt(page), parseInt(pagesize), filters)
    ctx.body = {
      code: 0,
      data: res
    }
  }

  static async getStatusSubscriptionList (ctx) {
    if (!ctx.user || !ctx.user.id) {
      ctx.status = 403
      return
    }
    console.log('请求的用户：', ctx.user)
    console.log('userId: ', ctx.user.id)
    const res = await TimelineService.getStatusSubscriptionList(ctx.user.id)
    ctx.body = {
      code: 0,
      data: res
    }
  }

  // start 请使用 dynamic_id_str， 而不是 dynamic_id
  static async getUserBilibiliTimeline (ctx) {
    const { start = 0 } = ctx.request.query
    const userId = parseInt(ctx.params.id)
    const res = await TimelineService.getUserBilibiliTimeline(userId, !isNaN(start) && start)
    return res
  }
}

module.exports = StatusController

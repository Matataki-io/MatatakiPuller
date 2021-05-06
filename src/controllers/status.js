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

  static async getAllStatus (ctx) {
    const userId = (ctx.user && ctx.user.id) || undefined
    let { page = 1, pagesize = 20, filters } = ctx.request.query
    filters = filters ? JSON.parse(filters) : undefined
    const res = await TimelineService.getAllTimeline(parseInt(page), parseInt(pagesize), userId, filters)
    ctx.body = {
      code: 0,
      data: res
    }
  }

  static async getUserStatus (ctx) {
    const userId = ctx.params.id
    let { page = 1, pagesize = 20, filters } = ctx.request.query
    filters = filters ? JSON.parse(filters) : undefined
    const res = await TimelineService.getUserTimeline(userId, parseInt(page), parseInt(pagesize), filters)
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
  static async getUserTimeline (ctx) {
    const { start = 0 } = ctx.request.query
    const { id, platform } = ctx.params
    let res = {}
    switch (platform) {
      case 'bilibili':
        res = await TimelineService.getUserBilibiliTimeline(parseInt(id), !isNaN(start) && start)
        break
      case 'mastodon':
        res = await TimelineService.getUserMastodonTimeline(parseInt(id), !isNaN(start) && start)
        break
      default:
        res = { code: 1151, error: 'unknown platform' }
    }
    ctx.body = res
  }

  static async createInteractiveEvent (ctx) {
    if (!ctx.user || !ctx.user.id) {
      ctx.status = 403
      return
    }
    const { type } = ctx.params
    const { platform, dynamicId } = ctx.request.body
    const res = await TimelineService.createInteractiveEvent(type, platform, dynamicId, ctx.user.id)
    ctx.body = {
      code: 0,
      data: res
    }
  }
}

module.exports = StatusController

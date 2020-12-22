const { SyncPostService } = require('../services/syncPost')

class SyncPostController {
  static async postSyncPostAdd (ctx) {
    const body = JSON.parse(JSON.stringify(ctx.request.body))
    const res = await SyncPostService.add(body)
    ctx.body = res
  }

  static async postSyncPostDelete (ctx) {
    const body = JSON.parse(JSON.stringify(ctx.request.body))
    const res = await SyncPostService.delete(body)
    ctx.body = res
  }
}

module.exports = SyncPostController

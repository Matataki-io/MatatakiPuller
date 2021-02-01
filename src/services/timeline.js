
const Mysql = require('../database/mysql')
const Axios = require('axios').default

const config = require('../../config/config')

const helper = require('../util/helper')

const notifyEvent = require('./notifyEvent')

class TimelineService {
  /** 获取动态订阅的时间线 */
  static async getSubscribedTimeline (userId, page = 1, pagesize = 20, filters) {
    if (filters && !filters.length) {
      return { count: 0, list: [], code: 1003, error: 'Filter item cannot be empty' }
    }

    const follows = await this.getFollowUserIdAndTwitter(userId)
    if (!follows || !follows.length) {
      return { count: 0, list: [], code: 1001, error: 'Follow is empty' }
    }

    const initWhereStr = (platformStr, usersValue) => {
      return `(t1.platform = '${platformStr}' AND t1.platform_user IN(${this.createValueList(usersValue)}))`
    }

    let whereStr = ''

    let matatakiUsers = []
    if (!filters || filters.includes('matataki')) {
      matatakiUsers = follows.map(follow => follow.fuid)
      matatakiUsers.push(userId)
      if (matatakiUsers && matatakiUsers.length) whereStr += (whereStr ? ' OR ' : '') + initWhereStr('matataki', matatakiUsers)
    }
    console.log('matatakiUsers:', matatakiUsers)

    let twitterUsers = []
    if (!filters || filters.includes('twitter')) {
      twitterUsers = follows.filter(follow => follow.twitter_name).map(follow => follow.twitter_name)
      if (twitterUsers && twitterUsers.length) whereStr += (whereStr ? ' OR ' : '') + initWhereStr('twitter', twitterUsers)
    }

    let bilibiliUsers = []
    if (!filters || filters.includes('bilibili')) {
      bilibiliUsers = (await this.getFollowBilibiliByUsesrId(follows.map(follow => follow.fuid))).map(item => item.userId)
      if (bilibiliUsers && bilibiliUsers.length) whereStr += (whereStr ? ' OR ' : '') + initWhereStr('bilibili', bilibiliUsers)
    }

    let mastodonUsers = []
    if (!filters || filters.includes('mastodon')) {
      mastodonUsers = (await this.getFollowMastodonByUsesrId(follows.map(follow => follow.fuid))).map(item => item.userId + '@' + item.domain.replace(/^(https?:\/\/)/gm, ''))
      if (mastodonUsers && mastodonUsers.length) whereStr += (whereStr ? ' OR ' : '') + initWhereStr('mastodon', mastodonUsers)
    }

    const queryValues = [...matatakiUsers, ...twitterUsers, ...bilibiliUsers, ...mastodonUsers]

    if (!queryValues || !queryValues.length) {
      return { count: 0, list: [], code: 1002, error: 'The user you follow does not bind the required social account' }
    }

    const limitValues = [(page - 1) * pagesize, pagesize]

    const sql = `
      SELECT t1.*, COUNT(t2.id) AS 'like', IF(t3.id, 1, 0) AS 'liked'
        FROM platform_status_cache t1
      LEFT JOIN platform_status_spread t2
        ON t2.type = 0 AND t2.platform_id = t1.id
      LEFT JOIN platform_status_spread t3
        ON t3.user_id = ? AND t3.type = 0 AND t3.platform_id = t1.id
      WHERE ${whereStr}
      GROUP BY t1.id
      ORDER BY timestamp DESC
      LIMIT ?, ?;

      SELECT COUNT(1) as count
        FROM platform_status_cache t1
      WHERE ${whereStr};
    `
    const res = await Mysql.cache.query(sql, [userId, ...queryValues, ...limitValues, ...queryValues])

    // 筛选搜索结果中的 matataki 文章并获取文章的具体数据
    const posts = await this.getMatatakiPost(res[0].filter(item => item.platform === 'matataki').map(item => Number(item.data) || 0))
    posts.forEach(post => {
      const index = res[0].findIndex(item => item.platform === 'matataki' && Number(item.data) === post.id)
      if (index !== -1) {
        res[0][index].data = JSON.stringify(post)
      }
    })

    return {
      count: res[1][0].count,
      list: res[0]
    }
  }

  /** 获取我订阅了动态的用户列表 */
  static async getStatusSubscriptionList (userId) {
    const sql = `
      SELECT
        t1.fuid as id,
        t2.account as twitter_name,
        t3.username,
        t3.nickname,
        t3.avatar,
        t3.introduction
      FROM follows t1
      LEFT JOIN user_accounts t2
        ON t2.uid = t1.fuid AND t2.platform = 'twitter'
      LEFT JOIN users t3
        ON t3.id = t1.fuid
      WHERE t1.uid = ? AND t1.status = 1;
    `

    const follows = await Mysql.matataki.query(sql, [userId])

    const bilibiliUesrs = await this.getFollowBilibiliByUsesrId(follows.map(follow => follow.id))
    const mastodonUesrs = await this.getFollowMastodonByUsesrId(follows.map(follow => follow.id))

    return follows.map(follow => {
      const bilibiliId = { ...bilibiliUesrs.find(bUser => parseInt(bUser.id) === follow.id) }.userId
      const mastodonUesr = mastodonUesrs.find(mUser => parseInt(mUser.id) === follow.id)
      return {
        ...follow,
        bilibili_id: bilibiliId || null,
        mastodon_uesr: mastodonUesr ? { id: mastodonUesr.userId, domain: mastodonUesr.domain, username: mastodonUesr.username } : null
      }
    }).filter(follow => follow.bilibili_id || follow.twitter_name)
  }

  static async getFollowUserIdAndTwitter (userId) {
    const sql = `
      SELECT
        t1.fuid,
        t2.account as twitter_name
      FROM follows t1
      LEFT JOIN user_accounts t2
        ON t2.uid = t1.fuid AND t2.platform = 'twitter'
      WHERE t1.uid = ? AND t1.status = 1;
    `

    const res = await Mysql.matataki.query(sql, [userId])
    return res
  }

  static async getFollowBilibiliByUsesrId (userIds) {
    try {
      const res = await Axios.post(
        config.auth.api + '/user/info/bilibili',
        {
          list: userIds
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiToken}`
          }
        }
      )
      return res.data
    } catch (e) {
      console.error('获取不到已关注的B站用户列表')
      return []
    }
  }

  static async getFollowMastodonByUsesrId (userIds) {
    try {
      const res = await Axios.post(
        config.auth.api + '/user/info/mastodon',
        {
          list: userIds
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiToken}`
          }
        }
      )
      return res.data
    } catch (e) {
      console.error('获取不到已关注的 Mastodon 用户列表')
      return []
    }
  }

  static createValueList (list) {
    let str = ''
    list.forEach(item => {
      str += (str ? ',' : '') + '?'
    })
    return str
  }

  static async getMatatakiPost (postIds) {
    if (!postIds || !postIds.length) return []

    const sql = `
      SELECT
        a.id, a.uid, a.author, a.title, a.status, a.hash, a.create_time, a.cover, a.require_holdtokens, a.require_buy, a.short_content, a.is_recommend, a.channel_id,
        b.nickname, b.avatar, b.is_recommend AS user_is_recommend,
        c.real_read_count AS \`read\`, c.likes,
        t5.platform as pay_platform, t5.symbol as pay_symbol, t5.price as pay_price, t5.decimals as pay_decimals, t5.stock_quantity as pay_stock_quantity,
        t7.id as token_id, t6.amount as token_amount, t7.name as token_name, t7.symbol as token_symbol, t7.decimals  as token_decimals

      FROM posts a
      LEFT JOIN users b ON a.uid = b.id
      LEFT JOIN post_read_count c ON a.id = c.post_id
      LEFT JOIN product_prices t5
        ON a.id = t5.sign_id AND t5.category = 0
      LEFT JOIN post_minetokens t6
        ON a.id = t6.sign_id
      LEFT JOIN minetokens t7
        ON t7.id = t6.token_id

      WHERE a.channel_id IN(1, 3)
        AND a.\`status\` = 0
        AND a.id IN(${this.createValueList(postIds)})`
    const posts = await Mysql.matataki.query(sql, [...postIds])

    // 这部分是关于动态的附加处理
    const shareList = posts.filter(item => item.channel_id === 3)
    const shareIds = shareList.map(item => item.id)
    const id2posts = {}
    shareList.forEach(item => {
      item.refs = []
      item.beRefs = []
      item.media = []
      id2posts[item.id] = item
    })

    const refResult = await this.getRef(shareIds)
    const refs = refResult[0]
    const beRefs = refResult[1]
    // 引用
    for (let i = 0; i < refs.length; i++) {
      const id = refs[i].sign_id
      id2posts[id] && id2posts[id].refs.push(refs[i])
    }
    // 被引用
    for (let i = 0; i < beRefs.length; i++) {
      const id = beRefs[i].ref_sign_id
      id2posts[id] && id2posts[id].beRefs.push(beRefs[i])
    }
    // 媒体
    const mediaList = await this.getMedia(shareIds)
    for (let i = 0; i < mediaList.length; i++) {
      const id = mediaList[i].post_id
      id2posts[id] && id2posts[id].media.push(mediaList[i])
    }

    // Frank - 这里要展开屏蔽邮箱地址的魔法了
    const emailMask = helper.emailMask
    const list = posts.map(post => {
      const author = emailMask(post.author)
      return { ...post, author }
    })

    // 返回用户是否发币
    // const listFormat = await this.service.token.mineToken.formatListReturnTokenInfo(list, 'uid');

    return list
  }

  static async getRef (postids) {
    if (!postids || !postids.length) return [[], []]
    const refResult = await Mysql.matataki.query(
      `SELECT t1.sign_id, t1.ref_sign_id, t1.url, t1.title, t1.summary, t1.cover, t1.create_time, t1.number,
      t2.channel_id,
      t3.username, t3.nickname, t3.platform, t3.avatar, t3.id uid,
      t4.real_read_count, t4.likes, t4.dislikes,
      t5.platform as pay_platform, t5.symbol as pay_symbol, t5.price as pay_price, t5.decimals as pay_decimals, t5.stock_quantity as pay_stock_quantity,
      t7.id as token_id, t6.amount as token_amount, t7.name as token_name, t7.symbol as token_symbol, t7.decimals  as token_decimals
      FROM post_references t1
      LEFT JOIN posts t2
      ON t1.ref_sign_id = t2.id
      LEFT JOIN users t3
      ON t2.uid = t3.id
      LEFT JOIN post_read_count t4
      ON t1.ref_sign_id = t4.post_id
      LEFT JOIN product_prices t5
      ON t1.ref_sign_id = t5.sign_id AND t5.category = 0
      LEFT JOIN post_minetokens t6
      ON t1.ref_sign_id = t6.sign_id
      LEFT JOIN minetokens t7
      ON t7.id = t6.token_id
      WHERE t1.sign_id IN (${this.createValueList(postids)}) AND t1.status = 0;

      SELECT t1.sign_id, t1.ref_sign_id, t1.create_time, t1.number,
      t2.channel_id, t2.title, t2.short_content AS summary, t2.cover,
      t3.username, t3.nickname, t3.platform, t3.avatar, t3.id uid,
      t4.real_read_count, t4.likes, t4.dislikes,
      t5.platform as pay_platform, t5.symbol as pay_symbol, t5.price as pay_price, t5.decimals as pay_decimals, t5.stock_quantity as pay_stock_quantity,
      t7.id as token_id, t6.amount as token_amount, t7.name as token_name, t7.symbol as token_symbol, t7.decimals  as token_decimals
      FROM post_references t1
      LEFT JOIN posts t2
      ON t1.sign_id = t2.id
      LEFT JOIN users t3
      ON t2.uid = t3.id
      LEFT JOIN post_read_count t4
      ON t1.sign_id = t4.post_id
      LEFT JOIN product_prices t5
      ON t1.sign_id = t5.sign_id AND t5.category = 0
      LEFT JOIN post_minetokens t6
      ON t1.sign_id = t6.sign_id
      LEFT JOIN minetokens t7
      ON t7.id = t6.token_id
      WHERE t1.ref_sign_id IN (${this.createValueList(postids)}) AND t1.status = 0;`,
      [...postids, ...postids]
    )
    return refResult
  }

  // offsetDynamicId 请使用 dynamic_id_str， 而不是 dynamic_id
  static async getUserBilibiliTimeline (userId, offsetDynamicId) {
    if (!userId || isNaN(userId)) {
      return { code: 1152, error: 'unknown userId' }
    }
    try {
      const biliUsers = await this.getFollowBilibiliByUsesrId([userId])
      if (!biliUsers || !biliUsers.length) return { code: 1100, error: 'Unbound bilibili' }

      const res = await Axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${biliUsers[0].userId}&offset_dynamic_id=${offsetDynamicId || 0}&need_top=1`)
      return { data: { count: 0, uuid: biliUsers[0].userId, list: res.data.data.cards || [] }, code: 0 }
    } catch (e) {
      console.error(`用户:${userId} 的B站时间线获取失败，错误信息：`, e)
      return { code: 1101, error: 'unknown mistake' }
    }
  }

  // offsetDynamicId 请使用 dynamic_id_str， 而不是 dynamic_id
  static async getUserMastodonTimeline (userId, maxId) {
    if (!userId || isNaN(userId)) {
      return { code: 1152, error: 'unknown userId' }
    }
    try {
      const users = await this.getFollowMastodonByUsesrId([userId])
      if (!users || !users.length) return { code: 1100, error: 'Unbound mastodon' }

      const res = await Axios.get(`${users[0].domain}/api/v1/accounts/${users[0].userId}/statuses?exclude_replies=true${maxId ? '&max_id=' + maxId : ''}`)
      const user = { id: users[0].userId, domain: users[0].domain, username: users[0].username }
      return { data: { count: 0, user, list: res.data || [] }, code: 0 }
    } catch (e) {
      console.error(`用户:${userId} 的 Mastodon 时间线获取失败，错误信息：`, e)
      return { code: 1101, error: 'unknown mistake' }
    }
  }

  // 根据平台方的用户 ID 获取对应的 Matataki 用户 ID
  static async getUserIdByPlatformId (platform, id) {
    try {
      const res = await Axios.get(`${config.auth.api}/user/platforminfo?platform=${platform}&userId=${id}`, {
        headers: {
          Authorization: `Bearer ${config.apiToken}`
        }
      })
      if (res.data.code) {
        console.error(res.data.message)
        return null
      }
      return (res.data && parseInt(res.data.id)) || 0
    } catch (e) {
      console.error(e)
    }
  }

  /** 记录动态时间轴内动态的互动事件，目前只支持“like” */
  static async createInteractiveEvent (type, platform, dynamicId, userId) {
    const typeList = ['like']
    if (!typeList.includes(type)) return false
    // 这个查询语语句会对同一个用户的重复操作进行去重，如果数据条目已存在返回 false
    const sql = `
      SET @platform = ?;
      SET @dynamicId = ?;
      SET @userId = ?;
      SET @type = ?;

      INSERT INTO platform_status_spread
        (platform_id, platform, user_id, type)
      SELECT
        CONCAT(@platform, "_", @dynamicId), @platform, @userId, @type
      WHERE NOT EXISTS (
        SELECT 1 FROM platform_status_spread
        WHERE platform_id = CONCAT(@platform, "_", @dynamicId)
        AND user_id = @userId
        AND type = @type
      );
    `
    const res = await Mysql.cache.query(sql, [
      platform,
      dynamicId,
      userId,
      typeList.indexOf(type)
    ])

    // this.sendInteractiveNotifyEvent(userId, platform, dynamicId, type)
    return res[res.length - 1].affectedRows > 0
  }

  static async getMedia (ids) {
    if (!ids || !ids.length) return []
    const sql = `SELECT * FROM dynamic_media WHERE post_id IN(${this.createValueList(ids)});`
    const res = await Mysql.matataki.query(sql, ids)
    return res
  }

  /** 创建动态互动事件的通知 */
  static async sendInteractiveNotifyEvent (userId, platform, dynamicId, action) {
    const sql = `
      SELECT *
        FROM platform_status_cache
      WHERE id = CONCAT(?, "_", ?) AND platform = ?;
    `
    const dynamicRes = await Mysql.cache.query(sql, [platform, dynamicId, platform])
    if (!dynamicRes || !dynamicRes.length) return
    const dynamic = dynamicRes[0]
    const recipient = await this.getUserIdByPlatformId(dynamic.platform, dynamic.platform_user)
    const res = await notifyEvent.sendEvent(userId, [recipient], action, dynamic.uuid, 'platformDynamics', undefined, true)
    console.log('通知发布结果：', res)
    return res
  }
}

module.exports = {
  TimelineService
}

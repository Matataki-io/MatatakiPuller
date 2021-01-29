const Mysql = require('../database/mysql')
const Log = require('../util/log')
const moment = require('moment')

// 表
const EVENT_TABLE = 'notify_event'
const EVENT_RECIPIENT_TABLE = 'notify_event_recipients'

/** 行为类型 */
const ACTION_TYPES = [
  'comment', // 评论
  'like', // 点赞
  'reply', // 回复
  'follow', // 关注
  'annouce', // 宣布
  'transfer' // 转账
]

/** 对象类型 */
const OBJECT_TYPES = [
  'article', // 文章
  'user', // 用户
  'comment', // 评论
  'announcement', // 公告
  'announcementToken', // 引用内容为Fan票的公告
  'tokenWallet', // Token 钱包
  'cnyWallet', // CNY 钱包
  'collaborator', // 协作者
  'platformDynamics' // 聚合动态
]

const isValidActionAndObject = (action, objectType) => {
  const res = ACTION_TYPES.includes(action) && OBJECT_TYPES.includes(objectType)
  if (!res) console.error(`不支持的消息事件参数：action:${action}, objectType:${objectType}`)
  return res
}

class notifyEventService {
  /**
   * 创建一个事件
   * @uid 产生这个事件的用户
   * @action 用户所做的行为
   * @objectId 对象的索引
   * @objectType 行为所作用对象的类型
   * @remark 【可选】补充信息
   * @return 事件在数据库中的索引
   */
  static async createEvent (uid, action, objectId, objectType, remark) {
    if (!isValidActionAndObject(action, objectType)) return false

    const sql = `
      INSERT INTO ${EVENT_TABLE}
        (user_id, action, object_id, object_type, remark, create_time)
      VALUES (?, ?, ?, ?, ?, ?);
    `
    const result = await Mysql.matataki.query(sql, [
      uid,
      action,
      objectId,
      objectType,
      remark,
      moment().format('YYYY-MM-DD HH:mm:ss')
    ])
    return result.insertId
  }

  /**
   * 设定事件的接收者 (一个事件多个接收者)
   * @eventId 事件在数据库中的索引
   * @uids 事件接收者列表
   */
  static async setEventRecipients (eventId, uids) {
    if (!uids || uids.length < 1) return false
    try {
      let valStr = ''
      const recipients = []
      uids.forEach(uid => {
        const entryVal = [eventId, uid]
        recipients.push(...entryVal)
        valStr += (valStr ? ', ' : '') + `(${this.createValueList(entryVal)})`
      })

      const sql = `
        INSERT INTO ${EVENT_RECIPIENT_TABLE}
          (event_id, user_id)
        VALUES ${valStr};
      `
      const result = await Mysql.matataki.query(sql, recipients)
      return result.affectedRows
    } catch (e) {
      Log.error(e)
      return false
    }
  }

  /**
   * 发送一个事件 (整合了创建事件与设定接收者)
   * @senderId 产生这个事件的用户
   * @receivingIds 事件接收者的列表
   * @action 用户所做的行为
   * @objectId 对象的索引
   * @objectType 行为所作用对象的类型
   * @remark 【可选】补充信息
   * @noDuplication 【默认：true】避免重复。开启时，如果参数相同的事件已经存在，将不会创建新事件。
   */
  static async sendEvent (senderId, receivingIds, action, objectId, objectType, remark, noDuplication = true) {
    // 过滤接收者和发送者相同的情况
    receivingIds = receivingIds.filter(userId => userId && userId !== senderId)
    if (receivingIds.length === 0) {
      Log.warning('notifyEvent.sendEvent：不存在有效的事件接收者')
      return true
    }
    // 参数相同的事件如果已经存在了，就不会在创建新的
    if (noDuplication) {
      const sql = `
        SELECT 1 FROM ${EVENT_TABLE}
        WHERE
          user_id = ?
          AND action = ?
          AND object_id = ?
          AND object_type = ?
          ${remark ? 'AND remark = ?' : ''};
      `
      const existing = await Mysql.matataki.query(sql, [
        senderId,
        action,
        objectId,
        objectType,
        remark
      ])
      if (existing.length > 0) return false
    }

    // 创建事件
    const eventId = await this.createEvent(senderId, action, objectId, objectType, remark)
    if (!eventId) return false
    // 设定事件的接收者
    const result = await this.setEventRecipients(eventId, receivingIds)
    return result > 0
  }

  static createValueList (list) {
    let str = ''
    list.forEach(item => {
      str += (str ? ',' : '') + '?'
    })
    return str
  }
}

module.exports = notifyEventService

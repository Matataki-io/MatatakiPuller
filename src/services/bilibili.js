const Mysql = require('../database/mysql')
const moment = require('moment')

const Log = require('../util/log')

const PLATFORM = 'bilibili'

class BilibiliService {
  static async addStatusList (statusList) {
    let valuesSql = ''
    const valuesData = []
    for (let i = 0; i < statusList.length; i++) {
      const { desc, card } = statusList[i]
      const jsonData = JSON.stringify({ desc, card })
      if (jsonData.length > 10239) {
        Log.warning(`存入 ${PLATFORM} 动态时遇到过大的 Data JSON，id: ${desc.dynamic_id}`)
        continue
      }
      valuesData.push(
        PLATFORM + '_' + desc.dynamic_id,
        PLATFORM,
        desc.uid,
        desc.uid,
        desc.user_profile.info.uname,
        moment(Math.round(Number(desc.timestamp) * 1000)).format('YYYY-MM-DD HH:mm:ss'),
        jsonData
      )
      valuesSql += (valuesSql ? ',' : '') + '(?, ?, ?, ?, ?, ?, ?)'
    }
    if (!valuesSql) return null
    const sql = `
            INSERT INTO platform_status_cache
                (id, platform, platform_user, platform_user_id, platform_username, timestamp, data)
            VALUES
                ${valuesSql}
            ON DUPLICATE KEY UPDATE
                data = VALUES(data);
        `

    const res = await Mysql.cache.query(sql, valuesData)
    Log.debug('Bilibili 数据库返回的结果：' + JSON.stringify(res))
    return res
  }
}

module.exports = BilibiliService

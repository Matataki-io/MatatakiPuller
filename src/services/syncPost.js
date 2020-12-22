const Log = require('../util/log')
const Mysql = require('../database/mysql')

class SyncPostService {
  static async add (data) {
    let valuesSql = ''
    const valuesData = []
    valuesData.push(
      'matataki_' + data.id,
      'matataki',
      data.uid,
      data.uid,
      null,
      data.timestamp,
      data.id
    )
    valuesSql += (valuesSql ? ',' : '') + '(?, ?, ?, ?, ?, ?, ?)'

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
    Log.debug('数据库返回的结果：' + JSON.stringify(res))
    return res
  }

  static async delete (data) {
    const res = await Mysql.cache.query(`DELETE FROM platform_status_cache WHERE platform = 'matataki' AND id = 'matataki_${data.id}';`)
    console.log(res)
    return res
  }
}

module.exports = {
  SyncPostService
}

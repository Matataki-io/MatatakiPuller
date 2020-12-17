const mysql = require('mysql')
const config = require('../../config/config')

const cachePool = mysql.createPool(config.mysql.cache)
const matatakiPool = mysql.createPool(config.mysql.matataki)

const cache = {
  query (sql, values) {
    return new Promise((resolve, reject) => {
      cachePool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        } else {
          connection.query(sql, values, (err, rows) => {
            if (err) {
              reject(err)
            } else {
              resolve(rows)
            }
            connection.release()
          })
        }
      })
    })
  }
}

const matataki = {
  query (sql, values) {
    return new Promise((resolve, reject) => {
      matatakiPool.getConnection((err, connection) => {
        if (err) {
          reject(err)
        } else {
          connection.query(sql, values, (err, rows) => {
            if (err) {
              reject(err)
            } else {
              resolve(rows)
            }
            connection.release()
          })
        }
      })
    })
  }
}

module.exports = {
  cache,
  matataki
}

const mysql = require('mysql')
const config = require('../../config/config')

let cachePool = mysql.createPool(config.mysql.cache)

let query = (sql, values) => {
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

module.exports = {
    query
}
const mysql = require('mysql')
const config = require('../../config/config')

let cachePool = mysql.createPool(config.mysql.cache)
let matatakiPool = mysql.createPool(config.mysql.matataki)

let cache = {
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

let matataki = {
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
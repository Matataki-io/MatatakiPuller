const Axios = require('axios').default

const Log = require('../util/log')
const Scheduler = require('./index')
const Mysql = require('../database/mysql')

let getDynamicByID = async (option) => {
    Log.debug(option)
    const res = await Axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=13297724&offset_dynamic_id=0&need_top=1`)
    console.log(res.data.data)

    // res.data.data.next_offset 是下一次起始点
    // 这个值等效于 res.data.data.cards.pop().desc.dynamic_id_str
    // Mysql.query 是语句
    // 记得配置本地 config/config.js

    // Mysql.query()
}

let Bilibili = async () => {
    // 初始化轮询进程列表
    const getDynamicByIDScheduler = new Scheduler(getDynamicByID, { id: '13297724' }, 10000)

    getDynamicByIDScheduler.on('runOnce', () => {
        // Log.debug('getDynamicByID ran once')
    })
}

module.exports = {
    Bilibili
}
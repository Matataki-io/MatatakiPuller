const Axios = require('axios').default

const Log = require('../util/log')
const Scheduler = require('./index')
const bilibiliService = require('../services/bilibili')

let getDynamicByID = async () => {
    const list = await Axios.get(`https://auth.matataki.io/api/user/info/bilibili`)
    try {
        list.data.forEach(async item => {
            if (!item.available) return
            const res = await Axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${item.userId}&offset_dynamic_id=0&need_top=1`)
            bilibiliService.addStatusList(res.data.data.cards)
        })
    }
    catch(e) {
        console.error(e)
    }
}

let Bilibili = async () => {
    // 初始化轮询进程列表
    const getDynamicByIDScheduler = new Scheduler(getDynamicByID, undefined, 60000)
    getDynamicByIDScheduler.start()
}

module.exports = {
    Bilibili
}
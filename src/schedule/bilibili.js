const Axios = require('axios').default

const Log = require('../util/log')
const Scheduler = require('./index')
const bilibiliService = require('../services/bilibili')

let getDynamicByID = async (option) => {
    const res = await Axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${option.id}&offset_dynamic_id=0&need_top=1`)
    bilibiliService.addStatusList(res.data.data.cards)
}

let Bilibili = async () => {
    // 初始化轮询进程列表
    const getDynamicByIDScheduler = new Scheduler(getDynamicByID, { id: '13297724' }, 10000)
    // getDynamicByIDScheduler.start()
}

module.exports = {
    Bilibili
}
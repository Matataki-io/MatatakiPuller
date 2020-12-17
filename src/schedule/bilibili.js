const Axios = require('axios').default

const config = require('../../config/config')
const Scheduler = require('./index')
const bilibiliService = require('../services/bilibili')

const getDynamicByID = async () => {
  const list = await Axios.get(`${config.auth.api}/user/info/bilibili`, { headers: { Authorization: `Bearer ${config.apiToken}` } })
  try {
    list.data.forEach(async item => {
      const res = await Axios.get(`https://api.vc.bilibili.com/dynamic_svr/v1/dynamic_svr/space_history?host_uid=${item.userId}&offset_dynamic_id=0&need_top=1`)
      bilibiliService.addStatusList(res.data.data.cards)
    })
  } catch (e) {
    console.error(e)
  }
}

const Bilibili = async () => {
  // 初始化轮询进程列表
  const getDynamicByIDScheduler = new Scheduler(getDynamicByID, undefined, 3600000)
  getDynamicByIDScheduler.start()
}

module.exports = {
  Bilibili
}

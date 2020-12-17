/* eslint-disable */
const Axios = require('axios').default

const Log = require('../util/log')
const config = require('../../config/config')
const Scheduler = require('./index')
const mastodonService = require('../services/mastodon')

const getStatusByID = async () => {
  const list = await Axios.get(`${config.auth.api}/user/info/mastodon`, { headers: { Authorization: `Bearer ${config.apiToken}` } })
  try {
    list.data.forEach(async item => {
      const res = await Axios.get(`${item.doamin}/api/v1/accounts/${item.userId}/statuses`)
      mastodonService.addStatusList(res.data)
    })
  } catch (e) {
    console.error(e)
  }
}

const Bilibili = async () => {
  // 初始化轮询进程列表
  // const getDynamicByIDScheduler = new Scheduler(getStatusByID, undefined, 3600000)
  // getDynamicByIDScheduler.start()
}

module.exports = {
  Bilibili
}

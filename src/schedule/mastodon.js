const Axios = require('axios').default

const config = require('../../config/config')
const Scheduler = require('./index')
const mastodonService = require('../services/mastodon')

const getStatusByID = async () => {
  const list = await Axios.get(`${config.auth.api}/user/info/mastodon`, { headers: { Authorization: `Bearer ${config.apiToken}` } })
  // console.log(list.data)
  try {
    list.data.forEach(async item => {
      let res = {}
      try {
        res = await Axios.get(`${item.domain}/api/v1/accounts/${item.userId}/statuses`)
        mastodonService.addStatusList(res.data, item.domain)
      } catch (e) {
        console.error(e)
      }
    })
  } catch (e) {
    console.error(e)
  }
}

const Mastodon = async () => {
  // 初始化轮询进程列表
  const getStatusByIDScheduler = new Scheduler(getStatusByID, undefined, 10000)
  getStatusByIDScheduler.start()
}

module.exports = {
  Mastodon
}

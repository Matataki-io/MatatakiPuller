const Log = require('../util/log')
const config = require('../../config/config')
const Scheduler = require('./index')
const codebird = require('../lib/codebird')
const twitterService = require('../services/twitter')

const getStatusByID = async () => {
  // eslint-disable-next-line new-cap
  const cb = new codebird()
  cb.setUseProxy(true)
  cb.setConsumerKey(config.twitter.key, config.twitter.secret)
  const list = await twitterService.getUserList()

  list.forEach(async item => {
    await new Promise((resolve, reject) => {
      cb.__call('statuses_userTimeline',
        {
          screen_name: item.account,
          exclude_replies: 1
        }, function (reply, rate, err) {
          if (err) {
            reject(new Error('error response or timeout exceeded' + err.error))
            return
          }
          if (reply) {
            resolve(reply)
            return
          }
          reject(new Error('reply is empty'))
        })
    }).then(reply => { twitterService.addStatusList(reply) }).catch(err => Log.error(err))
  })
}

const Twitter = async () => {
  // 初始化轮询进程列表
  const getStatusByIDScheduler = new Scheduler(getStatusByID, undefined, 150000)
  getStatusByIDScheduler.start()
}

module.exports = {
  Twitter
}

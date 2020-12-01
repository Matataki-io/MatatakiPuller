const Axios = require('axios').default

const Log = require('../util/log')
const config = require('../../config/config')
const Scheduler = require('./index')
const codebird = require('../lib/codebird')
const twitterService = require('../services/twitter')

let getStatusByID = async () => {
    const cb = new codebird()
    cb.setUseProxy(true)
    cb.setConsumerKey(config.twitter.key, config.twitter.secret)
    const list = await twitterService.getUserList()
    
    list.forEach(async item => {
        const reply = await new Promise((resolve, reject) => {
            cb.__call("statuses_userTimeline",
            {
                screen_name: item.account,
                exclude_replies: 1
            }, function (reply, rate, err) {
                if (err) {
                    reject('error response or timeout exceeded' + err.error)
                    return
                }
                if (reply) {
                    resolve(reply)
                    return
                }
                reject('reply is empty')
            })
        }).then(reply => { twitterService.addStatusList(reply) }).catch(err => Log.fatal(err))
    })
}

let getStatusByIDTest = async () => {
    const cb = new codebird()
    cb.setUseProxy(true)
    cb.setConsumerKey(config.twitter.key, config.twitter.secret)
    const list = await twitterService.getUserListTest()
    
    list.forEach(async item => {
        const reply = await new Promise((resolve, reject) => {
            cb.__call("statuses_userTimeline",
            {
                screen_name: item.account,
                exclude_replies: 1
            }, function (reply, rate, err) {
                if (err) {
                    reject('error response or timeout exceeded' + err.error)
                    return
                }
                if (reply) {
                    resolve(reply)
                    return
                }
                reject('reply is empty')
            })
        }).then(reply => { twitterService.addStatusListTest(reply) }).catch(err => Log.fatal(err))
    })
}

let Twitter = async () => {
    // 初始化轮询进程列表
    const getStatusByIDScheduler = new Scheduler(getStatusByID, undefined, 150000)
    getStatusByIDScheduler.start()

    // 初始化轮询进程列表
    const getStatusByIDTestScheduler = new Scheduler(getStatusByIDTest, undefined, 150000)
    getStatusByIDTestScheduler.start()
}

module.exports = {
    Twitter
}

const Mysql = require('../database/mysql')
const Axios = require('axios').default

const config = require('../../config/config')

class TimelineService {
    constructor() {}

    static async getSubscribedTimeline (userId, page = 1, pagesize = 20) {
        const follows = await this.getFollowUserIdAndTwitter(userId)
        if (!follows || !follows.length) {
            return { count: 0, list: [], code: 1001, error: 'Follow is empty' }
        }

        const bilibiliUesrs = await this.getFollowBilibiliByUsesrId(follows.map(follow => follow.fuid)).map(item => item.userId)
        const twitterUsesrs = follows.filter(follow => follow.twitter_name).map(follow => follow.twitter_name)
        const queryValues = [ ...bilibiliUesrs, ...twitterUsesrs ]
        console.log('最后参与查询的数据：', queryValues)

        if (!queryValues || !queryValues.length) {
            return { count: 0, list: [], code: 1002, error: 'Followers have no social accounts' }
        }

        const limitValues = [(page - 1) * pagesize, pagesize]

        const sqlBase = `
            platform_status_cache
            WHERE platform_user IN(${this.createValueList(queryValues)})
            ORDER BY timestamp DESC
        `
        const sql = `SELECT * FROM ${sqlBase} LIMIT ?, ?; SELECT COUNT(1) as count FROM ${sqlBase};`

        const res = await Mysql.cache.query(sql, [ ...queryValues, ...limitValues, ...queryValues])
        console.log('数据库查询结果：', { count: res[1][0].count, list: res[0] })
        return {
            count: res[1][0].count,
            list: res[0]
        }
    }

    static async getStatusSubscriptionList (userId) {
        const sql = `
            SELECT
                t1.fuid as id,
                t2.account as twitter_name,
                t3.username,
                t3.nickname,
                t3.avatar,
                t3.introduction
            FROM follows t1
            LEFT JOIN user_accounts t2
                    ON t2.uid = t1.fuid AND t2.platform = 'twitter'
            LEFT JOIN users t3
                    ON t3.id = t1.fuid
            WHERE t1.uid = ? AND t1.status = 1;
        `;

        const follows = await Mysql.matataki.query(sql, [userId]);

        const bilibiliUesrs = await this.getFollowBilibiliByUsesrId(follows.map(follow => follow.id));

        return follows.map(follow => {
            const bilibiliId = { ...bilibiliUesrs.find(bUser => bUser.id === follow.id) }.userId;
            return {
                ...follow,
                bilibili_id: bilibiliId || null
            };
        }).filter(follow => follow.bilibili_id || follow.twitter_name);
    }

    static async getFollowUserIdAndTwitter (userId) {
        const sql = `
            SELECT
                t1.fuid,
                t2.account as twitter_name
            FROM follows t1
            LEFT JOIN user_accounts t2
                ON t2.uid = t1.fuid AND t2.platform = 'twitter'
            WHERE t1.uid = ? AND t1.status = 1;
        `
        const res = await Mysql.matataki.query(sql, [userId]);
        console.log('已关注的用户列表：', res)
        return res
    }

    static async getFollowBilibiliByUsesrId (userIds) {
        try {
            const res = await Axios.post(`https://auth.matataki.io/api/user/info/bilibili`, { list: userIds, apiToken: config.apiToken })
            console.log('已关注用户的B站用户列表：', res.data)
            return res.data
        }
        catch (e) {
            console.error('获取不到已关注的B站用户列表')
            return []
        }
    }

    static createValueList (list) {
        let str = ''
        list.forEach(item => {
            str += (str ? ',' : '') + '?'
        })
        return str
    }
}

class TimelineTestService {
    constructor() {}

    static async getSubscribedTimeline (userId, page = 1, pagesize = 20) {
        const follows = await this.getFollowUserIdAndTwitter(userId)
        if (!follows || !follows.length) {
            return { count: 0, list: [], code: 1001, error: 'Follow is empty' }
        }

        const bilibiliUesrs = await this.getFollowBilibiliByUsesrId(follows.map(follow => follow.fuid)).map(item => item.userId)
        const twitterUsesrs = follows.filter(follow => follow.twitter_name).map(follow => follow.twitter_name)
        const queryValues = [ ...bilibiliUesrs, ...twitterUsesrs ]
        console.log('最后参与查询的数据：', queryValues)

        if (!queryValues || !queryValues.length) {
            return { count: 0, list: [], code: 1002, error: 'Followers have no social accounts' }
        }

        const limitValues = [(page - 1) * pagesize, pagesize]

        const sqlBase = `
            platform_status_cache
            WHERE platform_user IN(${this.createValueList(queryValues)})
            ORDER BY timestamp DESC
        `
        const sql = `SELECT * FROM ${sqlBase} LIMIT ?, ?; SELECT COUNT(1) as count FROM ${sqlBase};`

        const res = await Mysql.cacheTest.query(sql, [ ...queryValues, ...limitValues, ...queryValues])
        console.log('数据库查询结果：', { count: res[1][0].count, list: res[0] })
        return {
            count: res[1][0].count,
            list: res[0]
        }
    }

    static async getStatusSubscriptionList (userId) {
        const sql = `
            SELECT
                t1.fuid as id,
                t2.account as twitter_name,
                t3.username,
                t3.nickname,
                t3.avatar,
                t3.introduction
            FROM follows t1
            LEFT JOIN user_accounts t2
                    ON t2.uid = t1.fuid AND t2.platform = 'twitter'
            LEFT JOIN users t3
                    ON t3.id = t1.fuid
            WHERE t1.uid = ? AND t1.status = 1;
        `;

        const follows = await Mysql.matatakiTest.query(sql, [userId]);

        const bilibiliUesrs = await this.getFollowBilibiliByUsesrId(follows.map(follow => follow.id));

        return follows.map(follow => {
            const bilibiliId = { ...bilibiliUesrs.find(bUser => bUser.id === follow.id) }.userId;
            return {
                ...follow,
                bilibili_id: bilibiliId || null
            };
        }).filter(follow => follow.bilibili_id || follow.twitter_name);
    }

    static async getFollowUserIdAndTwitter (userId) {
        const sql = `
            SELECT
                t1.fuid,
                t2.account as twitter_name
            FROM follows t1
            LEFT JOIN user_accounts t2
                ON t2.uid = t1.fuid AND t2.platform = 'twitter'
            WHERE t1.uid = ? AND t1.status = 1;
        `
        const res = await Mysql.matatakiTest.query(sql, [userId]);
        console.log('已关注的用户列表：', res)
        return res
    }

    static async getFollowBilibiliByUsesrId (userIds) {
        try {
            const res = await Axios.post(`https://auth.matataki.io/apitest/user/info/bilibili`, { list: userIds, apiToken: config.apiToken })
            console.log('已关注用户的B站用户列表：', res.data)
            return res.data
        }
        catch (e) {
            console.error('获取不到已关注的B站用户列表')
            return []
        }
    }

    static createValueList (list) {
        let str = ''
        list.forEach(item => {
            str += (str ? ',' : '') + '?'
        })
        return str
    }
}

module.exports = {
    TimelineService,
    TimelineTestService
}
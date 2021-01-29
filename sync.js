const Mysql = require('./src/database/mysql')

const fromDB = 'matataki'
const toDB = 'cache'

async function syncToDB () {
  const selectSql = `
    SELECT
      concat( 'matataki_', id ) AS id,
      'matataki' AS platform,
      uid AS platform_user,
      uid AS platform_user_id,
      create_time AS \`timestamp\`,
      id AS \`data\`
    FROM
      posts
    WHERE
      channel_id = 1
      AND STATUS = 0;
`

  const posts = await Mysql[fromDB].query(selectSql)

  if (!posts) throw new Error('查询不到需要同步的文章')
  if (!posts.length) throw new Error('需要同步的文章为空')

  const values = []
  let valuesSql = ''
  posts.forEach((post, index) => {
    values.push(
      post.id,
      post.platform,
      post.platform_user,
      post.platform_user_id,
      post.timestamp,
      post.data
    )
    if (index) valuesSql += ','
    valuesSql += '(?, ?, ?, ?, ?, ?)'
  })

  const insertSql = `
    SET FOREIGN_KEY_CHECKS = 0;

    INSERT INTO platform_status_cache (
      id,
      platform,
      platform_user,
      platform_user_id,
      \`timestamp\`,
      \`data\`
    )
    VALUES
      ${valuesSql}
    ON DUPLICATE KEY UPDATE
      id = id;

    SET FOREIGN_KEY_CHECKS = 1;
`

  const res = await Mysql[toDB].query(insertSql, values)
  console.log('文章同步的执行结果：', res)
  return res
}

function main () {
  syncToDB().then(res => {
    console.log('finished')
  })
}

main()

const mysql = require('mysql')

const config = {
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '12331',
    database: 'upload-file',
    connectTimeout: 5000
}

const connection = mysql.createConnection(config)

const querySql = (sql) => {
    const db = connection.connect()
    return new Promise((resolve, reject) => {
        try {
            db.query(sql, (err, res) => {
                if (err) {
                    reject(err)
                } else {
                    resolve(res)
                }
            })
        } catch (err) {
            reject(err)
        } finally {
            // 释放连接
            db.end()
        }
    })
}

module.exports = {
    db: connection,
    querySql
}

const express = require('express')
const path = require('path')
const fs = require("fs");
const { querySql, db } = require('../db/index')
const multer = require('multer');
const SparkMD5 = require('spark-md5')

const uploadDir = path.resolve('files')
const router = express.Router()
// 配置 multer 中间件来处理文件上传
const upload = multer();

// 分片文件临时缓冲区
const blobDir = './temporary-blobs'
// 文件所在最终文件夹
const publicDir = './public'
let file_name = ''

router.post('/chunkUpload', upload.any(), (req, res) => {
    const { name, uid, timestamp, file, chunk, count } = req.body
    file_name = name
    const {buffer, encoding, fileName, originalname, mimetype, size}  = req.files[0]
    const chunkDir = path.resolve(blobDir, `${chunk}-${uid}.mp4`)
    console.log('size', size)
    if (!fs.existsSync(path.resolve(blobDir))) {
        fs.mkdirSync(blobDir)
    }
    // 缓存区是否有该分片，没有则存入
    if (!fs.existsSync(chunkDir)) {
        fs.writeFileSync(chunkDir, buffer)
    }
    const chunkArr = fs.readdirSync(blobDir)
    console.log(count, chunkArr.length)
    if (chunkArr.length === Number(count)) {
        console.log('merge')
        mergeChunk()
    }

    res.header('Access-Control-Allow-Origin', 'http://localhost:63342')
    res.send({
        status: 200,
        data: {},
        msg: 'ok'
    })
})

router.post('/merge', (req, res) => {
    mergeChunk()
})
const mergeChunk = () => {
    // 合并分片
    if (!fs.existsSync(path.resolve(publicDir))) {
        fs.mkdirSync(publicDir)
    }
    if (!fs.existsSync(path.resolve(publicDir, file_name))) {
        fs.writeFileSync(`${publicDir}/${file_name}`, '')
    }
    const filepath = path.resolve(publicDir, file_name)
    const chunkArr = fs.readdirSync(blobDir).sort((pre, cur) => pre.split('-')[0] - cur.split('-')[0])
    const appendFile = chunkArr.map(filename => new Promise((resolve, reject) => {
        console.log(chunkArr, filename)
        const file = path.resolve(blobDir, filename)
        const blob = fs.readFileSync(file)
        fs.appendFileSync(filepath, blob)
        fs.unlinkSync(file)
        resolve()
    }).catch((err) => {
        console.log(err)
    }))
    Promise.all(appendFile).then(() => {
        console.log('merge success')
        // 合并成功，清除缓冲文件夹
        try {
            fs.rmdirSync(blobDir)
        } catch(err) {
            console.log(err)
        }
    }).catch((err) => {
        console.log(err)
    })
}

module.exports = router

const express = require('express')
const bodyParser = require('body-parser')
const cors = require('cors')

const app = express()
const routes = require('./routes')

app.use(bodyParser.urlencoded({
    extend: false
}))
app.use(bodyParser.json())
app.use('/', routes)
app.use(cors())

app.listen(9000, () => {
    console.log('service start in port:9000')
})

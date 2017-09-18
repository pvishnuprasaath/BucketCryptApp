const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const CryptoJS = require("crypto-js")
const routes=require('./routes/api')
const cors = require('cors')
const app = express()

app.use(bodyParser.json())
app.use(cors())
app.use('/api',routes)
app.use(express.static(path.join(__dirname,'public')))

app.get('*',function(req,res){
  res.redirect('/')
})

app.listen(process.env.PORT||8080, function () {
  console.log('Server started at port 8080')
})
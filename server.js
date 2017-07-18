const express = require('express')
const app = express()
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const secrets = require('./secrets')
const utils = require('./utils')
const Document = require('./models/Document')
const port = secrets.port
const ip = secrets.ip

app.use(express.static('public'))
app.use(bodyParser.urlencoded({extended: false}))
app.set('view engine', 'ejs')

mongoose.Promise = global.Promise
mongoose.connect(secrets.dbPath, {useMongoClient: true})

app.get('/', (req, res) => {
  res.render('client.ejs')
})

app.post('/encrypt', (req, res) => {
  var text = req.body.text
  var response = {}

  utils.encrypt(text)
  .then((result) => {
    response.key = result.key
    response.count = result.count
    return new Document({data: utils.byteArrayToHex(result.encrypted)}).save()
  })
  .then((document) => {
    if (document) {
      response.success = true
      response.id = document._id
    } else {
      response = {success: false}
    }
  })
  .catch((err) => {
    console.log(err)
    response = {success: false}
  })
  .then(() => {
    res.json(response)
  })
})

app.post('/decrypt', (req, res) => {
  var id = req.body.id
  var key = req.body.key
  var count = req.body.count

  utils.decrypt(id, key, count)
  .then((result) => {
    res.json({success: true, message: result})
  })
  .catch((err) => {
    res.json({success: false, message: err.message})
  })
})

app.get('/:id([A-Fa-f0-9]{24})', (req, res) => {
  var id = req.params.id
  var key = req.query.key
  var count = req.query.count

  utils.decrypt(id, key, count)
  .then((result) => {
    res.render('decrypt.ejs', {message: result})
  })
  .catch((err) => {
    res.render('sorry.ejs', {message: err.message})
  })
})

app.use((req, res, next) => {
  if (!req.route) {
    res.redirect('/')
  }
  next()
})

app.use((err, req, res, next) => {
  console.error(err)
  res.status(500).render('sorry.ejs', {message: 'something went wrong, try again later'})
  next()
})

app.listen(port, ip, () => {
  console.log('Burn After Reading running on ' + ip + ':' + port)
})

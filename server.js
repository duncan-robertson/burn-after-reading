const express = require('express')
const app = express()
const aesjs = require('aes-js')
const crypto = require('crypto')
const mongoose = require('mongoose')
const bodyParser = require('body-parser')
const secrets = require('./secrets')
const util = require('./util')
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
  var key
  var count
  var response = {}

  new Promise( (resolve, reject) => {
    if(text) {
      key = crypto.randomBytes(16)
      count = crypto.randomBytes(16)

      var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(count))
      text = aesjs.utils.utf8.toBytes(text)
      var encryptedBytes = aesCtr.encrypt(text)
      
      resolve(new Document({data: util.byteArrayToHex(encryptedBytes)}).save())
    } else {
      response.success = false
      reject('No data given to encrypt')
    }
  })
  .then( (document) => {
    if(document) {
      response.success = true
      response.id = document._id
      response.key = key.toString('hex')
      response.count = count.toString('hex')
    } else {
      response.success = false
    }  
  })
  .catch( (err) => {
    console.log(err)
    response.success = false
  })
  .then( () => {
    res.json(response)
  })
})

app.post('/decrypt', (req, res) => {
  var key = req.body.key
  var count = req.body.count
  var encrypted = req.body.encrypted
  var response = {}

  if(key && count && encrypted) {
    key = util.hexToByteArray(key)
    count = util.hexToByteArray(count)
    encrypted = util.hexToByteArray(encrypted)

    var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(count))
    var decrypted = aesjs.utils.utf8.fromBytes(aesCtr.decrypt(encrypted))

    response.success = true
    response.message = decrypted

  } else {
    response.success = false
    response.message = "Malformed request"
  }

  res.json(response)
})

app.get('/:id([A-Fa-f0-9]{24})', (req, res) => {
  var id = req.params.id
  var key = req.query.key
  var count = req.query.count

  Document.findById(id)
  .then( (result) => {
    if (result) {
      if(key && count) {
        key = util.hexToByteArray(key)
        count = util.hexToByteArray(count)

        var aesCtr = new aesjs.ModeOfOperation.ctr(key, new aesjs.Counter(count))
        var encrypted = util.hexToByteArray(result.data)
        var decrypted = aesjs.utils.utf8.fromBytes(aesCtr.decrypt(encrypted))

        res.render('decrypt.ejs', {message: decrypted})
        Document.remove(result)
        .catch( (err) => {
          console.log('There was an error removing message ' + id + ' from the database!')
          console.error(err)
        })
      } else {
        res.render('decrypt.ejs', {message: result.data})
      }  
    } else {
      res.render('sorry.ejs', {message: 'no entry exists for this page'})
    }
  })
  .catch( (err) => {
    console.log(err)
    res.render('sorry.ejs', {message: 'There was an error decrypting your data, try again later'})
  })
})

app.use( (req, res, next) => {
  if(!req.route) {
    res.redirect('/')
  }
  next()
})

app.use( (err, req, res, next) => {
  console.error(err)
  res.status(500).render('sorry.ejs', {message: 'something went wrong, try again later'})
  next()
})

app.listen(port, ip, () => {
  console.log('Burn After Reading running on ' + ip + ':' + port)
})

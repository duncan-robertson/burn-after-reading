const crypto = require('crypto')
const aesjs = require('aes-js')
const Ctr = aesjs.ModeOfOperation.ctr
const Document = require('./models/Document')

module.exports.encrypt = (text) => {
  return new Promise((resolve, reject) => {
    if (text) {
      var key = crypto.randomBytes(16)
      var count = crypto.randomBytes(16)

      var aesCtr = new Ctr(key, new aesjs.Counter(count))
      text = aesjs.utils.utf8.toBytes(text)

      var encryptedBytes = aesCtr.encrypt(text)
      resolve({encrypted: encryptedBytes, key: key.toString('hex'), count: count.toString('hex')})
    } else {
      reject(new Error('No data given to encrypt'))
    }
  })
}

module.exports.decrypt = (id, key, count) => {
  return Document.findById(id)
  .catch((err) => {
    console.log(err)
    return Promise.reject(new Error('There was an error decrypting your data, try again later'))
  })
  .then((result) => {
    if (result) {
      if (key && count) {
        key = hexToByteArray(key)
        count = hexToByteArray(count)

        var aesCtr = new Ctr(key, new aesjs.Counter(count))
        var encrypted = hexToByteArray(result.data)
        var decrypted = aesjs.utils.utf8.fromBytes(aesCtr.decrypt(encrypted))

        Document.remove(result)
        .catch((err) => {
          console.log('There was an error removing message ' + id + ' from the database!')
          console.error(err)
        })
        return Promise.resolve(decrypted)
      } else {
        return Promise.resolve(result.data)
      }
    } else {
      return Promise.reject(new Error('no entry exists for this page'))
    }
  })
}

var byteToHex = module.exports.byteToHex = (byte) => {
  var hex = byte.toString(16)
  hex = ('00' + hex).substr(-2)
  return hex
}

module.exports.byteArrayToHex = (byteArray) => {
  var hex = ''
  for (var i = 0; i < byteArray.length; i++) {
    hex += byteToHex(byteArray[i])
  }
  return hex
}

var hexToByteArray = module.exports.hexToByteArray = (hex) => {
  var rounds = hex.length / 2
  var byteArray = []

  for (var i = 0; i < rounds; i++) {
    var byte = hex.substr(i * 2, 2)
    byte = parseInt(byte, 16)
    byteArray[i] = byte
  }

  return byteArray
}

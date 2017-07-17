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

module.exports.hexToByteArray = (hex) => {
  var rounds = hex.length / 2
  var byteArray = []

  for (var i = 0; i < rounds; i++) {
    var byte = hex.substr(i * 2, 2)
    byte = parseInt(byte, 16)
    byteArray[i] = byte
  }

  return byteArray
}

const express = require('express')
const app = express()
const port = process.env.port || 3000
const ip = process.env.ip || '127.0.0.1'

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/client.html');
})

app.listen(port, ip, () => {
  console.log('Burn After Reading running on ' + ip + ':' + port)
})

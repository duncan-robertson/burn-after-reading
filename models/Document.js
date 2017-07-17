const mongoose = require('mongoose')
const Schema = mongoose.Schema

module.exports = mongoose.model('Document', new Schema({
    'data': String
}))
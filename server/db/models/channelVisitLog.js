const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('channelVisitLog', {
  socketId:{
    type:Sequelize.STRING,
  }
})

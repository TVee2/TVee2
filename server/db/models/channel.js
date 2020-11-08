const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('channel', {
  name:{
    type: Sequelize.STRING,
  },
})

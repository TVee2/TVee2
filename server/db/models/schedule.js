const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('schedule', {
  channel:{
    type: Sequelize.STRING,
  },
})

const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('comment', {
  content: {
    type: Sequelize.TEXT,
    allowNull: false
  },
  time:{
    type:Sequelize.DATE,
  }
})

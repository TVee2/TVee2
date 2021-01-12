const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('hashtag', {
  tag: {
    type: Sequelize.STRING,
    allowNull: false
  },
})

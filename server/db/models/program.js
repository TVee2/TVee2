const Sequelize = require('sequelize')
const db = require('../db')

module.exports = db.define('program', {
  duration: {
    type: Sequelize.STRING,
    allowNull: false
  },
  src: {
    type: Sequelize.STRING,
    allowNull: false
  },
  ad:{
    type: Sequelize.BOOLEAN,
    allowNull:false
  }
})
